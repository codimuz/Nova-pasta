import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  
  inputContainer: {
    position: 'relative',
  },
  
  textInput: {
    height: theme.components.textInput.height,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingRight: 48, // Espaço para o botão clear
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.surface,
  },
  
  textInputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  
  textInputError: {
    borderColor: theme.colors.error,
  },
  
  clearButton: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  clearButtonText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 12,
  },
  
  suggestionsContainer: {
    position: 'absolute',
    top: theme.components.textInput.height + 4,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.sm,
    elevation: theme.elevation.level3,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    maxHeight: 200,
  },
  
  suggestionsList: {
    maxHeight: 200,
  },
  
  suggestionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  
  suggestionItemPressed: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  
  suggestionName: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    marginBottom: 2,
  },
  
  suggestionCode: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
  },
  
  loadingContainer: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    marginLeft: theme.spacing.sm,
  },
  
  messageContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  
  noResultsText: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
  },
  
  errorText: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
  },
  
  minCharsText: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Animações
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
});

export default styles;
