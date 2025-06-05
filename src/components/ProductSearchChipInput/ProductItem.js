import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

const ProductItem = memo(({ item, index, onPress, isLast }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[
        styles.dropdownItem,
        { backgroundColor: theme.colors.surface },
        !isLast && { 
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
  );
});

ProductItem.displayName = 'ProductItem';

const styles = StyleSheet.create({
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

export default ProductItem;