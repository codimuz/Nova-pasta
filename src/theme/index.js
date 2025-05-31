/**
 * Material Design 3 Theme for Invent App
 * Configuração do sistema de design seguindo as especificações Material Design 3
 */

export const theme = {
  colors: {
    // Cores principais
    primary: '#6200EE',           // Azul primário
    primaryContainer: '#EADDFF',  // Container primário
    onPrimary: '#FFFFFF',         // Texto sobre primário
    onPrimaryContainer: '#21005D', // Texto sobre container primário
    
    // Cores de superfície
    background: '#f5f5f5',        // Cinza claro para fundo
    surface: '#FFFFFF',           // Branco para cards
    surfaceVariant: '#E7E0EC',    // Variante da superfície
    onSurface: '#333333',         // Texto sobre superfície
    onSurfaceVariant: '#666666',  // Texto secundário
    
    // Cores de contorno
    outline: '#CCCCCC',           // Bordas
    outlineVariant: '#E0E0E0',    // Bordas variantes
    
    // Estados
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    
    // Sombras
    shadow: '#000000',
    scrim: '#000000',
    
    // Cores customizadas
    text: '#333333',              // Texto principal
    textSecondary: '#666666',     // Texto secundário
    border: '#CCCCCC',            // Bordas padrão
    disabled: '#9E9E9E',          // Elementos desabilitados
  },
  
  // Sistema de espaçamento (múltiplos de 8dp)
  spacing: {
    xs: 4,    // 4dp
    sm: 8,    // 8dp
    md: 16,   // 16dp (padrão conforme especificação)
    lg: 24,   // 24dp
    xl: 32,   // 32dp
    xxl: 48,  // 48dp
  },
  
  // Tipografia Roboto
  typography: {
    fontFamily: 'Roboto',
    sizes: {
      displayLarge: 57,
      displayMedium: 45,
      displaySmall: 36,
      headlineLarge: 32,
      headlineMedium: 28,
      headlineSmall: 24,
      titleLarge: 22,
      titleMedium: 20,     // Para TopAppBar
      titleSmall: 14,
      labelLarge: 14,
      labelMedium: 12,
      labelSmall: 11,
      bodyLarge: 16,       // Texto principal
      bodyMedium: 14,
      bodySmall: 12,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Elevações e sombras
  elevation: {
    level0: 0,    // Sem elevação
    level1: 1,    // Elevação baixa
    level2: 3,    // Cards (conforme especificação)
    level3: 6,    // Componentes elevados
    level4: 8,    // Botões elevated
    level5: 12,   // Elevação alta
  },
  
  // Border radius
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,        // Cards (conforme especificação)
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Componentes específicos
  components: {
    topAppBar: {
      height: 64,
      backgroundColor: '#6200EE',
      titleColor: '#FFFFFF',
      iconColor: '#FFFFFF',
    },
    
    button: {
      filled: {
        backgroundColor: '#6200EE',
        textColor: '#FFFFFF',
        height: 48,
        borderRadius: 24,
      },
      elevated: {
        backgroundColor: '#FFFFFF',
        textColor: '#6200EE',
        height: 48,
        borderRadius: 24,
        elevation: 8,
      },
      outlined: {
        backgroundColor: 'transparent',
        textColor: '#6200EE',
        borderColor: '#CCCCCC',
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
      },
    },
    
    textInput: {
      height: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#CCCCCC',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: '#333333',
      focusedBorderColor: '#6200EE',
    },
    
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,       // Conforme especificação
      elevation: 2,          // Sombra suave conforme especificação
      padding: 16,           // Padding interno conforme especificação
      margin: 16,
    },
  },
};

// Provider theme para @react-native-material/core
export const materialTheme = {
  palette: {
    primary: {
      main: theme.colors.primary,
      on: theme.colors.onPrimary,
      container: theme.colors.primaryContainer,
      onContainer: theme.colors.onPrimaryContainer,
    },
    background: theme.colors.background,
    surface: theme.colors.surface,
    error: theme.colors.error,
  },
  typography: {
    button: {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.labelLarge,
      fontWeight: theme.typography.weights.medium,
    },
    body1: {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.bodyLarge,
      fontWeight: theme.typography.weights.regular,
    },
    h6: {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.titleMedium,
      fontWeight: theme.typography.weights.medium,
    },
  },
  shape: {
    borderRadius: theme.borderRadius.sm,
  },
};

// Exportações para facilitar uso
export const colors = theme.colors;
export const spacing = theme.spacing;
export const typography = theme.typography;
export const elevation = theme.elevation;
export const borderRadius = theme.borderRadius;

export default theme;