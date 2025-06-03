import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {
  List,
  Surface,
  ActivityIndicator,
  Text,
  Button,
  Divider,
  useTheme,
} from 'react-native-paper';

const { height: screenHeight } = Dimensions.get('window');

/**
 * Componente de dropdown otimizado para busca de produtos
 * Implementa virtualização, highlight de texto e estados de loading/erro
 */
const ProductSearchDropdown = memo(({
  visible,
  products = [],
  isSearching = false,
  searchError = null,
  noProductsFound = false,
  searchTerm = '',
  onProductSelect,
  onRefresh,
  onClose,
  maxHeight = Math.min(screenHeight * 0.6, screenHeight - 200),
  highlightSearchTerm = true,
}) => {
  const theme = useTheme();

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
   * Manipula a seleção de um produto
   */
  const handleProductSelect = useCallback((product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  }, [onProductSelect]);

  /**
   * Manipula o refresh da busca
   */
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  /**
   * Renderiza o estado de carregamento
   */
  const renderLoadingState = useMemo(() => (
    <List.Item
      title="Buscando produtos..."
      titleNumberOfLines={1}
      left={() => <ActivityIndicator size="small" color={theme.colors.primary} />}
      style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
      titleStyle={{ color: theme.colors.onSurface }}
      accessibilityLabel="Carregando resultados da busca"
      accessible={true}
    />
  ), [theme]);

  /**
   * Renderiza o estado de erro
   */
  const renderErrorState = useMemo(() => (
    <View>
      <List.Item
        title="Erro na busca"
        description={searchError}
        titleNumberOfLines={1}
        descriptionNumberOfLines={2}
        titleEllipsizeMode="tail"
        descriptionEllipsizeMode="tail"
        left={() => <List.Icon icon="alert-circle" color={theme.colors.error} />}
        style={[styles.listItem, { backgroundColor: theme.colors.errorContainer }]}
        titleStyle={{ color: theme.colors.onErrorContainer }}
        descriptionStyle={{ color: theme.colors.onErrorContainer }}
        accessibilityLabel={`Erro na busca: ${searchError}`}
        accessible={true}
      />
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.errorContainer }]}>
        <Button
          mode="text"
          onPress={handleRefresh}
          icon="refresh"
          compact
          textColor={theme.colors.onErrorContainer}
        >
          Tentar Novamente
        </Button>
      </View>
    </View>
  ), [searchError, theme, handleRefresh]);

  /**
   * Renderiza o estado sem resultados
   */
  const renderNoResultsState = useMemo(() => (
    <View>
      <List.Item
        title="Nenhum produto encontrado"
        description={`Para "${searchTerm}"`}
        titleNumberOfLines={1}
        descriptionNumberOfLines={1}
        titleEllipsizeMode="tail"
        descriptionEllipsizeMode="tail"
        left={() => <List.Icon icon="magnify" color={theme.colors.outline} />}
        style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
        titleStyle={{ color: theme.colors.onSurface }}
        descriptionStyle={{ color: theme.colors.outline }}
        accessibilityLabel={`Nenhum produto encontrado para ${searchTerm}`}
        accessible={true}
      />
      <Divider style={{ backgroundColor: theme.colors.outline }} />
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="text"
          onPress={handleRefresh}
          icon="refresh"
          compact
          textColor={theme.colors.primary}
        >
          Atualizar Lista
        </Button>
      </View>
    </View>
  ), [searchTerm, theme, handleRefresh]);

  /**
   * Renderiza um item de produto
   */
  const renderProductItem = useCallback((product) => {
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

    const price = formatPrice(product);
    const description = `${product.product_code} • ${product.unit_type || 'UN'} • ${price}`;
    
    // Calcula a opacidade baseada no score de relevância
    const opacity = product.searchScore ? Math.max(0.7, product.searchScore) : 1;
    
    // Determina o ícone baseado na relevância
    const getRelevanceIcon = () => {
      if (!product.searchScore) return null;
      if (product.searchScore > 0.8) return "check-circle";
      if (product.searchScore > 0.5) return "check-circle-outline";
      return "help-circle-outline";
    };

    return (
      <List.Item
        key={product.product_code}
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
        onPress={() => handleProductSelect(product)}
        style={[
          styles.listItem,
          {
            backgroundColor: theme.colors.surface,
            opacity,
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
  }, [searchTerm, theme, handleProductSelect, renderHighlightedText]);

  /**
   * Renderiza a lista de produtos
   */
  const renderProductsList = useMemo(() => {
    if (products.length === 0) {
      return null;
    }

    return products.map(renderProductItem);
  }, [products, renderProductItem]);

  // Não renderizar se não visível
  if (!visible) {
    return null;
  }

  // Determinar conteúdo a ser exibido
  const shouldShowContent = isSearching || searchError || noProductsFound || products.length > 0;

  if (!shouldShowContent) {
    return null;
  }

  return (
    <View style={[styles.container, { maxHeight }]}>
      <Surface 
        elevation={8} 
        style={[
          styles.surface, 
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Estado de carregamento */}
          {isSearching && renderLoadingState}

          {/* Estado de erro */}
          {searchError && !isSearching && renderErrorState}

          {/* Estado sem resultados */}
          {noProductsFound && !isSearching && !searchError && renderNoResultsState}

          {/* Lista de produtos */}
          {!isSearching && !searchError && !noProductsFound && renderProductsList}
        </ScrollView>

        {/* Botão de fechar se necessário */}
        {onClose && (
          <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
            <Divider style={{ backgroundColor: theme.colors.outline }} />
            <Button
              mode="text"
              onPress={onClose}
              icon="close"
              compact
              textColor={theme.colors.outline}
            >
              Fechar
            </Button>
          </View>
        )}
      </Surface>
    </View>
  );
});

ProductSearchDropdown.displayName = 'ProductSearchDropdown';

const styles = StyleSheet.create({
  relevanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999, // Para Android
    marginTop: 4,
    // Garante que o dropdown fique sobre TODOS os elementos
    ...Platform.select({
      ios: {
        // iOS precisa de um z-index extremamente alto
        zIndex: 999999,
      },
      android: {
        // Android precisa de elevation muito alta
        elevation: 999999,
      },
    }),
  },
  surface: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden', // Garante que o conteúdo respeite o borderRadius
    // Sombras mais pronunciadas para melhor hierarquia visual
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  scrollView: {
    maxHeight: '100%',
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 64, // Touch target mínimo para acessibilidade
  },
  actionContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  highlightedText: {
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 235, 59, 0.3)', // Amarelo claro para destaque
  },
});

export default ProductSearchDropdown;