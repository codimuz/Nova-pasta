import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { TextInput, Chip, ActivityIndicator, useTheme, Portal } from 'react-native-paper';
import ProductItem from './ProductItem';

// Dados mockados para teste
const MOCK_PRODUCTS = [
  { id: 1, productCode: '0000000001234', productName: 'Açúcar Cristal 1KG', regularPrice: 4.50, unitType: 'KG' },
  { id: 2, productCode: '0000000005678', productName: 'Arroz Tipo 1 5KG', regularPrice: 22.90, unitType: 'KG' },
  { id: 3, productCode: '0000000009012', productName: 'Feijão Preto 1KG', regularPrice: 8.75, unitType: 'KG' },
  { id: 4, productCode: '0000000003456', productName: 'Leite Integral 1L', regularPrice: 5.20, unitType: 'UN' },
  { id: 5, productCode: '0000000007890', productName: 'Óleo de Soja 900ml', regularPrice: 6.80, unitType: 'UN' },
  { id: 6, productCode: '0000000004567', productName: 'Macarrão Espaguete 500g', regularPrice: 3.25, unitType: 'UN' },
  { id: 7, productCode: '0000000008901', productName: 'Café Torrado Moído 500g', regularPrice: 12.90, unitType: 'UN' },
  { id: 8, productCode: '0000000002345', productName: 'Farinha de Trigo 1KG', regularPrice: 4.20, unitType: 'KG' },
];

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

  // Função de busca com dados mockados
  const searchProducts = async (term) => {
    if (!term || term.length < 2) {
      return [];
    }

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 200));

    const filteredProducts = MOCK_PRODUCTS.filter(product =>
      product.productName.toLowerCase().includes(term.toLowerCase()) ||
      product.productCode.includes(term)
    ).slice(0, 5);

    return filteredProducts;
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
  const handleProductSelect = useCallback((product) => {
    onProductSelect?.(product);
    setSearchText('');
    setSearchResults([]);
    setIsDropdownVisible(false);
    inputRef.current?.blur();
  }, [onProductSelect]);

  // Renderizar item do dropdown
  const renderProductItem = useCallback(({ item, index }) => (
    <ProductItem
      item={item}
      index={index}
      onPress={handleProductSelect}
      isLast={index === searchResults.length - 1}
    />
  ), [handleProductSelect, searchResults.length]);

  // Key extractor para FlatList
  const keyExtractor = useCallback((item) => item.id.toString(), []);

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
      
      {/* Portal para dropdown isolado */}
      <Portal>
        {isDropdownVisible && searchResults.length > 0 && !selectedProduct && (
          <>
            {/* Overlay para fechar dropdown */}
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setIsDropdownVisible(false)}
            />
            
            {/* Dropdown com FlatList */}
            <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <View style={[styles.dropdownHeader, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.dropdownHeaderText, { color: theme.colors.onPrimaryContainer }]}>
                  {searchResults.length} produto{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
                </Text>
              </View>
              
              <FlatList
                data={searchResults}
                keyExtractor={keyExtractor}
                renderItem={renderProductItem}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="always"
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
                style={styles.dropdownList}
                getItemLayout={(data, index) => ({
                  length: 70,
                  offset: 70 * index,
                  index,
                })}
              />
            </View>
          </>
        )}
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
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
    top: 240,
    left: 15,
    right: 15,
    maxHeight: 300,
    zIndex: 999,
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
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdownList: {
    maxHeight: 240,
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
