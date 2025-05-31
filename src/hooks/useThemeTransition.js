import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';

/**
 * Hook personalizado para gerenciar transições suaves entre temas
 * Fornece valores animados que respondem às mudanças de tema
 */
export const useThemeTransition = (duration = 300) => {
  const { isDarkMode, theme } = useAppTheme();
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, duration, animatedValue]);

  // Interpolação para background color
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background, theme.colors.background],
  });

  // Interpolação para cor do texto
  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.onBackground, theme.colors.onBackground],
  });

  // Interpolação para elevação/sombra
  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  return {
    animatedValue,
    backgroundColor,
    textColor,
    shadowOpacity,
    isDarkMode,
    theme,
  };
};

/**
 * Hook para componentes que precisam de estilos animados baseados no tema
 */
export const useAnimatedThemeStyles = (lightStyles, darkStyles, duration = 300) => {
  const { isDarkMode } = useAppTheme();
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, duration, animatedValue]);

  const interpolateStyle = (lightValue, darkValue) => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [lightValue, darkValue],
    });
  };

  return {
    animatedValue,
    interpolateStyle,
    isDarkMode,
  };
};

export default useThemeTransition;