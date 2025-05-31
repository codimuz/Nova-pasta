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
    cacheSize,
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

    const price = selectedProduct.regular_price 
      ? `R$ ${selectedProduct.regular_price.toFixed(2)}` 
      : 'Preço não definido';

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
          {`${selectedProduct.product_name} • ${selectedProduct.unit_type || 'UN'} • ${price}`}
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

        <ProductSearchDropdown
          visible={showSuggestions && !disabled}
          products={filteredProducts}
          isSearching={isSearching}
          searchError={searchError}
          noProductsFound={noProductsFound}
          searchTerm={code}
          onProductSelect={handleProductSelectFromDropdown}
          onRefresh={showRefreshButton ? handleRefresh : undefined}
          maxHeight={dropdownMaxHeight}
          highlightSearchTerm={highlightSearchTerm}
        />
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
    zIndex: 99999, // Base z-index muito alto para o container
    ...Platform.select({
      ios: {
        zIndex: 99999,
      },
      android: {
        elevation: 99999,
      },
    }),
  },
  chipContainer: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 99998, // Mantém hierarquia com o container
    ...Platform.select({
      ios: {
        zIndex: 99998,
      },
      android: {
        elevation: 99998,
      },
    }),
  },
  productChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 99997, // Container de busca mantém hierarquia
    ...Platform.select({
      ios: {
        zIndex: 99997,
      },
      android: {
        elevation: 99997,
      },
    }),
  },
  textInput: {
    backgroundColor: 'transparent',
  },
});

export default ProductSearchInput;