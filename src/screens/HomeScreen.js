import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  Button,
  TextInput,
  Text,
  Menu,
  Divider,
  FAB,
} from 'react-native-paper';
import { expoDbManager } from '../database/expo-manager';
import { exportService } from '../services/ExportService';
import ThemeToggle from '../components/common/ThemeToggle';

const HomeScreen = () => {
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [showReasonMenu, setShowReasonMenu] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await expoDbManager.initialize();
        const reasonsData = await expoDbManager.fetchData('reasons');
        setReasons(reasonsData);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados do banco');
      }
    };
    loadInitialData();
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCode(product ? product.product_code : '');
  };

  const handleCodeChange = (text) => {
    setCode(text);
    if (!text.trim()) {
      setSelectedProduct(null);
    }
  };

  const selectReason = (reason) => {
    setSelectedReason(reason);
    setShowReasonMenu(false);
  };

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
        unit_cost: selectedProduct ? selectedProduct.regular_price : 0,
      };
      const entryId = await expoDbManager.insertEntry(entryData);
      Alert.alert('Sucesso', `Entrada registrada com ID: ${entryId}`, [
        {
          text: 'OK',
          onPress: () => {
            setSelectedProduct(null);
            setCode('');
            setQuantity('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', `Falha ao registrar entrada: ${error.message}`);
    }
  };

  const handleImport = () => Alert.alert('Importar', 'Funcionalidade de importação');
  const handleExport = async () => {
    Alert.alert(
      'Exportar Dados',
      'Deseja exportar todos os dados não sincronizados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              await exportService.exportData();
            } catch (error) {
              // ExportService já exibe alerta
            }
          },
        },
      ]
    );
  };
  const handleMenuPress = () => Alert.alert('Menu', 'Menu lateral');

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={handleMenuPress} />
        <Appbar.Content title="Inventário" />
        <ThemeToggle />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
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

        <TextInput
          label="Código do Produto"
          value={code}
          onChangeText={handleCodeChange}
          mode="outlined"
          style={styles.inputField}
        />

        {selectedProduct && (
          <View style={styles.productInfoContainer}>
            <Text variant="bodyMedium">
              Nome: {selectedProduct.product_name}
            </Text>
            <Text variant="bodySmall">
              Embalagem: {selectedProduct.unit_type}
            </Text>
            <Text variant="bodySmall">
              Preço: R$ {selectedProduct.regular_price?.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        )}
        {!selectedProduct && code.trim().length > 0 && (
          <View style={styles.productInfoContainer}>
            <Text variant="bodyMedium" style={{fontStyle: 'italic'}}>
              Produto não selecionado ou não cadastrado.
            </Text>
          </View>
        )}

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
            disabled={!selectedReason || !code.trim() || !quantity.trim()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  inputField: {
    marginBottom: 12,
  },
  productInfoContainer: {
    marginVertical: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
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
