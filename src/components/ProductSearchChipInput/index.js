import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, ScrollView } from 'react-native';
import { TextInput, Chip, Menu, List, ActivityIndicator, useTheme } from 'react-native-paper';
import { ProductService } from '../../services/ProductService';

const ProductSearchChipInput = ({
  label = "Buscar Produtos",
  placeholder = "Digite o nome do produto",
  selectedProduct,
  onProductSelect,
  error,
  mode = "outlined",
  style,
  ...props
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);

  // Instância do ProductService
  const productService = useRef(new ProductService()).current;

  // Função de busca integrada com ProductService
  const searchProducts = async (term) => {
    if (!term || term.length < 2) {
      return [];
    }

    try {
      console.log(`ProductSearchChipInput: Buscando produtos com termo "${term}"`);
      const results = await productService.searchProducts(term, { maxResults: 10 });
      console.log(`ProductSearchChipInput: ${results.length} produtos encontrados`);
      return results;
    } catch (error) {
      console.error('ProductSearchChipInput: Erro na busca de produtos:', error);
      return [];
    }
  };

  // Debounced search
  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Se tiver produto selecionado e começar a digitar, limpa a seleção
    if (selectedProduct && text) {
      onProductSelect?.(null);
    }

    if (!text || text.length < 2) {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    setIsLoading(true);
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchProducts(text);
        setSearchResults(results);
        setIsDropdownVisible(results.length > 0);
      } catch (error) {
        console.error('Erro na busca de produtos:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Selecionar produto
  const handleProductSelect = (product) => {
    onProductSelect?.(product);
    setSearchText('');
    setSearchResults([]);
    setIsDropdownVisible(false);
    inputRef.current?.blur();
  };

  // Remover produto selecionado
  const handleRemoveProduct = () => {
    onProductSelect?.(null);
    setSearchText('');
    inputRef.current?.focus();
  };

  // Renderizar chip do produto selecionado
  const renderSelectedProductChip = () => {
    if (!selectedProduct) return null;

    const icon = selectedProduct.unitType === 'KG' ? 'weight-kilogram' : 'package-variant';

    return (
      <View style={styles.chipContainer}>
        <Chip
          mode="flat"
          icon={icon}
          onClose={handleRemoveProduct}
          closeIconAccessibilityLabel="Remover produto"
        >
          {selectedProduct.productName} • R$ {selectedProduct.regularPrice.toFixed(2)}
        </Chip>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        label={label}
        mode={mode}
        placeholder={placeholder}
        value={searchText}
        onChangeText={handleSearch}
        onFocus={() => {
          if (searchResults.length > 0) {
            setIsDropdownVisible(true);
          }
        }}
        style={[styles.input, style]}
        error={error}
        right={isLoading ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
        {...props}
      />
      
      {selectedProduct && renderSelectedProductChip()}
      
      {/* Dropdown de resultados personalizado */}
      {isDropdownVisible && searchResults.length > 0 && !selectedProduct && (
        <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={[styles.dropdownHeader, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.dropdownHeaderText, { color: theme.colors.onPrimaryContainer }]}>
              {searchResults.length} produto{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          <ScrollView
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={true}
            bounces={false}
            nestedScrollEnabled={true}
          >
            {searchResults.map((product, index) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => handleProductSelect(product)}
                style={[
                  styles.dropdownItem,
                  { backgroundColor: theme.colors.surface },
                  index !== searchResults.length - 1 && { borderBottomColor: theme.colors.outline, borderBottomWidth: 0.5 }
                ]}
              >
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                      {product.productName}
                    </Text>
                    <View style={[styles.priceContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                      <Text style={[styles.priceText, { color: theme.colors.onSecondaryContainer }]}>
                        R$ {product.regularPrice?.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productDetails}>
                    <View style={styles.codeContainer}>
                      <Text style={[styles.codeLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Código:
                      </Text>
                      <Text style={[styles.codeText, { color: theme.colors.onSurfaceVariant }]}>
                        {product.productCode}
                      </Text>
                    </View>
                    <View style={[styles.unitTypeContainer, { backgroundColor: theme.colors.tertiaryContainer }]}>
                      <Text style={[styles.unitTypeText, { color: theme.colors.onTertiaryContainer }]}>
                        {product.unitType}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999,
  },
  input: {
    backgroundColor: 'transparent',
  },
  chipContainer: {
    marginTop: 4,
    marginBottom: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 68, // Altura do TextInput
    left: 0,
    right: 0,
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 998,
  },
  dropdownScroll: {
    maxHeight: 240, // Altura máxima da área scrollável
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  unitTypeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 30,
    alignItems: 'center',
  },
  unitTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dropdownHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dropdownHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ProductSearchChipInput;
