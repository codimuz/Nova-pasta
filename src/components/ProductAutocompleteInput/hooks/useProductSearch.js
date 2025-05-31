import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { expoDbManager } from '../../../database/expo-manager';

const useProductSearch = (onProductSelect, options = {}) => {
  const {
    minChars = 1,
    debounceMs = 300,
    maxSuggestions = 5,
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

  // Função para buscar produtos
  const searchProducts = useCallback(async (searchTerm) => {
    if (searchTerm.trim().length < minChars) {
      setFilteredProducts([]);
      setShowSuggestions(false);
      setNoProductsFound(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setNoProductsFound(false);

    try {
      const filtered = await expoDbManager.fetchData('products', searchTerm);

      setFilteredProducts(filtered);
      setShowSuggestions(filtered.length > 0 || searchTerm.trim().length >= minChars);
      
      if (filtered.length === 0 && searchTerm.trim().length >= minChars) {
        setNoProductsFound(true);
      }
    } catch (error) {
      console.error('useProductSearch: Erro ao buscar produtos:', error);
      setSearchError('Erro ao buscar produtos. Tente novamente.');
      setFilteredProducts([]);
      setShowSuggestions(true); // Manter sugestões abertas para mostrar erro
      setNoProductsFound(false);
    } finally {
      setIsSearching(false);
    }
  }, [minChars]);

  // useEffect para debounce na busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(code);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [code, searchProducts, debounceMs]);

  // Função para alterar o código
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

  // Função para selecionar um produto
  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setCode(product.product_code);
    
    // Garantir que as sugestões sejam ocultadas imediatamente
    setShowSuggestions(false);
    setFilteredProducts([]);
    setNoProductsFound(false);
    setSearchError(null);
    setIsSearching(false);
    
    // Ocultar teclado
    Keyboard.dismiss();
    
    // Chamar callback
    if (onProductSelect) {
      onProductSelect(product);
    }
  }, [onProductSelect]);

  // Função para limpar busca
  const clearSearch = useCallback(() => {
    setCode('');
    setSelectedProduct(null);
    setFilteredProducts([]);
    setShowSuggestions(false);
    setNoProductsFound(false);
    setSearchError(null);
    setIsSearching(false);
    
    if (onProductSelect) {
      onProductSelect(null);
    }
  }, [onProductSelect]);

  // Função para focar no campo
  const handleFocus = useCallback(() => {
    if (filteredProducts.length > 0 || (code.trim().length >= minChars && noProductsFound)) {
      setShowSuggestions(true);
    }
  }, [filteredProducts.length, code, minChars, noProductsFound]);

  // Função para perder foco
  const handleBlur = useCallback(() => {
    // Delay para permitir seleção de item
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  }, []);

  // Função para destacar texto
  const highlightText = useCallback((text, searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '**$1**'); // Usar ** para destacar, será tratado no componente
  }, []);

  // Limitar sugestões exibidas
  const displayedProducts = filteredProducts.slice(0, maxSuggestions);

  return {
    // Estados
    code,
    selectedProduct,
    filteredProducts: displayedProducts,
    isSearching,
    showSuggestions,
    searchError,
    noProductsFound,
    
    // Funções
    handleCodeChange,
    selectProduct,
    clearSearch,
    handleFocus,
    handleBlur,
    highlightText,
    
    // Utilitários
    minimumCharsReached: code.trim().length >= minChars,
    hasResults: displayedProducts.length > 0,
    shouldShowMessage: code.trim().length >= minChars && (noProductsFound || searchError),
  };
};

export default useProductSearch;
