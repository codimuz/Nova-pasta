import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, TextInput, useTheme, Text } from 'react-native-paper';
import { spacing } from '../../theme/spacing';
import { expoDbManager } from '../../database/expo-manager';

const MotiveDropdown = ({ 
  value, 
  onValueChange, 
  error, 
  label = "Motivo da Quebra",
  placeholder = "Selecione o motivo",
  disabled = false,
  ...props 
}) => {
  const [visible, setVisible] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  useEffect(() => {
    loadReasons();
  }, []);
  
  useEffect(() => {
    if (value && reasons.length > 0) {
      const reason = reasons.find(r => r.id === value);
      setSelectedReason(reason);
    } else {
      setSelectedReason(null);
    }
  }, [value, reasons]);
  
  const loadReasons = async () => {
    try {
      setLoading(true);
      const data = await expoDbManager.getReasons();
      // Mapear campos para manter compatibilidade com o código existente
      const mappedData = data.map(reason => ({
        reason_id: reason.id,
        reason_name: reason.description,
        code: reason.code,
        ...reason
      }));
      setReasons(mappedData);
    } catch (error) {
      console.error('Erro ao carregar motivos:', error);
      setReasons([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelect = (reason) => {
    setSelectedReason(reason);
    onValueChange(reason.id);
    setVisible(false);
  };
  
  const openDropdown = () => {
    if (!disabled && !loading) {
      setVisible(true);
    }
  };
  
  return (
    <View style={[styles.container, props.style]}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TextInput
            {...props}
            value={selectedReason?.description || ''}
            onFocus={openDropdown}
            onPressIn={openDropdown}
            right={
              <TextInput.Icon 
                icon={loading ? "loading" : "chevron-down"} 
                forceTextInputFocus={false}
                onPress={openDropdown}
              />
            }
            editable={false}
            error={error}
            mode="outlined"
            label={label}
            placeholder={placeholder}
            disabled={disabled || loading}
            style={styles.input}
          />
        }
        contentStyle={[
          styles.menu,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        {reasons.length === 0 ? (
          <Menu.Item
            onPress={() => {}}
            title="Nenhum motivo cadastrado"
            titleStyle={[styles.emptyItem, { color: theme.colors.onSurfaceVariant }]}
            disabled
          />
        ) : (
          reasons.map((reason) => (
            <Menu.Item
              key={reason.id}
              onPress={() => handleSelect(reason)}
              title={reason.description}
              titleStyle={[
                styles.menuItem,
                { color: theme.colors.onSurface }
              ]}
              style={[
                styles.menuItemContainer,
                selectedReason?.id === reason.id && {
                  backgroundColor: theme.colors.primaryContainer
                }
              ]}
            />
          ))
        )}
      </Menu>
      
      {error && typeof error === 'string' && (
        <Text 
          variant="bodySmall" 
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: 'transparent',
  },
  menu: {
    maxHeight: 240,
    marginTop: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    elevation: 8,
  },
  menuItem: {
    fontSize: 16,
    lineHeight: 24,
  },
  menuItemContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48, // Accessibility touch target
  },
  emptyItem: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.md,
    fontSize: 12,
  },
});

export default MotiveDropdown;