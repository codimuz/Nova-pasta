// Material Design 3 - Grid baseado em 4dp
export const spacing = {
  // Base spacing (4dp units)
  xs: 4,   // 4dp
  sm: 8,   // 8dp
  md: 16,  // 16dp
  lg: 24,  // 24dp
  xl: 32,  // 32dp
  xxl: 48, // 48dp
  xxxl: 64, // 64dp
  
  // Component specific spacing
  componentPadding: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  
  // Layout spacing
  screenMargin: 16,
  sectionSpacing: 24,
  cardPadding: 16,
  cardMargin: 8,
  
  // Component dimensions
  buttonHeight: 40,
  buttonMinWidth: 64,
  inputHeight: 56,
  appBarHeight: 64,
  tabBarHeight: 48,
  fabSize: 56,
  iconSize: 24,
  
  // Touch targets (minimum 48dp for accessibility)
  touchTarget: 48,
  minTouchTarget: 44,
  
  // Elevation levels (Material Design 3)
  elevation: {
    level0: 0,  // Surface
    level1: 1,  // Cards at rest
    level2: 3,  // Cards on hover/focus
    level3: 6,  // Dropdowns, dialogs
    level4: 8,  // Navigation bars
    level5: 12, // Floating action button
  },
  
  // Border radius (Material Design 3 - rounded corners)
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },
  
  // Grid system
  gridGutter: 16,
  gridMargin: 16,
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  },
};

// Helper functions for consistent spacing
export const getSpacing = (multiplier = 1) => spacing.sm * multiplier;
export const getComponentPadding = (size = 'md') => spacing.componentPadding[size];
export const getElevation = (level = 0) => spacing.elevation[`level${level}`];
export const getBorderRadius = (size = 'md') => spacing.borderRadius[size];