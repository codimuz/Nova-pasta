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

/**
 * Hook simplificado para uso básico
 * @param {Function} onProductSelect - Callback para seleção de produto
 * @param {Object} config - Configuração (padrão: DEFAULT)
 * @returns {Object} - Estado e funções do hook
 */
export const useSimpleProductSearch = (onProductSelect, config = SEARCH_CONFIGS.DEFAULT) => {
  return useProductSearch(onProductSelect, config);
};
