import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, TextInput, useTheme, HelperText, ActivityIndicator } from 'react-native-paper';
import { spacing } from '../../theme/spacing';
import { ReasonService } from '../../services/ReasonService.js';

const MotiveDropdown = ({
  value,
  onValueChange,
  error,
  label = "Motivo da Quebra",
  placeholder = "Selecione o motivo",
  disabled = false,
  style,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [selectedReasonDisplay, setSelectedReasonDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const theme = useTheme();
  
  const loadReasons = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await ReasonService.getAllReasons();
      if (data && data.length > 0) {
        setReasons(data);
      } else {
        setReasons([]);
        setErrorMessage("Nenhum motivo cadastrado.");
      }
    } catch (err) {
      console.error('MotiveDropdown: Erro ao carregar motivos:', err);
      setErrorMessage('Falha ao carregar motivos.');
      setReasons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReasons();
  }, [loadReasons]);
  
  useEffect(() => {
    if (value && reasons.length > 0) {
      const reason = reasons.find(r => r.id === value);
      if (reason) {
        setSelectedReasonDisplay(`${reason.code} – ${reason.description}`);
      } else {
        setSelectedReasonDisplay('');
      }
    } else {
      setSelectedReasonDisplay('');
    }
  }, [value, reasons]);
  
  const handleSelect = (reason) => {
    onValueChange(reason.id);
    setSelectedReasonDisplay(`${reason.code} – ${reason.description}`);
    setVisible(false);
  };
  
  const openDropdown = () => {
    if (!disabled && !loading) {
      setVisible(true);
    }
  };
  
  const currentPlaceholder = loading ? "Carregando motivos..." : (reasons.length === 0 && errorMessage) ? "Nenhum motivo disponível" : placeholder;
  
  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TextInput
            {...props}
            value={selectedReasonDisplay}
            onFocus={openDropdown}
            onPressIn={openDropdown}
            right={
              <TextInput.Icon
                icon={loading ? "loading" : (visible ? "menu-up" : "menu-down")}
                onPress={openDropdown}
                disabled={disabled || loading}
              />
            }
            editable={false}
            error={!!error || !!errorMessage}
            mode="outlined"
            label={label}
            placeholder={currentPlaceholder}
            disabled={disabled || loading}
            style={styles.input}
            activeOutlineColor={theme.colors.primary}
            outlineColor={theme.colors.outline}
          />
        }
        contentStyle={[
          styles.menu,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
      >
        {loading ? (
          <ActivityIndicator animating={true} color={theme.colors.primary} style={styles.loader} />
        ) : reasons.length === 0 ? (
          <Menu.Item
            title={errorMessage || "Nenhum motivo disponível"}
            titleStyle={[styles.emptyItem, { color: theme.colors.onSurfaceVariant }]}
            disabled
          />
        ) : (
          reasons.map((reason) => (
            <Menu.Item
              key={reason.id}
              onPress={() => handleSelect(reason)}
              title={`${reason.code} – ${reason.description}`}
              titleStyle={[
                styles.menuItem,
                { color: theme.colors.onSurfaceVariant },
                value === reason.id && styles.selectedItem
              ]}
              style={[
                styles.menuItemContainer,
                value === reason.id && {
                  backgroundColor: theme.colors.primaryContainer,
                }
              ]}
            />
          ))
        )}
      </Menu>
      
      <HelperText type="error" visible={!!error || !!errorMessage}>
        {error || errorMessage}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    // backgroundColor é gerenciado pelo tema do TextInput
  },
  menu: {
    marginTop: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    elevation: 4,
  },
  menuItem: {
    fontSize: 16,
  },
  menuItemContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  selectedItem: {
    fontWeight: 'bold',
  },
  emptyItem: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  loader: {
    paddingVertical: spacing.md,
  },
});

export default MotiveDropdown;
