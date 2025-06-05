import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, Text, Keyboard, TouchableRipple } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  Dropdown,
  MultiSelectDropdown,
  DropdownInputProps,
  DropdownItemProps,
  DropdownRef,
} from 'react-native-paper-dropdown';
import { ReasonService } from '../services/ReasonService';
import ProductSearchChipInput from '../components/ProductSearchChipInput';

// Dados mocados removidos - agora usa dados dinâmicos do banco
const OPTIONS = [];
const MULTI_SELECT_OPTIONS = [];

const CustomDropdownItem = ({
  width,
  option,
  value,
  onSelect,
  toggleMenu,
  isLast,
  theme,
}) => {
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
      <TouchableRipple
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
      </TouchableRipple>
      {!isLast && <Divider />}
    </>
  );
};

const CustomDropdownInput = ({
  placeholder,
  selectedLabel,
  rightIcon,
  theme,
}) => {
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

export default function BreakScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [selectedMotive, setSelectedMotive] = useState();
  const [colors, setColors] = useState([]);
  const [motiveOptions, setMotiveOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const refDropdown1 = useRef(null);

  // Monitorar visibilidade do teclado
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


  // Carregar motivos do banco de dados
  useEffect(() => {
    const loadMotives = async () => {
      try {
        setLoading(true);
        const reasons = await ReasonService.getAllReasons();
        const formattedOptions = reasons.map(reason => ({
          label: `${reason.code} – ${reason.description}`,
          value: reason.id
        }));
        setMotiveOptions(formattedOptions);
      } catch (error) {
        console.error('Erro ao carregar motivos:', error);
        setMotiveOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadMotives();
  }, []);

  const handleSave = () => {
    // Validação básica
    if (!selectedMotive || !selectedProduct || !quantity) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // TODO: Implementar salvamento no banco
    console.log('Salvando quebra:', {
      motivo: selectedMotive,
      produto: selectedProduct,
      quantidade: quantity
    });

    // Reset do formulário
    setSelectedMotive(undefined);
    setSelectedProduct(null);
    setQuantity('');
    
    alert('Quebra registrada com sucesso!');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            onChangeText={setQuantity}
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
                icon: 'file-import',
                label: 'Importar',
                onPress: () => console.log('Importar'),
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
    </View>
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
    paddingBottom: 16, // Espaçamento do bottom da tela
  }
});
