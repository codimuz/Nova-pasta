import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import TextInputMask from 'react-native-text-input-mask';

const QuantityInput = ({ value, onChangeText, initialUnitType = 'UN', label, mode = "outlined", style, error, ...props }) => {
  const [unitType, setUnitType] = useState(initialUnitType);
  const [displayValue, setDisplayValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

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

  const handleChange = useCallback((formatted, extracted) => {
    // O valor extraído já vem limpo da máscara
    const cleanValue = extracted || '';
    
    // Validação básica
    const validation = validateValue(cleanValue);
    setValidationError(validation.error);

    // Atualiza valor de exibição com formatação
    setDisplayValue(formatted || '');
    
    // Notifica mudança com valor limpo e unidade
    if (validation.isValid) {
      onChangeText({
        value: cleanValue || '0',
        unit: unitType,
        chosen_unit_type: unitType // Para compatibilidade com ExportService
      });
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

    const number = parseFloat(displayValue.replace(/[^\d.]/g, ''));
    
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
      const number = parseFloat(displayValue.replace(/[^\d.]/g, ''));
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
        onBlur={handleBlur}
        error={Boolean(validationError) || error}
        style={[styles.input, style]}
        render={props => (
          <TextInputMask
            {...props}
            ref={inputRef}
            mask={unitType === 'KG' ? '[9999].[99]' : '[9999]'}
            onChangeText={handleChange}
            keyboardType="decimal-pad"
          />
        )}
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
