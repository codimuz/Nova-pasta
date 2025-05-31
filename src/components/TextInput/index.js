import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as MaterialTextInput } from '@react-native-material/core';
import { theme } from '../../theme';

const TextInput = ({ 
  label,
  value,
  onChangeText,
  placeholder,
  style,
  variant = "outlined",
  ...props 
}) => {
  return (
    <MaterialTextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      variant={variant}
      style={[styles.textInput, style]}
      // Removido color customizado - usando padrão do sistema
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    height: theme.dimensions.textInput.height,
    // Removido backgroundColor customizado - usando padrão do sistema
    borderRadius: theme.dimensions.textInput.borderRadius,
    fontSize: theme.dimensions.textInput.fontSize,
    // Removido color customizado - usando padrão do sistema
    marginVertical: theme.spacing.sm,
  },
});

export default TextInput;