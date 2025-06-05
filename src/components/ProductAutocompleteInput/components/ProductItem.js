import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  List,
  Text,
  useTheme,
} from 'react-native-paper';

/**
 * Componente otimizado para renderização de item de produto no dropdown
 * Implementa memo para evitar re-renderizações desnecessárias
 */
const ProductItem = memo(({
  product,
  searchTerm = '',
  onSelect,
  isLast = false,
  highlightSearchTerm = true,
}) => {
  const theme = useTheme();

  /**
   * Manipula a seleção do produto
   */
  const handlePress = useCallback(() => {
    if (onSelect) {
      onSelect(product);
    }
  }, [product, onSelect]);

  /**
   * Destaca o termo de busca no texto
   */
  const highlightText = useCallback((text, term) => {
    if (!highlightSearchTerm || !term || term.length < 2) {
      return text;
    }

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      const isHighlight = regex.test(part);
      return {
        text: part,
        highlighted: isHighlight,
        key: `${index}-${part}`,
      };
    });
  }, [highlightSearchTerm]);

  /**
   * Renderiza o texto com highlight
   */
  const renderHighlightedText = useCallback((text, term) => {
    const parts = highlightText(text, term);
    
    if (typeof parts === 'string') {
      return text;
    }

    return (
      <Text>
        {parts.map((part) => (
          <Text
            key={part.key}
            style={part.highlighted ? styles.highlightedText : null}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  }, [highlightText]);

  /**
   * Formata o preço de forma robusta
   */
  const formatPrice = useCallback((product) => {
    // Tentar diferentes campos de preço para máxima compatibilidade
    const priceValue = product.price || product.regular_price || product.club_price || 0;
    
    // Converter para número se for string
    const numPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
    
    // Verificar se é um número válido
    if (isNaN(numPrice) || numPrice <= 0) {
      return 'Preço não disponível';
    }
    
    return `R$ ${numPrice.toFixed(2)}`;
  }, []);

  /**
   * Determina o ícone baseado na relevância
   */
  const getRelevanceIcon = useCallback(() => {
    if (!product.searchScore) return null;
    if (product.searchScore > 0.8) return "check-circle";
    if (product.searchScore > 0.5) return "check-circle-outline";
    return "help-circle-outline";
  }, [product.searchScore]);

  // Formatar dados do produto
  const price = formatPrice(product);
  const description = `${product.product_code} • ${product.unit_type || 'UN'} • ${price}`;
  
  // Calcular opacidade baseada no score de relevância
  const opacity = product.searchScore ? Math.max(0.7, product.searchScore) : 1;

  return (
    <List.Item
      title={renderHighlightedText(product.product_name, searchTerm)}
      description={renderHighlightedText(description, searchTerm)}
      titleNumberOfLines={2}
      descriptionNumberOfLines={1}
      titleEllipsizeMode="tail"
      descriptionEllipsizeMode="tail"
      left={() => <List.Icon icon="package-variant" color={theme.colors.primary} />}
      right={() => (
        <View style={styles.relevanceContainer}>
          {getRelevanceIcon() && (
            <List.Icon
              icon={getRelevanceIcon()}
              color={theme.colors.primary}
            />
          )}
          <List.Icon icon="chevron-right" color={theme.colors.outline} />
        </View>
      )}
      onPress={handlePress}
      style={[
        styles.listItem,
        {
          backgroundColor: theme.colors.surface,
          opacity,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.outline,
        }
      ]}
      titleStyle={{
        color: theme.colors.onSurface,
        fontWeight: product.searchScore > 0.8 ? '600' : '400',
      }}
      descriptionStyle={{ color: theme.colors.outline }}
      accessibilityRole="button"
      accessibilityLabel={`Selecionar produto ${product.product_name}, código ${product.product_code}, preço ${price}`}
      accessibilityHint="Toque para selecionar este produto"
      accessible={true}
    />
  );
});

ProductItem.displayName = 'ProductItem';

const styles = StyleSheet.create({
  relevanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 72, // Touch target mínimo para acessibilidade
    ...Platform.select({
      ios: {
        borderBottomWidth: StyleSheet.hairlineWidth,
      },
      android: {
        borderBottomWidth: 0.5,
      },
    }),
  },
  highlightedText: {
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 235, 59, 0.3)', // Amarelo claro para destaque
    borderRadius: 2,
    paddingHorizontal: 2,
  },
});

export default ProductItem;