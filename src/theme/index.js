/**
 * Theme Configuration for Invent App
 * Mantém apenas configurações de espaçamento e tipografia
 * Cores são gerenciadas pelo tema padrão do React Native Paper
 */

// Sistema de espaçamento (múltiplos de 8dp)
export const spacing = {
  xs: 4,    // 4dp
  sm: 8,    // 8dp
  md: 16,   // 16dp (padrão conforme especificação)
  lg: 24,   // 24dp
  xl: 32,   // 32dp
  xxl: 48,  // 48dp
};

// Tipografia Roboto
export const typography = {
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
};

// Elevações e sombras
export const elevation = {
  level0: 0,    // Sem elevação
  level1: 1,    // Elevação baixa
  level2: 3,    // Cards (conforme especificação)
  level3: 6,    // Componentes elevados
  level4: 8,    // Botões elevated
  level5: 12,   // Elevação alta
};

// Border radius
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,        // Cards (conforme especificação)
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Dimensões de componentes
export const dimensions = {
  button: {
    height: 48,
    borderRadius: 24,
  },
  
  textInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  
  card: {
    borderRadius: 8,       // Conforme especificação
    elevation: 2,          // Sombra suave conforme especificação
    padding: 16,           // Padding interno conforme especificação
    margin: 16,
  },
  
  appBar: {
    height: 64,
  },
};

// Tema principal sem configurações de cor
export const theme = {
  spacing,
  typography,
  elevation,
  borderRadius,
  dimensions,
};

export default theme;