import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Keyboard, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  TextInput,
  useTheme,
  ActivityIndicator,
  FAB,
  Portal,
  Headline,
} from 'react-native-paper';
import { exportService } from '../services/ExportService';
import { importService } from '../services/ImportService';
import ImportProgressDialog from '../components/dialogs/ImportProgressDialog';
import { useNavigation } from '@react-navigation/native';
import ThemeToggle from '../components/common/ThemeToggle';
import { Dropdown } from 'react-native-paper-dropdown';
import ProductSearchChipInput from '../components/ProductSearchChipInput';
import { database } from '../database';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';


const CustomDropdownItem = ({ width, option, value, onSelect, toggleMenu, isLast, theme }) => {
  const style = useMemo(
    () => ({
      height: 50,
      width,
      backgroundColor:
        value === option.value
          ? theme.colors.primary
          : theme.colors.surface,
      justifyContent: 'center',
      paddingHorizontal: 16,
    }),
    [option.value, value, width, theme]
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          onSelect?.(option.value);
          toggleMenu();
        }}
        style={style}
      >
        <Headline
          style={{
            color:
              value === option.value
                ? theme.colors.onPrimary
                : theme.colors.onSurface,
          }}
        >
          {option.label}
        </Headline>
      </TouchableOpacity>
      {!isLast && <Divider />}
    </>
  );
};

const CustomDropdownInput = ({ placeholder, selectedLabel, rightIcon, theme }) => {
  return (
    <TextInput
      mode="outlined"
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      value={selectedLabel}
      style={{
        backgroundColor: theme.colors.surface,
      }}
      textColor={theme.colors.onSurface}
      right={rightIcon}
    />
  );
};

