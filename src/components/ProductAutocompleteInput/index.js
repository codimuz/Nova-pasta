/**
 * Barrel export para componentes de busca de produtos
 * Simplifica as importações e fornece uma API consistente
 */

// Componente principal
export { default as ProductSearchInput } from './ProductSearchInput';

// Componentes auxiliares
export { default as ProductSearchDropdown } from './ProductSearchDropdown';

// Hooks
export { default as useProductSearch } from './hooks/useProductSearch';

// Configurações padrão
export const DEFAULT_SEARCH_CONFIG = {
  minChars: 2,
  debounceMs: 300,
  maxSuggestions: 8,
  enableRealTimeFiltering: true,
  cacheResults: true,
};

// Configurações pré-definidas para diferentes cenários
export const SEARCH_CONFIGS = {
  /**
   * Configuração para busca rápida (ideal para mobile)
   */
  FAST: {
    minChars: 1,
    debounceMs: 200,
    maxSuggestions: 5,
    enableRealTimeFiltering: true,
    cacheResults: true,
  },

  /**
   * Configuração padrão (balanceada)
   */
  DEFAULT: {
    minChars: 2,
    debounceMs: 300,
    maxSuggestions: 8,
    enableRealTimeFiltering: true,
    cacheResults: true,
  },

  /**
   * Configuração para busca detalhada (mais resultados)
   */
  DETAILED: {
    minChars: 2,
    debounceMs: 400,
    maxSuggestions: 15,
    enableRealTimeFiltering: true,
    cacheResults: true,
  },

  /**
   * Configuração para dispositivos com pouca memória
   */
  LOW_MEMORY: {
    minChars: 3,
    debounceMs: 500,
    maxSuggestions: 5,
    enableRealTimeFiltering: false,
    cacheResults: false,
  },
};

// Configurações de performance para diferentes cenários
export const PERFORMANCE_CONFIGS = {
  /**
   * Configuração leve para dispositivos com pouca memória
   */
  LIGHT: {
    virtualizedList: false,
    maxSuggestions: 5,
    debounceMs: 500,
    initialNumToRender: 3,
    maxToRenderPerBatch: 2,
    windowSize: 5,
  },
  
  /**
   * Configuração balanceada para uso geral
   */
  BALANCED: {
    virtualizedList: true,
    maxSuggestions: 10,
    debounceMs: 300,
    initialNumToRender: 8,
    maxToRenderPerBatch: 5,
    windowSize: 10,
  },
  
  /**
   * Configuração de alta performance para dispositivos potentes
   */
  PERFORMANCE: {
    virtualizedList: true,
    maxSuggestions: 20,
    debounceMs: 200,
    lazyLoading: true,
    initialNumToRender: 12,
    maxToRenderPerBatch: 8,
    windowSize: 15,
  },
};

/**
 * Hook simplificado para uso básico
 * @param {Function} onProductSelect - Callback para seleção de produto
 * @param {Object} config - Configuração (padrão: DEFAULT)
 * @returns {Object} - Estado e funções do hook
 */
export const useSimpleProductSearch = (onProductSelect, config = SEARCH_CONFIGS.DEFAULT) => {
  return useProductSearch(onProductSelect, config);
};

/**
 * Hook otimizado com configurações de performance
 * @param {Function} onProductSelect - Callback para seleção de produto
 * @param {Object} performanceConfig - Configuração de performance
 * @returns {Object} - Estado e funções do hook otimizado
 */
export const useOptimizedProductSearch = (onProductSelect, performanceConfig = PERFORMANCE_CONFIGS.BALANCED) => {
  const searchConfig = {
    ...SEARCH_CONFIGS.DEFAULT,
    maxSuggestions: performanceConfig.maxSuggestions,
    debounceMs: performanceConfig.debounceMs,
    enableRealTimeFiltering: performanceConfig.virtualizedList,
    cacheResults: true,
  };
  
  return useProductSearch(onProductSelect, searchConfig);
};
