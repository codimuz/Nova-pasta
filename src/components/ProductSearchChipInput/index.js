import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Chip, ActivityIndicator, useTheme } from 'react-native-paper';

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
      
      {/* Dropdown de resultados */}
      {isDropdownVisible && searchResults.length > 0 && !selectedProduct && (
        <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={[styles.dropdownHeader, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.dropdownHeaderText, { color: theme.colors.onPrimaryContainer }]}>
              {searchResults.length} produto{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          <ScrollView 
            style={styles.dropdownScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {searchResults.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleProductSelect(item)}
                style={[
                  styles.dropdownItem,
                  { backgroundColor: theme.colors.surface },
                  index !== searchResults.length - 1 && { 
                    borderBottomColor: theme.colors.outline, 
                    borderBottomWidth: 0.5 
                  }
                ]}
              >
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <View style={[styles.priceContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                      <Text style={[styles.priceText, { color: theme.colors.onSecondaryContainer }]}>
                        R$ {item.regularPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productDetails}>
                    <View style={styles.codeContainer}>
                      <Text style={[styles.codeLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Código:
                      </Text>
                      <Text style={[styles.codeText, { color: theme.colors.onSurfaceVariant }]}>
                        {item.productCode}
                      </Text>
                    </View>
                    <View style={[styles.unitTypeContainer, { backgroundColor: theme.colors.tertiaryContainer }]}>
                      <Text style={[styles.unitTypeText, { color: theme.colors.onTertiaryContainer }]}>
                        {item.unitType}
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
    top: 68,
    left: 0,
    right: 0,
    maxHeight: 300,
    zIndex: 1000,
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
  dropdownScroll: {
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
});

export default ProductSearchChipInput;
