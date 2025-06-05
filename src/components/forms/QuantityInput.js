import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';

/**
 * Valida a entrada como número positivo, permitindo decimais
 * @param {string} value - Valor bruto digitado
 * @returns {{ isValid: boolean, value: string }} - Resultado da validação
 */
const validateQuantity = (value) => {
  // Remove caracteres não numéricos exceto ponto
  const cleanValue = value.replace(/[^\d.]/g, '');

  // Se vazio, é válido (permite limpar o campo)
  if (!cleanValue) {
    return { isValid: true, value: '' };
  }

  // Verifica se há mais de um ponto decimal
  if ((cleanValue.match(/\./g) || []).length > 1) {
    return { isValid: false, value };
  }

  const number = parseFloat(cleanValue);
  
  // Valida apenas se é um número positivo
  const isValid = !isNaN(number) && number >= 0;

  return {
    isValid,
    value: isValid ? cleanValue : value
  };
};

const QuantityInput = ({ value, onChangeText, initialUnitType = 'UN', label, mode = "outlined", style, error, ...props }) => {
  const [unitType, setUnitType] = useState(initialUnitType);

  const handleChange = (text) => {
    // Converte vírgula para ponto antes de validar
    const normalizedText = text.replace(',', '.');
    const result = validateQuantity(normalizedText);
    
    // Notifica mudança com o valor e o tipo selecionado
    onChangeText({
      value: result.value,
      unit: unitType
    });
  };

  const toggleUnitType = () => {
    setUnitType(current => current === 'KG' ? 'UN' : 'KG');
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label || 'Quantidade'}
        mode={mode}
        value={value?.value || ''}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        error={!validateQuantity(value?.value || '').isValid && Boolean(value?.value)}
        style={[styles.input, style]}
        {...props}
      />
      <Button
        mode="contained"
        onPress={toggleUnitType}
        style={styles.unitButton}
      >
        {unitType}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  input: {
    flex: 1
  },
  unitButton: {
    minWidth: 60,
    marginLeft: 8
  }
});

export default QuantityInput;