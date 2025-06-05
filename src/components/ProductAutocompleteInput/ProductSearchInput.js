import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  TextInput,
  Chip,
  useTheme,
  Portal,
} from 'react-native-paper';

import ProductSearchDropdown from './ProductSearchDropdown';
import useProductSearch from './hooks/useProductSearch';

/**
 * Componente principal de busca e seleção de produtos
 * Integra input de texto, dropdown de sugestões e chip de produto selecionado
 */
const ProductSearchInput = memo(({
  onProductSelect,
  placeholder = "Digite código ou nome do produto",
  label = "Buscar Produto",
  searchConfig = {},
  style,
  disabled = false,
  autoFocus = false,
  dropdownMaxHeight,
  showRefreshButton = true,
  highlightSearchTerm = true,
  ...textInputProps
}) => {
  const theme = useTheme();

  // Configuração padrão para busca
  const defaultSearchConfig = useMemo(() => ({
    minChars: 2,
    debounceMs: 300,
    maxSuggestions: 8,
    enableRealTimeFiltering: true,
    cacheResults: true,
    ...searchConfig,
  }), [searchConfig]);

  /**
   * Hook de busca de produtos
   */
  const {
    code,
    selectedProduct,
    filteredProducts,
    isSearching,
    showSuggestions,
    searchError,
    noProductsFound,
    isFocused,
    handleCodeChange,
    selectProduct,
    clearSearch,
    handleFocus,
    handleBlur,
    minimumCharsReached,
    hasResults,
    forceRefresh,
    loadMoreProducts,
    canLoadMore,
    cacheSize,
    loadedCount,
    totalResults,
  } = useProductSearch(onProductSelect, defaultSearchConfig);

  /**
   * Manipula a seleção de produto do dropdown
   */
  const handleProductSelectFromDropdown = useCallback((product) => {
    selectProduct(product);
  }, [selectProduct]);

  /**
   * Manipula o refresh da busca
   */
  const handleRefresh = useCallback(() => {
    forceRefresh();
  }, [forceRefresh]);

  /**
   * Manipula a remoção do produto selecionado
   */
  const handleClearSelection = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  /**
   * Estilo do container principal
   */
  const containerStyle = useMemo(() => [
    styles.container,
    style,
  ], [style]);

  /**
   * Renderiza o chip do produto selecionado
   */
  const renderSelectedProductChip = useMemo(() => {
    if (!selectedProduct) return null;

    // Função auxiliar para formatar preço de forma robusta
    const formatPrice = (product) => {
      // Tentar diferentes campos de preço para máxima compatibilidade
      const priceValue = product.price || product.regular_price || product.club_price || 0;
      
      // Converter para número se for string
      const numPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
      
      // Verificar se é um número válido
      if (isNaN(numPrice) || numPrice <= 0) {
        return 'Preço não disponível';
      }
      
      return `R$ ${numPrice.toFixed(2)}`;
    };

    const price = formatPrice(selectedProduct);
    const unitType = selectedProduct.unit_type || 'UN';

    return (
      <View style={styles.chipContainer}>
        <Chip
          icon="package-variant"
          onClose={handleClearSelection}
          closeIcon="close-circle"
          mode="outlined"
          style={[
            styles.productChip,
            { 
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.primary,
            }
          ]}
          textStyle={{ 
            color: theme.colors.onPrimaryContainer,
            fontSize: 14,
          }}
          accessibilityLabel={`Produto selecionado: ${selectedProduct.product_name}`}
          accessibilityHint="Toque no X para remover a seleção"
          accessible={true}
        >
          {`${selectedProduct.product_name} • ${unitType} • ${price}`}
        </Chip>
      </View>
    );
  }, [selectedProduct, theme, handleClearSelection]);

  /**
   * Renderiza o campo de busca
   */
  const renderSearchInput = useMemo(() => {
    if (selectedProduct) return null;

    return (
      <View style={styles.searchContainer}>
        <TextInput
          label={label}
          placeholder={placeholder}
          value={code}
          onChangeText={handleCodeChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          mode="outlined"
          disabled={disabled}
          autoFocus={autoFocus}
          onSubmitEditing={() => {
            // Verifica se há correspondência exata com algum produto
            if (filteredProducts.length > 0 && code.trim()) {
              const exactMatch = filteredProducts.find(product => {
                const shortEan = product.short_ean_code || '';
                return shortEan === code.trim();
              });
              if (exactMatch) {
                handleProductSelectFromDropdown(exactMatch);
              }
            }
          }}
          right={
            <TextInput.Icon
              icon={code ? (isSearching ? "loading" : "close-circle") : "magnify"}
              disabled={disabled}
              iconColor={theme.colors.primary}
              onPress={() => {
                if (code && !isSearching) {
                  clearSearch();
                }
              }}
            />
          }
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surface,
            }
          ]}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.outline}
          accessibilityLabel={`${label} - Campo de busca de produtos`}
          accessibilityHint="Digite código ou nome para buscar produtos"
          accessible={true}
          {...textInputProps}
        />

        <Portal>
          <ProductSearchDropdown
            visible={showSuggestions && !disabled}
            products={filteredProducts}
            isSearching={isSearching}
            searchError={searchError}
            noProductsFound={noProductsFound}
            searchTerm={code}
            onProductSelect={handleProductSelectFromDropdown}
            onRefresh={showRefreshButton ? handleRefresh : undefined}
            onLoadMore={loadMoreProducts}
            canLoadMore={canLoadMore}
            maxHeight={dropdownMaxHeight}
            highlightSearchTerm={highlightSearchTerm}
            loadedCount={loadedCount}
            totalResults={totalResults}
          />
        </Portal>
      </View>
    );
  }, [
    selectedProduct,
    label,
    placeholder,
    code,
    handleCodeChange,
    handleFocus,
    handleBlur,
    disabled,
    autoFocus,
    isSearching,
    theme,
    textInputProps,
    showSuggestions,
    filteredProducts,
    searchError,
    noProductsFound,
    handleProductSelectFromDropdown,
    showRefreshButton,
    handleRefresh,
    dropdownMaxHeight,
    highlightSearchTerm,
  ]);

  /**
   * Informações de debug (apenas em desenvolvimento)
   */
  const debugInfo = useMemo(() => {
    if (__DEV__) {
      return {
        cacheSize,
        hasResults,
        minimumCharsReached,
        isSearching,
        showSuggestions,
        filteredProductsCount: filteredProducts.length,
        isFocused,
      };
    }
    return null;
  }, [
    cacheSize,
    hasResults,
    minimumCharsReached,
    isSearching,
    showSuggestions,
    filteredProducts.length,
    isFocused,
  ]);

  // Log de debug em desenvolvimento
  if (__DEV__ && debugInfo) {
    console.log('ProductSearchInput Debug:', debugInfo);
  }

  return (
    <View style={containerStyle}>
      {renderSelectedProductChip}
      {renderSearchInput}
    </View>
  );
});

ProductSearchInput.displayName = 'ProductSearchInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000, // Simplificado - base z-index para o container
    ...Platform.select({
      ios: {
        zIndex: 1000,
      },
      android: {
        elevation: 1000,
      },
    }),
  },
  chipContainer: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 999, // Chip fica abaixo do container
    ...Platform.select({
      ios: {
        zIndex: 999,
      },
      android: {
        elevation: 999,
      },
    }),
  },
  productChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 998, // Container de busca fica abaixo ainda
    ...Platform.select({
      ios: {
        zIndex: 998,
      },
      android: {
        elevation: 998,
      },
    }),
  },
  textInput: {
    backgroundColor: 'transparent',
  },
});

export default ProductSearchInput;
