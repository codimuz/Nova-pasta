import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';

/**
 * Formata e valida a entrada de quantidade conforme o tipo de unidade
 * @param {string} value - Valor bruto digitado
 * @param {string} unitType - Tipo de unidade (KG ou UN)
 * @returns {{ isValid: boolean, value: string }} - Resultado da validação
 */
const validateQuantity = (value, unitType) => {
  // Remove caracteres não numéricos exceto ponto
  const cleanValue = value.replace(/[^\d.]/g, '');

  // Se vazio, é válido (permite limpar o campo)
  if (!cleanValue) {
    return { isValid: true, value: '' };
  }

  // Valida o formato conforme o tipo de unidade
  if (unitType === 'KG') {
    // Para KG: formato 00.00 (até duas casas decimais)
    const [intPart, decPart = ''] = cleanValue.split('.');
    
    // Verifica se tem no máximo duas casas decimais
    if (decPart.length > 2) {
      return { isValid: false, value };
    }

    const number = parseFloat(cleanValue);
    const isValid = !isNaN(number) && number > 0 && number <= 9999.99;

    if (isValid) {
      // Formata com duas casas decimais se houver ponto
      if (cleanValue.includes('.')) {
        return {
          isValid: true,
          value: number.toFixed(2)
        };
      }
      return { isValid: true, value: cleanValue };
    }
    return { isValid: false, value };
  } else {
    // Para UN: formato #### (inteiros de 1 a 9999)
    if (cleanValue.includes('.')) {
      return { isValid: false, value };
    }

    const number = parseInt(cleanValue, 10);
    const isValid = !isNaN(number) && number >= 1 && number <= 9999;

    return {
      isValid,
      value: isValid ? String(number) : value
    };
  }
};

const QuantityInput = ({ value, onChangeText, initialUnitType = 'UN', label, mode = "outlined", style, error, ...props }) => {
  const [unitType, setUnitType] = useState(initialUnitType);

  const handleChange = (text) => {
    const result = validateQuantity(text, unitType);
    onChangeText(result.value);
  };

  const toggleUnitType = () => {
    // Limpa o valor ao trocar o tipo
    onChangeText('');
    setUnitType(current => current === 'KG' ? 'UN' : 'KG');
  };

  const placeholder = unitType === 'KG' ? '00.00' : '####';
  
  return (
    <View style={styles.container}>
      <TextInput
        label={label || 'Quantidade'}
        mode={mode}
        value={value}
        placeholder={placeholder}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        error={!validateQuantity(value, unitType).isValid && Boolean(value)}
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