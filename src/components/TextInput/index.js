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
      color={theme.colors.primary}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    height: theme.components.textInput.height,
    backgroundColor: theme.components.textInput.backgroundColor,
    borderRadius: theme.components.textInput.borderRadius,
    fontSize: theme.components.textInput.fontSize,
    color: theme.components.textInput.color,
    marginVertical: theme.spacing.sm,
  },
});

export default TextInput;