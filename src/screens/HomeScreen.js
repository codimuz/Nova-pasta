import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  TextInput as RNTextInput,
  FlatList,
  Modal
} from 'react-native';
import { theme } from '../theme';
import { expoDbManager } from '../database/expo-manager';
import ProductAutocompleteInput from '../components/ProductAutocompleteInput';
import { exportService } from '../services/ExportService';

const HomeScreen = () => {
  // Estados para dados
  const [reasons, setReasons] = useState([]);
  
  // Estados para seleção
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Estados para campos
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Estados para UI
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('HOMESCREEN: Carregando dados iniciais...');
      
      // Inicializar database
      await expoDbManager.initialize();
      
      // Carregar motivos
      const reasonsData = await expoDbManager.fetchData('reasons');
      setReasons(reasonsData);
      console.log('HOMESCREEN: Motivos carregados:', reasonsData.length);
      
      console.log('HOMESCREEN: Dados iniciais carregados');
      
    } catch (error) {
      console.error('HOMESCREEN: Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do banco');
    }
  };

  // Handler para seleção de produto do novo componente
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCode(product ? product.product_code : '');
  };

  // Handler para mudança de código do novo componente
  const handleCodeChange = (text) => {
    setCode(text);
    if (!text.trim()) {
      setSelectedProduct(null);
    }
  };

  // Selecionar motivo
  const selectReason = (reason) => {
    setSelectedReason(reason);
    setShowReasonDropdown(false);
  };

  // Salvar entrada
  const handleSave = async () => {
    if (!selectedReason) {
      Alert.alert('Erro', 'Por favor, selecione um motivo');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, informe o código do produto');
      return;
    }

    if (!quantity.trim() || isNaN(quantity) || parseFloat(quantity) <= 0) {
      Alert.alert('Erro', 'Por favor, informe uma quantidade válida');
      return;
    }

    try {
      const entryData = {
        product_code: code.trim(),
        product_name: selectedProduct ? selectedProduct.product_name : 'PRODUTO NÃO CADASTRADO',
        quantity: parseFloat(quantity),
        reason_id: selectedReason.id,
        unit_cost: selectedProduct ? selectedProduct.regular_price : 0
      };

      const entryId = await expoDbManager.insertEntry(entryData);
      
      Alert.alert(
        'Sucesso', 
        `Entrada registrada com sucesso!\nID: ${entryId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpar apenas campos de produto - manter motivo selecionado
              setSelectedProduct(null);
              setCode('');
              setQuantity('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('HOMESCREEN: Erro ao salvar entrada:', error);
      Alert.alert('Erro', `Falha ao registrar entrada: ${error.message}`);
    }
  };

  // Funções dos botões (placeholder)
  const handleImport = () => {
    Alert.alert('Importar', 'Funcionalidade de importação será implementada');
  };

  const handleExport = async () => {
    Alert.alert(
      'Exportar Dados',
      'Deseja exportar todos os dados não sincronizados para arquivos .txt organizados por motivo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              console.log('HOMESCREEN: Iniciando exportação...');
              await exportService.exportData();
            } catch (error) {
              console.error('HOMESCREEN: Erro na exportação:', error);
              // O ExportService já exibe o alerta de erro
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Menu lateral será implementado');
  };

  // Render item do dropdown de motivos
  const renderReasonItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => selectReason(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.dropdownItemText}>{item.description}</Text>
      <Text style={styles.dropdownItemCode}>{item.code}</Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inventário</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Botões Importar e Exportar */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImport}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Importar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Exportar</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal com formulário */}
        <View style={styles.formCard}>
          {/* Campo Motivo - Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Motivo</Text>
            <TouchableOpacity
              style={[styles.textInput, styles.dropdownButton]}
              onPress={() => setShowReasonDropdown(true)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dropdownButtonText,
                !selectedReason && styles.placeholderText
              ]}>
                {selectedReason ? selectedReason.description : 'Selecione um motivo'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Campo Código - com Novo Autocomplete */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Código</Text>
            <ProductAutocompleteInput
              value={code}
              onProductSelect={handleProductSelect}
              onCodeChange={handleCodeChange}
              placeholder="Digite o código do produto"
              minChars={1}
              maxSuggestions={5}
              debounceMs={300}
              showClearButton={true}
            />
          </View>

          {/* Informações do produto */}
          <View style={styles.productInfo}>
            <Text style={styles.productInfoText}>
              Nome: {selectedProduct ? selectedProduct.product_name : 'NÃO CADASTRADO'}
            </Text>
            <Text style={styles.productInfoText}>
              Embalagem: {selectedProduct ? selectedProduct.unit_type : 'NÃO CADASTRADO'}
            </Text>
            <Text style={styles.productInfoText}>
              Preço: {selectedProduct ? `R$ ${selectedProduct.regular_price?.toFixed(2).replace('.', ',')}` : 'NÃO CADASTRADO'}
            </Text>
          </View>

          {/* Campo Quantidade */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quantidade</Text>
            <RNTextInput
              style={styles.textInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Digite a quantidade"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedReason || !code.trim() || !quantity.trim()) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!selectedReason || !code.trim() || !quantity.trim()}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.saveButtonText,
              (!selectedReason || !code.trim() || !quantity.trim()) && styles.saveButtonTextDisabled
            ]}>
              Salvar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal do Dropdown de Motivos */}
      <Modal
        visible={showReasonDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReasonDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReasonDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Selecione um Motivo</Text>
              <TouchableOpacity
                onPress={() => setShowReasonDropdown(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={reasons}
              renderItem={renderReasonItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // TopBar
  topBar: {
    height: 56,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.headlineSmall,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.fontFamily,
    marginLeft: theme.spacing.md,
  },
  spacer: {
    width: 40,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  
  // Botões superiores
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.sizes.labelLarge,
    fontWeight: theme.typography.weights.medium,
    fontFamily: theme.typography.fontFamily,
  },

  // Card do formulário
  formCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  
  // Inputs
  inputContainer: {
    marginVertical: theme.spacing.sm,
    zIndex: 1,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    marginBottom: 4,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.surface,
  },

  // Dropdown de motivos
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  // Modal do dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    width: '80%',
    maxHeight: '60%',
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  dropdownTitle: {
    fontSize: theme.typography.sizes.titleMedium,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  dropdownItemText: {
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
  },
  dropdownItemCode: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    marginTop: 2,
  },


  // Informações do produto
  productInfo: {
    paddingVertical: theme.spacing.md,
  },
  productInfoText: {
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    lineHeight: 24,
    marginBottom: theme.spacing.xs,
  },

  // Botão Salvar
  saveButtonContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  saveButton: {
    minWidth: 200,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    elevation: 1,
  },
  saveButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.labelLarge,
    fontWeight: theme.typography.weights.medium,
    fontFamily: theme.typography.fontFamily,
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
});

export default HomeScreen;
