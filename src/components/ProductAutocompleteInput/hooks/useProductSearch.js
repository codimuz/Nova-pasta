import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { useProductsOperations } from '../../../contexts/ProductsContext';

/**
 * Hook otimizado para busca de produtos com filtragem em tempo real
 * Integrado com o contexto global de produtos e cache otimizado
 */
const useProductSearch = (onProductSelect, options = {}) => {
  const {
    minChars = 2,
    debounceMs = 300,
    maxSuggestions = 8,
    enableRealTimeFiltering = true,
    cacheResults = true,
  } = options;

  // Estados principais
  const [code, setCode] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Estados de UI
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [noProductsFound, setNoProductsFound] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Refs para controle
  const debounceTimeoutRef = useRef(null);
  const lastSearchRef = useRef('');
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Hook para operações de produtos
  const { searchProducts: searchProductsDB, debouncedSearch } = useProductsOperations();

  /**
   * Normaliza string para comparação (remove acentos, caracteres especiais e converte para lowercase)
   */
  const normalizeString = useCallback((str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[ç]/g, 'c')            // Converte ç para c
      .replace(/[^a-z0-9\s]/g, '')     // Remove caracteres especiais exceto espaços
      .trim();
  }, []);

  /**
   * Calcula a similaridade entre duas strings usando distância de Levenshtein
   */
  const calculateSimilarity = useCallback((str1, str2) => {
    const matrix = Array(str2.length + 1).fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitute = matrix[j - 1][i - 1] + (str1[i - 1] !== str2[j - 1] ? 1 : 0);
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          substitute           // substitution
        );
      }
    }

    // Normaliza a distância para um score de similaridade (0-1)
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (matrix[str2.length][str1.length] / maxLength);
  }, []);

  /**
   * Verifica se uma string é substring parcial de outra
   */
  const isPartialMatch = useCallback((searchStr, targetStr) => {
    const searchWords = searchStr.split(/\s+/);
    const targetWords = targetStr.split(/\s+/);
    
    return searchWords.every(searchWord =>
      targetWords.some(targetWord =>
        targetWord.includes(searchWord) ||
        calculateSimilarity(searchWord, targetWord) > 0.7
      )
    );
  }, [calculateSimilarity]);

  /**
   * Busca produtos de forma otimizada com cache e filtragem
   */
  const searchProducts = useCallback(async (searchTerm, useCache = true) => {
    const trimmedTerm = searchTerm.trim();
    
    // Validação do termo mínimo
    if (trimmedTerm.length < minChars) {
      setFilteredProducts([]);
      setShowSuggestions(false);
      setNoProductsFound(false);
      setSearchError(null);
      return;
    }

    // Verificar cache se habilitado
    if (useCache && cacheResults && cacheRef.current.has(trimmedTerm)) {
      const cachedResult = cacheRef.current.get(trimmedTerm);
      const isExpired = Date.now() - cachedResult.timestamp > 60000; // 1 minuto
      
      if (!isExpired) {
        console.log(`useProductSearch: Usando resultado em cache para "${trimmedTerm}"`);
        setFilteredProducts(cachedResult.data);
        setShowSuggestions(true);
        setNoProductsFound(cachedResult.data.length === 0);
        return cachedResult.data;
      }
    }

    // Cancelar busca anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setSearchError(null);
    setNoProductsFound(false);

    try {
      const results = await searchProductsDB(trimmedTerm, { 
        maxResults: maxSuggestions,
        signal: abortControllerRef.current.signal 
      });

      // Filtragem adicional em tempo real se habilitada
      let finalResults = results;
      if (enableRealTimeFiltering && trimmedTerm.length > 0) {
        const normalizedSearch = normalizeString(trimmedTerm);
        
        finalResults = results
          .map(product => {
            const normalizedCode = normalizeString(product.product_code || '');
            const normalizedName = normalizeString(product.product_name || '');
            const normalizedShortEan = normalizeString(product.short_ean_code || '');
            
            // Calcula scores de similaridade
            const codeScore = calculateSimilarity(normalizedSearch, normalizedCode);
            const nameScore = calculateSimilarity(normalizedSearch, normalizedName);
            const shortEanScore = calculateSimilarity(normalizedSearch, normalizedShortEan);
            
            // Verifica matches parciais
            const hasCodeMatch = isPartialMatch(normalizedSearch, normalizedCode);
            const hasNameMatch = isPartialMatch(normalizedSearch, normalizedName);
            const hasShortEanMatch = isPartialMatch(normalizedSearch, normalizedShortEan);
            
            // Verifica matches exatos para short_ean_code
            const hasExactShortEanMatch = normalizedShortEan === normalizedSearch;
            
            // Pontuação final baseada em matches exatos, parciais e similaridade
            const score = Math.max(
              hasCodeMatch ? 0.8 : codeScore,
              hasNameMatch ? 0.9 : nameScore,
              hasExactShortEanMatch ? 1 : hasShortEanMatch ? 0.95 : shortEanScore
            );

            return {
              ...product,
              searchScore: score
            };
          })
          .filter(product => product.searchScore > 0.3) // Filtra resultados com baixa relevância
          .sort((a, b) => b.searchScore - a.searchScore); // Ordena por relevância
      }

      // Limitar resultados
      const limitedResults = finalResults.slice(0, maxSuggestions);

      // Salvar no cache
      if (cacheResults) {
        cacheRef.current.set(trimmedTerm, {
          data: limitedResults,
          timestamp: Date.now()
        });
        
        // Limitar tamanho do cache (máximo 50 entradas)
        if (cacheRef.current.size > 50) {
          const oldestKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(oldestKey);
        }
      }

      setFilteredProducts(limitedResults);
      setShowSuggestions(true);
      setNoProductsFound(limitedResults.length === 0);
      
      console.log(`useProductSearch: Busca por "${trimmedTerm}" retornou ${limitedResults.length} resultados`);
      return limitedResults;

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('useProductSearch: Erro ao buscar produtos:', error);
        setSearchError('Erro ao buscar produtos. Tente novamente.');
        setFilteredProducts([]);
        setShowSuggestions(true);
        setNoProductsFound(false);
        
        // Fallback para cache em caso de erro
        if (cacheResults && cacheRef.current.has(trimmedTerm)) {
          const cachedResult = cacheRef.current.get(trimmedTerm);
          setFilteredProducts(cachedResult.data);
          setNoProductsFound(cachedResult.data.length === 0);
          setSearchError(null);
        }
      }
    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  }, [minChars, maxSuggestions, enableRealTimeFiltering, cacheResults, searchProductsDB, normalizeString]);

  /**
   * Debounce da busca
   */
  const debouncedSearchProducts = useCallback((searchTerm) => {
    // Cancelar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Busca imediata se termo é muito curto
    if (searchTerm.trim().length < minChars) {
      searchProducts(searchTerm);
      return;
    }

    // Debounce para termos válidos
    debounceTimeoutRef.current = setTimeout(() => {
      searchProducts(searchTerm);
      lastSearchRef.current = searchTerm;
    }, debounceMs);
  }, [searchProducts, debounceMs, minChars]);

  // Efeito para busca com debounce
  useEffect(() => {
    debouncedSearchProducts(code);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [code, debouncedSearchProducts]);

  /**
   * Função para alterar o código com validação e limpeza de estado
   */
  const handleCodeChange = useCallback((text) => {
    setCode(text);
    setSelectedProduct(null);
    setSearchError(null);
    
    if (text.trim().length === 0) {
      setFilteredProducts([]);
      setShowSuggestions(false);
      setNoProductsFound(false);
      setIsSearching(false);
    }
  }, []);

  /**
   * Função para selecionar um produto com otimizações
   */
  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setCode(product.product_code);
    
    // Garantir que as sugestões sejam ocultadas imediatamente
    setShowSuggestions(false);
    setFilteredProducts([]);
    setNoProductsFound(false);
    setSearchError(null);
    setIsSearching(false);
    setIsFocused(false);
    
    // Ocultar teclado
    Keyboard.dismiss();
    
    // Chamar callback
    if (onProductSelect) {
      onProductSelect(product);
    }
  }, [onProductSelect]);

  /**
   * Função para limpar busca completamente
   */
  const clearSearch = useCallback(() => {
    setCode('');
    setSelectedProduct(null);
    setFilteredProducts([]);
    setShowSuggestions(false);
    setNoProductsFound(false);
    setSearchError(null);
    setIsSearching(false);
    setIsFocused(false);
    
    // Cancelar timeouts pendentes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Cancelar busca pendente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (onProductSelect) {
      onProductSelect(null);
    }
  }, [onProductSelect]);

  /**
   * Função para focar no campo com controle de sugestões
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (filteredProducts.length > 0 || (code.trim().length >= minChars && noProductsFound)) {
      setShowSuggestions(true);
    }
  }, [filteredProducts.length, code, minChars, noProductsFound]);

  /**
   * Função para perder foco com delay para permitir seleção
   */
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay para permitir seleção de item antes de fechar sugestões
    setTimeout(() => {
      if (!isFocused) {
        setShowSuggestions(false);
      }
    }, 150);
  }, [isFocused]);

  /**
   * Função para destacar texto nas sugestões
   */
  const highlightText = useCallback((text, searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '**$1**'); // Usar ** para destacar, será tratado no componente
  }, []);

  /**
   * Função para limpar cache manualmente
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('useProductSearch: Cache de busca limpo');
  }, []);

  /**
   * Função para forçar nova busca sem cache
   */
  const forceRefresh = useCallback(() => {
    if (code.trim().length >= minChars) {
      searchProducts(code, false);
    }
  }, [code, minChars, searchProducts]);

  // Propriedades computadas
  const displayedProducts = useMemo(() => 
    filteredProducts.slice(0, maxSuggestions), 
    [filteredProducts, maxSuggestions]
  );

  const hasResults = useMemo(() => 
    displayedProducts.length > 0, 
    [displayedProducts.length]
  );

  const minimumCharsReached = useMemo(() => 
    code.trim().length >= minChars, 
    [code, minChars]
  );

  const shouldShowMessage = useMemo(() => 
    code.trim().length >= minChars && (noProductsFound || searchError), 
    [code, minChars, noProductsFound, searchError]
  );

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Estados
    code,
    selectedProduct,
    filteredProducts: displayedProducts,
    isSearching,
    showSuggestions,
    searchError,
    noProductsFound,
    isFocused,
    
    // Funções principais
    handleCodeChange,
    selectProduct,
    clearSearch,
    handleFocus,
    handleBlur,
    
    // Funções utilitárias
    highlightText,
    clearCache,
    forceRefresh,
    
    // Propriedades computadas
    minimumCharsReached,
    hasResults,
    shouldShowMessage,
    
    // Informações de debug
    cacheSize: cacheRef.current.size,
    lastSearch: lastSearchRef.current,
  };
};

export default useProductSearch;
