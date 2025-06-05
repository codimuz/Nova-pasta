import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Chip, ActivityIndicator, useTheme, Modal, Portal } from 'react-native-paper';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { database } from '../../database';


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
  const productsCollection = useMemo(() => database.get('products'), []);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);
  const subscription = useRef(null);

  useEffect(() => {
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
    };
  }, []);

  const searchProducts = async (term) => {
    if (!term || term.length < 2) {
      return [];
    }

    const termLower = term.toLowerCase();
    
    try {
      const query = productsCollection.query(
        Q.or(
          Q.where('product_name', Q.like(`%${Q.sanitizeLikeString(termLower)}%`)),
          Q.where('product_code', Q.like(`%${Q.sanitizeLikeString(term)}%`))
        ),
        Q.where('deleted_at', null),
        Q.take(5)
      );

      if (subscription.current) {
        subscription.current.unsubscribe();
      }

      const results = await query.fetch();
      return results;
    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      return [];
    }
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

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

  const handleProductSelect = (product) => {
    onProductSelect?.(product);
    setSearchText('');
    setSearchResults([]);
    setIsDropdownVisible(false);
    inputRef.current?.blur();
  };

  const handleRemoveProduct = () => {
    onProductSelect?.(null);
    setSearchText('');
    inputRef.current?.focus();
  };

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

  const renderProductItem = (product, index, totalItems) => (
    <TouchableOpacity
      key={product.id}
      onPress={() => handleProductSelect(product)}
      style={[
        styles.dropdownItem,
        { backgroundColor: theme.colors.surface },
        index !== totalItems - 1 && {
          borderBottomColor: theme.colors.outline,
          borderBottomWidth: 0.5
        }
      ]}
    >
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={[styles.productName, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {product.productName}
          </Text>
          <View style={[styles.priceContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={[styles.priceText, { color: theme.colors.onSecondaryContainer }]}>
              R$ {product.regularPrice.toFixed(2)}
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
  );

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
      
      <Portal>
        <Modal
          visible={isDropdownVisible && searchResults.length > 0 && !selectedProduct}
          onDismiss={() => setIsDropdownVisible(false)}
          style={styles.modalContainer}
          contentContainerStyle={[
            styles.dropdown,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline
            }
          ]}
        >
          <View style={[styles.dropdownHeader, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.dropdownHeaderText, { color: theme.colors.onPrimaryContainer }]}>
              {searchResults.length} produto{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          <ScrollView
            style={styles.dropdownScroll}
            contentContainerStyle={styles.dropdownScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {searchResults.map((product, index) => 
              renderProductItem(product, index, searchResults.length)
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'transparent',
  },
  chipContainer: {
    marginTop: 4,
    marginBottom: 0,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 238,
    maxHeight: 300,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownScrollContent: {
    paddingBottom: 4,
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

const enhance = withObservables([], () => ({
  // Você pode adicionar observables aqui se precisar
}));

export default ProductSearchChipInput;