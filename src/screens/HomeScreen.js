import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useProductSearch } from '../components/ProductAutocompleteInput';
import {
  Appbar,
  Button,
  TextInput,
  Menu,
  Divider,
  FAB,
  Chip,
  List,
  Surface,
  ActivityIndicator,
  Banner,
  ProgressBar,
} from 'react-native-paper';

// Services
import { EntryService } from '../services/EntryService.js';
import { ReasonService } from '../services/ReasonService.js';
import { exportService } from '../services/ExportService';

// Contexts
import { useProductsData, useProductsOperations } from '../contexts/ProductsContext';

// Components
import ThemeToggle from '../components/common/ThemeToggle';
import ProductSearchInput from '../components/ProductAutocompleteInput/ProductSearchInput';

/**
 * HomeScreen Component Refatorado
 *
 * Tela principal do aplicativo de inventário que permite:
 * - Buscar e selecionar produtos dinamicamente do banco
 * - Escolher motivos de entrada
 * - Registrar quantidades
 * - Salvar entradas no banco de dados
 * - Exportar/Importar dados
 * - Gerenciamento otimizado de estado e cache
 */
const HomeScreen = () => {
  // Estados do formulário
  const [reasons, setReasons] = useState([]);
  
  // Callback para seleção de produto
  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    console.log('HomeScreen: Produto selecionado:', product);
  }, []);

  const {
    clearSearch,
    clearCache,
    forceRefresh,
    code,
    handleCodeChange,
    handleFocus,
    handleBlur,
    showSuggestions,
    hasResults,
    isSearching,
    searchError,
    noProductsFound,
    filteredProducts,
  } = useProductSearch(handleProductSelect);
  const [selectedReason, setSelectedReason] = useState(null);
  const [quantity, setQuantity] = useState('');
  
  // Estados da UI
  const [showReasonMenu, setShowReasonMenu] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  // Estados do produto selecionado
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Contexto de produtos
  const { products, loading: productsLoading, error: productsError, initialized: productsInitialized } = useProductsData();
  const { refresh: refreshProducts } = useProductsOperations();

  /**
   * Carrega os motivos de entrada do banco de dados
   * @returns {Promise<void>}
   */
  const loadReasons = useCallback(async () => {
    try {
      const reasonsData = await ReasonService.getAllReasons();
      setReasons(reasonsData);
      console.log('HomeScreen: Motivos carregados com sucesso -', reasonsData.length, 'itens');
    } catch (error) {
      console.error('HomeScreen: Erro ao carregar motivos:', error);
      setInitError(error.message || 'Falha ao carregar motivos');
      throw new Error('Falha ao carregar motivos');
    }
  }, []);

  /**
   * Inicializa dados essenciais da aplicação
   * Carrega motivos e garante que produtos estejam inicializados
   */
  const initializeApplicationData = useCallback(async () => {
    try {
      setInitializing(true);
      setInitError(null);

      console.log('HomeScreen: Iniciando inicialização...');
      
      // A inicialização do banco de dados agora é centralizada no App.js através da função initializeDatabase do WatermelonDB
      
      // Carregar motivos
      await loadReasons();
      
      // Verificar se produtos foram inicializados
      if (!productsInitialized) {
        console.log('HomeScreen: Aguardando inicialização dos produtos...');
        // O contexto de produtos já gerencia a inicialização
      }
      
      console.log('HomeScreen: Inicialização concluída com sucesso');
      
    } catch (error) {
      console.error('HomeScreen: Erro ao inicializar dados da aplicação:', error);
      setInitError(error.message);
      Alert.alert(
        'Erro de Inicialização',
        'Falha ao carregar dados essenciais da aplicação. Tente reiniciar o app.',
        [
          { text: 'Tentar Novamente', onPress: initializeApplicationData },
          { text: 'OK' }
        ]
      );
    } finally {
      setInitializing(false);
    }
  }, [loadReasons, productsInitialized]);

  /**
   * Efeito para inicialização dos dados na montagem do componente
   */
  useEffect(() => {
    initializeApplicationData();
  }, [initializeApplicationData]);

  /**
   * Seleciona um motivo e fecha o menu
   * @param {Object} reason - Motivo selecionado
   */
  const selectReason = useCallback((reason) => {
    setSelectedReason(reason);
    setShowReasonMenu(false);
  }, []);

  /**
   * Valida os dados do formulário antes de salvar
   * @returns {Object} - { isValid: boolean, errorMessage: string }
   */
  const validateFormData = useMemo(() => {
    if (!selectedReason) {
      return { isValid: false, errorMessage: 'Por favor, selecione um motivo' };
    }
    
    if (!selectedProduct) {
      return { isValid: false, errorMessage: 'Por favor, selecione um produto' };
    }
    
    const quantityValue = quantity.trim();
    if (!quantityValue || isNaN(quantityValue) || parseFloat(quantityValue) <= 0) {
      return { isValid: false, errorMessage: 'Por favor, informe uma quantidade válida' };
    }
    
    return { isValid: true, errorMessage: '' };
  }, [selectedReason, selectedProduct, quantity]);

  /**
   * Limpa o formulário após salvamento bem-sucedido
   */
  const resetForm = useCallback(() => {
    clearSearch();
    setQuantity('');
    setSelectedReason(null);
  }, [clearSearch]);

  /**
   * Manipula o salvamento de uma nova entrada no inventário
   * Inclui validação, inserção no banco e feedback ao usuário
   */
  const handleSave = useCallback(async () => {
    try {
      // Validar dados do formulário
      const validation = validateFormData;
      if (!validation.isValid) {
        Alert.alert('Erro de Validação', validation.errorMessage);
        return;
      }

      // Validar se produto e motivo estão selecionados
      if (!selectedProduct || !selectedReason) {
        Alert.alert('Erro de Validação', 'Produto ou Motivo não selecionado.');
        return;
      }

      // Criar entrada usando EntryService
      const entry = await EntryService.createEntry(
        selectedProduct.product_code, // Código de barras do produto
        selectedReason.id,            // ID do WatermelonDB da Reason
        parseFloat(quantity.trim())   // Quantidade
      );
      const entryId = entry.id; // Obter o ID da entrada criada pelo WatermelonDB
      
      // Feedback de sucesso e limpeza do formulário
      Alert.alert(
        'Sucesso',
        `Entrada registrada com ID: ${entryId}`,
        [
          {
            text: 'OK',
            onPress: resetForm,
          },
        ]
      );
      
      console.log('HomeScreen: Entrada salva com sucesso:', { entryId, product_code: selectedProduct.product_code, quantity: parseFloat(quantity.trim()) });
      
    } catch (error) {
      console.error('HomeScreen: Erro ao salvar entrada:', error);
      Alert.alert(
        'Erro de Salvamento',
        `Falha ao registrar entrada: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  }, [validateFormData, selectedProduct, selectedReason, quantity, resetForm]);

  /**
   * Manipula a importação de dados
   * TODO: Implementar funcionalidade de importação
   */
  const handleImport = useCallback(() => {
    Alert.alert(
      'Importar Dados',
      'Funcionalidade de importação será implementada em breve.',
      [{ text: 'OK' }]
    );
  }, []);

  /**
   * Manipula a exportação de dados não sincronizados
   * Exibe confirmação antes de executar a exportação
   */
  const handleExport = useCallback(async () => {
    Alert.alert(
      'Exportar Dados',
      'Deseja exportar todos os dados não sincronizados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              console.log('HomeScreen: Iniciando exportação de dados...');
              await exportService.exportData();
              console.log('HomeScreen: Exportação concluída com sucesso');
            } catch (error) {
              console.error('HomeScreen: Erro durante exportação:', error);
              // ExportService já exibe alerta de erro
            }
          },
        },
      ]
    );
  }, []);

  /**
   * Manipula o pressionamento do menu lateral
   * TODO: Implementar navegação para menu lateral
   */
  const handleMenuPress = useCallback(() => {
    Alert.alert(
      'Menu',
      'Menu lateral será implementado em breve.',
      [{ text: 'OK' }]
    );
  }, []);

  /**
   * Manipula a atualização dos dados
   */
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refreshProducts(),
        loadReasons(),
        forceRefresh() // Forçar refresh da busca
      ]);
      clearCache(); // Limpar cache da busca
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error) {
      console.error('HomeScreen: Erro ao atualizar dados:', error);
      Alert.alert('Erro', 'Falha ao atualizar dados. Tente novamente.');
    }
  }, [refreshProducts, loadReasons, forceRefresh, clearCache]);

  /**
   * Renderiza busca de produtos ou chip do produto selecionado
   */
  const renderProductSearch = () => {
    if (selectedProduct) {
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
        
        return numPrice.toFixed(2);
      };

      const price = formatPrice(selectedProduct);
      const unitType = selectedProduct.unit_type || 'UN';

      return (
        <View style={styles.chipContainer}>
          <Chip
            icon="package-variant"
            onClose={() => {
              clearSearch();
            }}
            closeIcon="close-circle"
            mode="outlined"
            style={styles.productChip}
            accessibilityLabel={`Produto selecionado: ${selectedProduct.product_name}`}
          >
            {`${selectedProduct.product_name} • ${unitType} • R$ ${price}`}
          </Chip>
        </View>
      );
    }

    return (
      <ProductSearchInput
        onProductSelect={handleProductSelect}
        placeholder="Digite código ou nome do produto"
        label="Buscar Produto"
        style={styles.searchContainer}
        autoFocus={false}
        disabled={false}
      />
    );
  };

  /**
   * Renderiza banner de status se necessário
   */
  const renderStatusBanner = () => {
    if (initError) {
      return (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Tentar Novamente',
              onPress: initializeApplicationData,
            },
            {
              label: 'Atualizar',
              onPress: handleRefresh,
            },
          ]}
          icon="alert"
        >
          Erro na inicialização: {initError}
        </Banner>
      );
    }

    if (productsError) {
      return (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Atualizar',
              onPress: handleRefresh,
            },
          ]}
          icon="alert"
        >
          Erro ao carregar produtos: {productsError}
        </Banner>
      );
    }

    return null;
  };

  // Mostrar loading durante inicialização
  if (initializing || !productsInitialized) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Action icon="menu" onPress={handleMenuPress} />
          <Appbar.Content title="Inventário" />
          <ThemeToggle />
        </Appbar.Header>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ProgressBar indeterminate style={styles.progressBar} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { overflow: 'visible' }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={handleMenuPress} />
        <Appbar.Content title="Inventário" />
        <Appbar.Action icon="refresh" onPress={handleRefresh} />
        <ThemeToggle />
      </Appbar.Header>

      {renderStatusBanner()}

      <ScrollView
        style={[styles.content, { overflow: 'visible' }]}
        contentContainerStyle={[styles.contentContainer, { overflow: 'visible' }]}
        keyboardShouldPersistTaps="handled"
      >
        <Menu
          visible={showReasonMenu}
          onDismiss={() => setShowReasonMenu(false)}
          anchor={
            <TextInput
              label="Motivo"
              value={selectedReason ? selectedReason.description : ''}
              mode="outlined"
              editable={false}
              onPressIn={() => setShowReasonMenu(true)}
              right={<TextInput.Icon icon="menu-down" onPress={() => setShowReasonMenu(true)} />}
              style={styles.inputField}
            />
          }
        >
          {reasons.map((reason) => (
            <Menu.Item
              key={reason.id.toString()}
              onPress={() => selectReason(reason)}
              title={reason.description}
            />
          ))}
          {reasons.length > 0 && <Divider />}
          <Menu.Item
            onPress={() => setShowReasonMenu(false)}
            title="Cancelar"
          />
        </Menu>

        {renderProductSearch()}

        <TextInput
          label="Quantidade"
          value={quantity}
          onChangeText={setQuantity}
          mode="outlined"
          keyboardType="numeric"
          style={styles.inputField}
        />

        <View style={styles.saveButtonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!selectedReason || !selectedProduct || !quantity.trim()}
            icon="content-save"
            style={styles.saveButton}
          >
            Salvar
          </Button>
        </View>
      </ScrollView>
      
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'upload',
            label: 'Importar',
            onPress: handleImport,
          },
          {
            icon: 'download',
            label: 'Exportar',
            onPress: handleExport,
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
      />
    </View>
  );
};

/**
 * Estilos organizados por seções para melhor manutenibilidade
 */
const styles = StyleSheet.create({
  // === LAYOUT PRINCIPAL ===
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: 'visible',
  },
  contentContainer: {
    padding: 16,
    overflow: 'visible',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  progressBar: {
    marginTop: 16,
    width: '80%',
  },

  // === CAMPOS DE FORMULÁRIO ===
  inputField: {
    marginBottom: 12,
  },
  chipContainer: {
    marginBottom: 12,
  },
  productChip: {
    alignSelf: 'flex-start',
  },
  
  // === BUSCA E DROPDOWN ===
  searchContainer: {
    position: 'relative',
    marginBottom: 12,
    zIndex: 999999,
    ...Platform.select({
      ios: {
        zIndex: 999999,
      },
      android: {
        elevation: 999999,
      },
    }),
  },
  
  // === BOTÕES E AÇÕES ===
  saveButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    width: '80%',
    paddingVertical: 4,
  },
});

export default HomeScreen;
