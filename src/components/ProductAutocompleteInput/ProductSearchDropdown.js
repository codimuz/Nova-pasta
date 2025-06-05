import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
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
import ProductItem from './components/ProductItem';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Constantes de performance
const ITEM_HEIGHT = 72;
const INITIAL_NUM_TO_RENDER = 8;
const MAX_TO_RENDER_PER_BATCH = 5;
const WINDOW_SIZE = 10;

/**
 * Componente de dropdown otimizado para busca de produtos
 * Implementa FlatList virtualizada, altura dinâmica e lazy loading
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
  onLoadMore,
  onClose,
  maxHeight,
  highlightSearchTerm = true,
  canLoadMore = false,
  loadedCount = 0,
  totalResults = 0,
}) => {
  const theme = useTheme();
  
  /**
   * Calcula altura dinâmica baseada no conteúdo - otimizada para rolagem
   */
  const calculateOptimalHeight = useMemo(() => {
    // Se maxHeight foi fornecido explicitamente, usar ele
    if (maxHeight) {
      if (__DEV__) {
        console.log('ProductSearchDropdown: Usando maxHeight fornecido:', maxHeight);
      }
      return maxHeight;
    }

    // Calcular altura baseada no número de itens e estado atual
    const headerFooterPadding = 40; // Espaço para headers/footers/padding
    const maxScreenHeight = screenHeight * 0.6; // Máximo 60% da tela
    const minDropdownHeight = ITEM_HEIGHT * 2.5; // Mínimo para mostrar pelo menos 2 itens completos
    
    // Se estiver carregando, erro ou sem resultados, usar altura mínima
    if (isSearching || searchError || noProductsFound || products.length === 0) {
      const calculatedHeight = Math.min(minDropdownHeight, maxScreenHeight);
      if (__DEV__) {
        console.log('ProductSearchDropdown: Altura para estado especial:', calculatedHeight);
      }
      return calculatedHeight;
    }
    
    // Calcular altura ideal baseada no número de produtos
    const maxVisibleItems = Math.floor((maxScreenHeight - headerFooterPadding) / ITEM_HEIGHT);
    const visibleItems = Math.min(products.length, maxVisibleItems);
    const idealHeight = (visibleItems * ITEM_HEIGHT) + headerFooterPadding;
    
    // Garantir que a altura esteja dentro dos limites
    const finalHeight = Math.max(
      Math.min(idealHeight, maxScreenHeight),
      minDropdownHeight
    );
    
    if (__DEV__) {
      console.log('ProductSearchDropdown: Cálculo de altura:', {
        products: products.length,
        screenHeight,
        maxScreenHeight,
        maxVisibleItems,
        visibleItems,
        idealHeight,
        finalHeight,
      });
    }
    
    return finalHeight;
  }, [products.length, screenHeight, maxHeight, isSearching, searchError, noProductsFound]);

  /**
   * Função para carregar mais itens (lazy loading)
   */
  const handleLoadMore = useCallback(() => {
    if (canLoadMore && !isSearching && onLoadMore) {
      onLoadMore();
    }
  }, [canLoadMore, isSearching, onLoadMore]);

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
   * Renderiza um item otimizado da lista
   */
  const renderProductItem = useCallback(({ item, index }) => {
    return (
      <ProductItem
        product={item}
        searchTerm={searchTerm}
        onSelect={handleProductSelect}
        isLast={index === products.length - 1}
        highlightSearchTerm={highlightSearchTerm}
      />
    );
  }, [searchTerm, handleProductSelect, products.length, highlightSearchTerm]);

  /**
   * Otimização: função para layout dos itens
   */
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  /**
   * Key extractor otimizado - garante keys únicas
   */
  const keyExtractor = useCallback((item, index) => {
    // Usar product_code como base, mas garantir unicidade com index
    return `product_${item.product_code || item.id || index}_${index}`;
  }, []);

  /**
   * Renderiza footer com loading ou botão "carregar mais"
   */
  const renderListFooter = useCallback(() => {
    if (isSearching) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.footerText, { color: theme.colors.onSurface }]}>
            Carregando...
          </Text>
        </View>
      );
    }

    if (canLoadMore) {
      return (
        <View style={styles.footerContainer}>
          <Button
            mode="text"
            onPress={handleLoadMore}
            compact
            textColor={theme.colors.primary}
          >
            Carregar mais ({totalResults - loadedCount} restantes)
          </Button>
        </View>
      );
    }

    return null;
  }, [isSearching, canLoadMore, theme, handleLoadMore, totalResults, loadedCount]);

  /**
   * Renderiza separator entre itens
   */
  const renderItemSeparator = useCallback(() => (
    <View style={[styles.separator, { backgroundColor: theme.colors.outline }]} />
  ), [theme]);

  // Não renderizar se não visível
  if (!visible) {
    return null;
  }

  // Determinar conteúdo a ser exibido
  const shouldShowContent = isSearching || searchError || noProductsFound || products.length > 0;

  if (!shouldShowContent) {
    return null;
  }

  if (__DEV__) {
    console.log('ProductSearchDropdown: Renderizando dropdown com:', {
      visible,
      productsCount: products.length,
      isSearching,
      searchError,
      noProductsFound,
      calculatedHeight: calculateOptimalHeight
    });
  }

  return (
    <View 
      style={[styles.container, { height: calculateOptimalHeight }]}
      pointerEvents="box-none" // Permite que toques passem através quando necessário
    >
      <Surface
        elevation={8}
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            flex: 1,
          }
        ]}
        pointerEvents="auto" // Garante que a Surface capture eventos de toque
      >
        {/* Estados especiais: loading, erro, sem resultados */}
        {isSearching && (
          <View style={styles.stateContainer}>
            {renderLoadingState}
          </View>
        )}

        {searchError && !isSearching && (
          <View style={styles.stateContainer}>
            {renderErrorState}
          </View>
        )}

        {noProductsFound && !isSearching && !searchError && (
          <View style={styles.stateContainer}>
            {renderNoResultsState}
          </View>
        )}

        {/* Lista de produtos com FlatList otimizada */}
        {!isSearching && !searchError && !noProductsFound && products.length > 0 && (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={keyExtractor}
            // DESABILITADO TEMPORARIAMENTE getItemLayout para debug
            // getItemLayout={getItemLayout}
            initialNumToRender={INITIAL_NUM_TO_RENDER}
            maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
            windowSize={WINDOW_SIZE}
            // DESABILITADO TEMPORARIAMENTE removeClippedSubviews para debug
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderListFooter}
            ItemSeparatorComponent={renderItemSeparator}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
            // Propriedades específicas para garantir rolagem
            scrollEnabled={true}
            pagingEnabled={false}
            // Melhorias para experiência de rolagem
            scrollEventThrottle={16}
            decelerationRate="normal"
            bounces={true}
            alwaysBounceVertical={false}
            overScrollMode="auto"
            // Acessibilidade
            accessibilityLabel={`Lista de produtos com ${products.length} de ${totalResults} resultados`}
            accessibilityHint="Role para ver mais produtos ou use gestos para navegar"
            accessible={true}
          />
        )}

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
    zIndex: 10000, // Muito maior que o ProductSearchInput (1000)
    elevation: 10000, // Para Android
    marginTop: 4,
    minHeight: ITEM_HEIGHT * 2, // Mínimo 2 itens
    // Garante que o dropdown fique sobre TODOS os elementos
    ...Platform.select({
      ios: {
        // iOS precisa de um z-index maior que o input
        zIndex: 10000,
      },
      android: {
        // Android precisa de elevation muito alta
        elevation: 10000,
      },
    }),
  },
  surface: {
    borderRadius: 8,
    borderWidth: 1,
    // REMOVIDO overflow: 'hidden' para permitir rolagem adequada do conteúdo interno
    // O borderRadius ainda será respeitado pelos elementos filhos
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
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: ITEM_HEIGHT,
  },
  flatList: {
    flex: 1,
    maxHeight: '100%',
  },
  flatListContent: {
    paddingVertical: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  footerContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: ITEM_HEIGHT, // Touch target mínimo para acessibilidade
  },
  actionContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  highlightedText: {
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 235, 59, 0.3)', // Amarelo claro para destaque
    borderRadius: 2,
    paddingHorizontal: 2,
  },
});

export default ProductSearchDropdown;
