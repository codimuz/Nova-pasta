import React, { createContext, useContext, useCallback, useMemo } from 'react';
import useProducts from '../hooks/useProducts';

/**
 * Contexto para gerenciamento global de produtos
 * Fornece acesso centralizado aos dados de produtos em toda a aplicação
 */
const ProductsContext = createContext(null);

/**
 * Provider do contexto de produtos
 */
export const ProductsProvider = ({ children, options = {} }) => {
  const {
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutos
    initialLoad = true,
    ...restOptions
  } = options;

  // Usar o hook customizado com as opções fornecidas
  const productsState = useProducts({
    enableCache,
    cacheTimeout,
    initialLoad,
    ...restOptions,
  });

  /**
   * Busca produtos com debounce automático
   */
  const debouncedSearch = useCallback(
    debounce(productsState.searchProducts, 300),
    [productsState.searchProducts]
  );

  /**
   * Estatísticas dos produtos
   */
  const statistics = useMemo(() => {
    const { products } = productsState;
    
    if (!products || products.length === 0) {
      return {
        total: 0,
        byUnitType: {},
        priceRange: { min: 0, max: 0, average: 0 },
      };
    }

    const total = products.length;
    const byUnitType = products.reduce((acc, product) => {
      const unitType = product.unit_type || 'UN';
      acc[unitType] = (acc[unitType] || 0) + 1;
      return acc;
    }, {});

    const prices = products
      .map(p => p.price || 0)
      .filter(price => price > 0);
    
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      average: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
    };

    return {
      total,
      byUnitType,
      priceRange,
    };
  }, [productsState.products]);

  /**
   * Funções utilitárias
   */
  const utils = useMemo(() => ({
    /**
     * Verifica se um produto existe pelo código
     */
    hasProduct: (productCode) => {
      return productsState.products.some(p => p.product_code === productCode);
    },

    /**
     * Filtra produtos por critérios
     */
    filterProducts: (criteria) => {
      const { unitType, minPrice, maxPrice, searchTerm } = criteria;
      
      return productsState.products.filter(product => {
        // Filtro por tipo de unidade
        if (unitType && product.unit_type !== unitType) {
          return false;
        }
        
        // Filtro por preço mínimo
        if (minPrice !== undefined && (product.price || 0) < minPrice) {
          return false;
        }
        
        // Filtro por preço máximo
        if (maxPrice !== undefined && (product.price || 0) > maxPrice) {
          return false;
        }
        
        // Filtro por termo de busca
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchCode = (product.product_code || '').toLowerCase().includes(term);
          const matchName = (product.product_name || '').toLowerCase().includes(term);
          return matchCode || matchName;
        }
        
        return true;
      });
    },

    /**
     * Ordena produtos por critério
     */
    sortProducts: (sortBy = 'name', order = 'asc') => {
      const sorted = [...productsState.products].sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
          case 'name':
            valueA = (a.product_name || '').toLowerCase();
            valueB = (b.product_name || '').toLowerCase();
            break;
          case 'code':
            valueA = a.product_code || '';
            valueB = b.product_code || '';
            break;
          case 'price':
            valueA = a.price || 0;
            valueB = b.price || 0;
            break;
          case 'unitType':
            valueA = a.unit_type || '';
            valueB = b.unit_type || '';
            break;
          default:
            return 0;
        }
        
        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
      });
      
      return sorted;
    },
  }), [productsState.products]);

  // Valor do contexto
  const contextValue = useMemo(() => ({
    ...productsState,
    statistics,
    utils,
    debouncedSearch,
  }), [productsState, statistics, utils, debouncedSearch]);

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};

/**
 * Hook para usar o contexto de produtos
 */
export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  
  if (!context) {
    throw new Error('useProductsContext deve ser usado dentro de um ProductsProvider');
  }
  
  return context;
};

/**
 * Hook para usar apenas dados de produtos (sem operações)
 */
export const useProductsData = () => {
  const { products, loading, error, initialized } = useProductsContext();
  return { products, loading, error, initialized };
};

/**
 * Hook para usar apenas operações de produtos
 */
export const useProductsOperations = () => {
  const {
    loadProducts,
    searchProducts,
    getProductByCode,
    addProduct,
    updateProduct,
    removeProduct,
    refresh,
    clearCache,
    debouncedSearch,
  } = useProductsContext();
  
  return {
    loadProducts,
    searchProducts,
    getProductByCode,
    addProduct,
    updateProduct,
    removeProduct,
    refresh,
    clearCache,
    debouncedSearch,
  };
};

/**
 * Hook para usar utilitários de produtos
 */
export const useProductsUtils = () => {
  const { utils, statistics } = useProductsContext();
  return { ...utils, statistics };
};

/**
 * Função utilitária de debounce
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default ProductsContext;