function BreakScreen() {
  const [reasons, setReasons] = useState([]);
  const reasonsCollection = useMemo(() => database.get('reasons'), []);
  const entriesCollection = useMemo(() => database.get('entries'), []);

  useEffect(() => {
    const loadReasons = async () => {
      try {
        const query = reasonsCollection.query(
          Q.sortBy('code', Q.asc)
        );
        const results = await query.fetch();
        setReasons(results);
      } catch (error) {
        console.error('Erro ao carregar motivos:', error);
        setReasons([]);
      }
    };

    loadReasons();
  }, [reasonsCollection]);
  const navigation = useNavigation();
  const theme = useTheme();
  const [selectedMotive, setSelectedMotive] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const refDropdown1 = useRef(null);
  
  // Estados para o dialog de progresso de importação
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importProgress, setImportProgress] = useState({
    progress: 0,
    status: 'Preparando importação...',
    currentFile: '',
    processedLines: 0,
    totalLines: 0,
    isCompleted: false,
    hasError: false,
    canCancel: true
  });
  const cancelTokenRef = useRef({ cancelled: false });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleExport = async () => {
    setFabOpen(false);
    try {
      await exportService.exportData();
    } catch (error) {
      console.error('Erro na exportação:', error);
    }
  };

  const handleImport = async () => {
    setFabOpen(false);
    cancelTokenRef.current = { cancelled: false };
    setImportProgress({
      progress: 0,
      status: 'Preparando importação...',
      currentFile: '',
      processedLines: 0,
      totalLines: 0,
      isCompleted: false,
      hasError: false,
      canCancel: true
    });
    
    setImportDialogVisible(true);
    
    try {
      const result = await importService.importProducts(
        (progressData) => {
          setImportProgress(prev => ({
            ...prev,
            progress: progressData.progress || 0,
            status: progressData.status || 'Processando...',
            currentFile: progressData.currentFile || '',
            processedLines: progressData.processedLines || 0,
            totalLines: progressData.totalLines || 0,
            hasError: progressData.hasError || false,
            canCancel: !progressData.hasError && progressData.progress < 1
          }));
        },
        cancelTokenRef.current
      );
      
      setImportProgress(prev => ({
        ...prev,
        isCompleted: true,
        canCancel: false,
        status: result.success ?
          `✅ Importação concluída! ${result.stats.inserted} criados, ${result.stats.updated} atualizados` :
          `❌ ${result.message}`,
        progress: result.success ? 1 : 0
      }));
      
    } catch (error) {
      console.error('Erro na importação:', error);
      
      setImportProgress(prev => ({
        ...prev,
        isCompleted: true,
        hasError: true,
        canCancel: false,
        status: `❌ Erro: ${error.message}`,
        progress: 0
      }));
    }
  };

  const handleSanitize = async () => {
    setFabOpen(false);
    try {
      const stats = await importService.sanitizeExistingProducts();
      console.log('Sanitização concluída:', stats);
    } catch (error) {
      console.error('Erro na sanitização:', error);
    }
  };

  const handleCancelImport = () => {
    cancelTokenRef.current.cancelled = true;
    setImportProgress(prev => ({
      ...prev,
      status: 'Cancelando importação...',
      canCancel: false
    }));
  };

  const handleDismissImportDialog = () => {
    setImportDialogVisible(false);
    setTimeout(() => {
      setImportProgress({
        progress: 0,
        status: 'Preparando importação...',
        currentFile: '',
        processedLines: 0,
        totalLines: 0,
        isCompleted: false,
        hasError: false,
        canCancel: true
      });
    }, 300);
  };

  const handleSave = async () => {
    if (!selectedMotive || !selectedProduct || !quantity) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await database.write(async () => {
        const selectedReason = await reasonsCollection.find(selectedMotive);
        
        // Remove zeros à esquerda e converte vírgula para ponto
        const sanitizedQuantity = quantity.replace(/^0+(?=\d)/, '').replace(',', '.');
        const numericQuantity = parseFloat(sanitizedQuantity);
        
        // Validação básica: não permite números negativos
        if (isNaN(numericQuantity) || numericQuantity < 0) {
          throw new Error('A quantidade não pode ser negativa.');
        }

        const newEntry = await entriesCollection.create(entry => {
          entry.productCodeValue = selectedProduct.productCode;
          entry.productName = selectedProduct.productName;
          entry.quantity = numericQuantity;
          entry.unitType = selectedProduct.unitType;
          entry.reasonCodeValue = selectedReason.code;
          entry.entryDate = Date.now();
          entry.isSynchronized = false;
        });
        
        await newEntry.update(entry => {
          entry.product.set(selectedProduct);
          entry.reason.set(selectedReason);
        });
      });

      // Reset apenas produto e quantidade, mantendo o motivo selecionado
      setSelectedProduct(null);
      setQuantity('');
      
      alert('Quebra registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar quebra:', error);
      alert('Erro ao registrar quebra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const motiveOptions = useMemo(() => {
    return reasons.map(reason => ({
      label: `${reason.code} – ${reason.description}`,
      value: reason.id
    }));
  }, [reasons]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Registrar Quebra" />
        <ThemeToggle />
      </Appbar.Header>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
      >
        <View style={styles.formWrapper}>
          {/* Seção de Motivo */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Carregando motivos...</Text>
            </View>
          ) : (
            <Dropdown
              ref={refDropdown1}
              label={'Motivos'}
              placeholder="Selecione um Motivo"
              options={motiveOptions}
              value={selectedMotive}
              onSelect={setSelectedMotive}
            />
          )}

          <Divider style={styles.divider} />

          {/* Seção de Produtos */}
          <ProductSearchChipInput
            label="Buscar Produtos *"
            mode="outlined"
            placeholder="Digite o nome do produto"
            selectedProduct={selectedProduct}
            onProductSelect={setSelectedProduct}
            style={styles.input}
          />

          {/* Seção de Quantidade */}
          <TextInput
            label="Quantidade *"
            mode="outlined"
            placeholder="Digite a quantidade"
            value={quantity}
            onChangeText={(text) => {
              // Remove caracteres não numéricos exceto ponto e vírgula
              const sanitized = text.replace(/[^\d.,]/g, '');
              // Permite apenas um separador decimal
              const normalized = sanitized.replace(/[.,]/g, (match, offset) => {
                return sanitized.indexOf('.') !== offset && sanitized.indexOf(',') !== offset ? '' : match;
              });
              setQuantity(normalized);
            }}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Botão Salvar */}
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={loading || !selectedMotive || !selectedProduct || !quantity}
            style={styles.saveButton}
          >
            Salvar
          </Button>
        </View>
      </ScrollView>

      {/* FAB Group */}
      <Portal>
        {!isKeyboardVisible && (
          <FAB.Group
            open={fabOpen}
            visible={true}
            icon={fabOpen ? 'close' : 'plus'}
            actions={[
              {
                icon: 'auto-fix',
                label: 'Corrigir',
                onPress: handleSanitize,
                color: theme.colors.secondary,
              },
              {
                icon: 'file-import',
                label: 'Importar',
                onPress: handleImport,
                color: theme.colors.primary,
              },
              {
                icon: 'file-export',
                label: 'Exportar',
                onPress: handleExport,
                color: theme.colors.primary,
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            style={styles.fabGroup}
            fabStyle={{ backgroundColor: theme.colors.primary }}
          />
        )}
      </Portal>

      {/* Dialog de Progresso de Importação */}
      <ImportProgressDialog
        visible={importDialogVisible}
        onDismiss={handleDismissImportDialog}
        onCancel={handleCancelImport}
        progress={importProgress.progress}
        status={importProgress.status}
        currentFile={importProgress.currentFile}
        processedLines={importProgress.processedLines}
        totalLines={importProgress.totalLines}
        canCancel={importProgress.canCancel}
        isCompleted={importProgress.isCompleted}
        hasError={importProgress.hasError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formWrapper: {
    padding: 16,
  },
  input: {
    marginVertical: 12,
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
  },
  saveButton: {
    marginTop: 24,
  },
  fabGroup: {
    paddingBottom: 16,
  }
});

export default BreakScreen;
