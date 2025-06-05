import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

const QuantityInput = ({ value, onChangeText, initialUnitType = 'UN', label, mode = "outlined", style, error, ...props }) => {
  const [unitType, setUnitType] = useState(initialUnitType);
  const [displayValue, setDisplayValue] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateValue = (text) => {
    if (!text) return { isValid: true, error: '' };
    
    const number = parseFloat(text);
    
    if (isNaN(number)) {
      return { isValid: false, error: 'Digite um valor numérico válido' };
    }
    
    if (number < 0) {
      return { isValid: false, error: 'O valor não pode ser negativo' };
    }
    
    if (number > 9999.99) {
      return { isValid: false, error: 'O valor máximo é 9999.99' };
    }
    
    return { isValid: true, error: '' };
  };

  const formatValue = (text) => {
    // Remove caracteres inválidos
    const cleanText = text.replace(/[^\d.]/g, '');
    
    if (!cleanText) return '';

    // Previne múltiplos pontos
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return displayValue;
    }

    if (unitType === 'KG') {
      // Para KG, permite decimais
      if (parts.length === 2) {
        // Tem ponto decimal
        const intPart = parts[0].slice(0, 4); // Máximo 4 dígitos
        const decPart = parts[1].slice(0, 2); // Máximo 2 decimais
        if (decPart) {
          return `${intPart}.${decPart}`;
        }
        return `${intPart}.`;
      }
      // Sem ponto decimal
      return parts[0].slice(0, 4);
    } else {
      // Para UN, apenas inteiros
      return parts[0].slice(0, 4);
    }
  };

  const handleChange = useCallback((text) => {
    const formatted = formatValue(text);
    if (formatted !== undefined) {
      setDisplayValue(formatted);

      // Validação básica
      const validation = validateValue(formatted);
      setValidationError(validation.error);

      // Notifica mudança com valor e unidade
      if (validation.isValid) {
        onChangeText({
          value: formatted || '0',
          unit: unitType,
          chosen_unit_type: unitType
        });
      }
    }
  }, [unitType, onChangeText]);

  const handleBlur = useCallback(() => {
    if (!displayValue) {
      setDisplayValue('');
      onChangeText({
        value: '0',
        unit: unitType,
        chosen_unit_type: unitType
      });
      return;
    }

    const number = parseFloat(displayValue);
    if (!isNaN(number)) {
      const formatted = unitType === 'KG' ? 
        number.toFixed(2) :
        Math.floor(number).toString();
      
      setDisplayValue(formatted);
      onChangeText({
        value: formatted,
        unit: unitType,
        chosen_unit_type: unitType
      });
    }
  }, [displayValue, unitType, onChangeText]);

  const toggleUnitType = useCallback(() => {
    const newType = unitType === 'KG' ? 'UN' : 'KG';
    setUnitType(newType);

    if (displayValue) {
      const number = parseFloat(displayValue);
      if (!isNaN(number)) {
        const newValue = newType === 'KG' ? 
          number.toFixed(2) :
          Math.floor(number).toString();
        
        setDisplayValue(newValue);
        onChangeText({
          value: newValue,
          unit: newType,
          chosen_unit_type: newType
        });
      }
    }
  }, [displayValue, unitType, onChangeText]);

  return (
    <View style={styles.container}>
      <TextInput
        label={label || 'Quantidade'}
        mode={mode}
        value={displayValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        keyboardType="decimal-pad"
        error={Boolean(validationError) || error}
        style={[styles.input, style]}
        right={
          <TextInput.Icon
            icon={unitType === 'KG' ? 'scale' : 'numeric'}
            onPress={toggleUnitType}
          />
        }
        {...props}
      />
      {validationError ? (
        <HelperText type="error" visible={true}>
          {validationError}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  input: {
    width: '100%'
  }
});

export default QuantityInput;
