import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useThemeTransition } from '../../hooks/useThemeTransition';

/**
 * Componente Card com transições suaves de tema
 * Demonstra como implementar animações responsivas ao tema
 */
const AnimatedCard = ({ 
  children, 
  title, 
  subtitle,
  elevation = 2,
  style,
  ...props 
}) => {
  const theme = useTheme();
  const { animatedValue, shadowOpacity } = useThemeTransition();

  // Animated styles que respondem ao tema
  const animatedStyles = {
    backgroundColor: theme.colors.surface,
    shadowOpacity: shadowOpacity,
    borderColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.outline, theme.colors.outline],
    }),
  };

  return (
    <Animated.View style={[styles.container, animatedStyles, style]}>
      <Card 
        style={[styles.card, { backgroundColor: 'transparent' }]}
        elevation={elevation}
        {...props}
      >
        {title && (
          <Card.Title
            title={title}
            subtitle={subtitle}
            titleStyle={{ color: theme.colors.onSurface }}
            subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        )}
        
        <Card.Content>
          {children}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

/**
 * Componente de texto animado que responde ao tema
 */
export const AnimatedText = ({ 
  children, 
  variant = 'bodyMedium',
  style,
  animated = true,
  ...props 
}) => {
  const theme = useTheme();
  const { textColor } = useThemeTransition();

  if (!animated) {
    return (
      <Text 
        variant={variant} 
        style={[{ color: theme.colors.onSurface }, style]}
        {...props}
      >
        {children}
      </Text>
    );
  }

  return (
    <Animated.Text 
      style={[
        theme.fonts[variant] || theme.fonts.bodyMedium,
        { color: textColor },
        style
      ]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

/**
 * Container animado que responde ao tema
 */
export const AnimatedContainer = ({ 
  children, 
  style,
  ...props 
}) => {
  const { backgroundColor } = useThemeTransition();

  return (
    <Animated.View 
      style={[
        styles.animatedContainer,
        { backgroundColor },
        style
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    // Sombra será controlada pela animação
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    borderRadius: 12,
  },
  animatedContainer: {
    flex: 1,
  },
});

export default AnimatedCard;