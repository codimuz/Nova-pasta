import { useState, useEffect, useCallback, useRef } from 'react';
import { productService } from '../services/ProductService';

/**
 * Hook customizado para gerenciamento de produtos
 * Implementa cache otimizado, estados de loading/error e operações assíncronas
 */
const useProducts = (options = {}) => {
  const {
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutos
    initialLoad = true,
  } = options;

  // Estados principais
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Cache refs
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef(0);
  const abortControllerRef = useRef(null);

  /**
   * Limpa o cache de produtos
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    lastFetchRef.current = 0;
  }, []);

  /**
   * Verifica se o cache ainda é válido
   */
  const isCacheValid = useCallback(() => {
    if (!enableCache) return false;
    const now = Date.now();
    return (now - lastFetchRef.current) < cacheTimeout;
  }, [enableCache, cacheTimeout]);


  /**
   * Carrega todos os produtos do banco de dados
   */
  const loadProducts = useCallback(async (forceRefresh = false) => {
    // Verificar cache se não forçar refresh
    if (!forceRefresh && isCacheValid() && products.length > 0) {
      console.log('useProducts: Usando dados do cache');
      return products;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const productData = await productService.getAllProducts(!forceRefresh && enableCache);
      
      setProducts(productData);
      lastFetchRef.current = Date.now();
      
      // Atualizar cache local do hook
      if (enableCache) {
        cacheRef.current.set('all_products', productData);
      }
      
      console.log(`useProducts: ${productData.length} produtos carregados`);
      return productData;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('useProducts: Erro ao carregar produtos:', err);
        setError(err.message);
        
        // Fallback para produtos em cache se disponível
        const cachedProducts = cacheRef.current.get('all_products');
        if (cachedProducts && cachedProducts.length > 0) {
          console.log('useProducts: Usando produtos do cache como fallback');
          setProducts(cachedProducts);
          return cachedProducts;
        }
      }
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [products, isCacheValid, enableCache]);

  /**
   * Busca produtos por termo de pesquisa com cache
   */
  const searchProducts = useCallback(async (searchTerm, options = {}) => {
    const { maxResults = 10 } = options;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const normalizedTerm = searchTerm.trim().toLowerCase();
    const cacheKey = `search_${normalizedTerm}_${maxResults}`;
    
    // Verificar cache de busca
    if (enableCache && cacheRef.current.has(cacheKey)) {
      const cachedResult = cacheRef.current.get(cacheKey);
      if (cachedResult.timestamp && (Date.now() - cachedResult.timestamp) < cacheTimeout) {
        console.log(`useProducts: Usando busca em cache para "${searchTerm}"`);
        return cachedResult.data;
      }
    }

    try {
      const results = await productService.searchProducts(searchTerm, {
        maxResults,
        useCache: enableCache
      });
      
      // Salvar no cache local do hook
      if (enableCache) {
        cacheRef.current.set(cacheKey, {
          data: results,
          timestamp: Date.now()
        });
      }
      
      console.log(`useProducts: Busca por "${searchTerm}" retornou ${results.length} resultados`);
      return results;
    } catch (err) {
      console.error('useProducts: Erro na busca de produtos:', err);
      throw new Error(`Falha na busca: ${err.message}`);
    }
  }, [enableCache, cacheTimeout]);

  /**
   * Busca produto específico por código
   */
  const getProductByCode = useCallback(async (productCode) => {
    if (!productCode) return null;

    const cacheKey = `product_${productCode}`;
    
    // Verificar cache
    if (enableCache && cacheRef.current.has(cacheKey)) {
      const cachedProduct = cacheRef.current.get(cacheKey);
      if (cachedProduct.timestamp && (Date.now() - cachedProduct.timestamp) < cacheTimeout) {
        return cachedProduct.data;
      }
    }

    try {
      const product = await productService.getProductByCode(productCode, enableCache);
      
      // Salvar no cache local do hook
      if (enableCache && product) {
        cacheRef.current.set(cacheKey, {
          data: product,
          timestamp: Date.now()
        });
      }
      
      return product;
    } catch (err) {
      console.error('useProducts: Erro ao buscar produto por código:', err);
      throw new Error(`Falha ao buscar produto: ${err.message}`);
    }
  }, [enableCache, cacheTimeout]);

  /**
   * Adiciona um novo produto
   */
  const addProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);

      const productId = await productService.addProduct(productData);

      // Limpar cache para forçar atualização
      clearCache();
      
      // Recarregar produtos
      await loadProducts(true);
      
      console.log('useProducts: Produto adicionado com ID:', productId);
      return productId;
    } catch (err) {
      console.error('useProducts: Erro ao adicionar produto:', err);
      setError(`Falha ao adicionar produto: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCache, loadProducts]);

  /**
   * Atualiza um produto existente
   */
  const updateProduct = useCallback(async (productCode, updates) => {
    try {
      setLoading(true);
      setError(null);

      const success = await productService.updateProduct(productCode, updates);

      if (success) {
        // Limpar cache
        clearCache();
        
        // Recarregar produtos
        await loadProducts(true);
        
        console.log('useProducts: Produto atualizado');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('useProducts: Erro ao atualizar produto:', err);
      setError(`Falha ao atualizar produto: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCache, loadProducts]);

  /**
   * Remove um produto (soft delete)
   */
  const removeProduct = useCallback(async (productCode) => {
    try {
      setLoading(true);
      setError(null);

      const success = await productService.removeProduct(productCode);

      if (success) {
        // Limpar cache
        clearCache();
        
        // Recarregar produtos
        await loadProducts(true);
        
        console.log('useProducts: Produto removido (soft delete)');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('useProducts: Erro ao remover produto:', err);
      setError(`Falha ao remover produto: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCache, loadProducts]);

  /**
   * Recarrega dados forçando refresh
   */
  const refresh = useCallback(async () => {
    clearCache();
    productService.clearCache(); // Limpar cache do service também
    return await loadProducts(true);
  }, [clearCache, loadProducts]);

  /**
   * Obtém estatísticas dos produtos
   */
  const getStatistics = useCallback(async () => {
    try {
      return await productService.getProductStatistics();
    } catch (err) {
      console.error('useProducts: Erro ao obter estatísticas:', err);
      throw new Error(`Falha ao obter estatísticas: ${err.message}`);
    }
  }, []);

  /**
   * Importa produtos em lote
   */
  const importProducts = useCallback(async (productsData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await productService.importProducts(productsData);

      // Limpar cache e recarregar
      clearCache();
      await loadProducts(true);

      return result;
    } catch (err) {
      console.error('useProducts: Erro na importação:', err);
      setError(`Falha na importação: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCache, loadProducts]);

  /**
   * Verifica integridade dos dados
   */
  const checkIntegrity = useCallback(async () => {
    try {
      return await productService.checkDataIntegrity();
    } catch (err) {
      console.error('useProducts: Erro na verificação de integridade:', err);
      throw new Error(`Falha na verificação: ${err.message}`);
    }
  }, []);

  // Carregar produtos na inicialização
  useEffect(() => {
    if (initialLoad && !initialized) {
      loadProducts()
        .then(() => setInitialized(true))
        .catch((err) => {
          console.error('useProducts: Erro na inicialização:', err);
          setInitialized(true);
        });
    }
  }, [initialLoad, initialized, loadProducts]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Estados
    products,
    loading,
    error,
    initialized,
    
    // Operações de leitura
    loadProducts,
    searchProducts,
    getProductByCode,
    
    // Operações de escrita
    addProduct,
    updateProduct,
    removeProduct,
    importProducts,
    
    // Utilitários
    refresh,
    clearCache,
    getStatistics,
    checkIntegrity,
    
    // Informações do cache
    cacheSize: cacheRef.current.size,
    isCacheValid: isCacheValid(),
    lastFetch: lastFetchRef.current,
  };
};

export default useProducts;