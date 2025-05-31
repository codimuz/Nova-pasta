import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  TextInput, 
  Button, 
  useTheme,
  HelperText 
} from 'react-native-paper';
import { spacing } from '../../theme/spacing';
import MotiveDropdown from './MotiveDropdown';

const EntryForm = ({ onSubmit, onCancel, initialData = {}, loading = false }) => {
  const [formData, setFormData] = useState({
    product_code: '',
    reason_id: null,
    quantity_lost: '',
    unit_cost: '',
    notes: '',
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const theme = useTheme();
  
  const validateForm = () => {
    const newErrors = {};
    
    // Product code validation
    if (!formData.product_code.trim()) {
      newErrors.product_code = 'Código do produto é obrigatório';
    } else if (formData.product_code.trim().length < 3) {
      newErrors.product_code = 'Código deve ter pelo menos 3 caracteres';
    }
    
    // Reason validation
    if (!formData.reason_id) {
      newErrors.reason_id = 'Motivo é obrigatório';
    }
    
    // Quantity validation
    if (!formData.quantity_lost.trim()) {
      newErrors.quantity_lost = 'Quantidade é obrigatória';
    } else {
      const quantity = Number(formData.quantity_lost);
      if (isNaN(quantity)) {
        newErrors.quantity_lost = 'Quantidade deve ser um número';
      } else if (quantity <= 0) {
        newErrors.quantity_lost = 'Quantidade deve ser maior que zero';
      } else if (quantity > 999999) {
        newErrors.quantity_lost = 'Quantidade muito alta';
      }
    }
    
    // Unit cost validation (optional but if provided, must be valid)
    if (formData.unit_cost.trim()) {
      const cost = Number(formData.unit_cost);
      if (isNaN(cost)) {
        newErrors.unit_cost = 'Custo deve ser um número';
      } else if (cost < 0) {
        newErrors.unit_cost = 'Custo não pode ser negativo';
      } else if (cost > 999999) {
        newErrors.unit_cost = 'Custo muito alto';
      }
    }
    
    // Notes validation (optional but limit length)
    if (formData.notes.length > 500) {
      newErrors.notes = 'Observações muito longas (máximo 500 caracteres)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const entryData = {
        ...formData,
        product_code: formData.product_code.trim(),
        quantity_lost: Number(formData.quantity_lost),
        unit_cost: formData.unit_cost.trim() ? Number(formData.unit_cost) : null,
        notes: formData.notes.trim() || null,
        entry_date: new Date().toISOString(),
      };
      
      await onSubmit(entryData);
    } catch (error) {
      console.error('Erro no formulário:', error);
      // Optionally set a general error state here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const resetForm = () => {
    setFormData({
      product_code: '',
      reason_id: null,
      quantity_lost: '',
      unit_cost: '',
      notes: '',
    });
    setErrors({});
  };
  
  const isFormDisabled = loading || isSubmitting;
  
  return (
    <Card style={styles.card} elevation={4}>
      <Card.Content style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Nova Entrada de Perda
        </Text>
        
        <ScrollView 
          style={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Code Input */}
          <TextInput
            label="Código do Produto *"
            value={formData.product_code}
            onChangeText={(value) => updateField('product_code', value)}
            error={!!errors.product_code}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: 1234567890"
            disabled={isFormDisabled}
            maxLength={50}
          />
          <HelperText type="error" visible={!!errors.product_code}>
            {errors.product_code}
          </HelperText>
          
          {/* Motive Dropdown */}
          <MotiveDropdown
            value={formData.reason_id}
            onValueChange={(value) => updateField('reason_id', value)}
            error={errors.reason_id}
            disabled={isFormDisabled}
            style={styles.input}
          />
          
          {/* Quantity Input */}
          <TextInput
            label="Quantidade Perdida *"
            value={formData.quantity_lost}
            onChangeText={(value) => updateField('quantity_lost', value)}
            error={!!errors.quantity_lost}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ex: 5"
            disabled={isFormDisabled}
            maxLength={10}
          />
          <HelperText type="error" visible={!!errors.quantity_lost}>
            {errors.quantity_lost}
          </HelperText>
          
          {/* Unit Cost Input */}
          <TextInput
            label="Custo Unitário"
            value={formData.unit_cost}
            onChangeText={(value) => updateField('unit_cost', value)}
            error={!!errors.unit_cost}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="Ex: 3.50"
            disabled={isFormDisabled}
            maxLength={10}
            left={<TextInput.Affix text="R$" />}
          />
          <HelperText type="info" visible={!errors.unit_cost}>
            Opcional - Para calcular valor da perda
          </HelperText>
          <HelperText type="error" visible={!!errors.unit_cost}>
            {errors.unit_cost}
          </HelperText>
          
          {/* Notes Input */}
          <TextInput
            label="Observações"
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            error={!!errors.notes}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Detalhes adicionais sobre a perda..."
            disabled={isFormDisabled}
            maxLength={500}
          />
          <HelperText type="info" visible={!errors.notes}>
            {formData.notes.length}/500 caracteres
          </HelperText>
          <HelperText type="error" visible={!!errors.notes}>
            {errors.notes}
          </HelperText>
        </ScrollView>
      </Card.Content>
      
      <Card.Actions style={styles.actions}>
        <Button 
          mode="outlined" 
          onPress={onCancel}
          disabled={isFormDisabled}
          style={styles.button}
        >
          Cancelar
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isFormDisabled}
          style={styles.button}
        >
          Salvar Entrada
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    // Removido backgroundColor customizado - usando padrão do tema
    borderRadius: spacing.borderRadius.lg,
    margin: spacing.md,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    maxHeight: 400, // Limit height for scrolling
  },
  input: {
    marginBottom: spacing.xs,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  button: {
    minWidth: 100,
  },
});

export default EntryForm;