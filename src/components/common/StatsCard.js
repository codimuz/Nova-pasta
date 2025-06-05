import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

/**
 * StatsCard Component
 * 
 * Componente reutilizável para exibir estatísticas com animações suaves,
 * formatação de números grandes e suporte completo a temas claro/escuro.
 * 
 * @param {string} title - Título do card
 * @param {string|number} value - Valor principal a ser exibido
 * @param {string} subtitle - Texto secundário opcional
 * @param {React.ReactNode} icon - Ícone opcional para exibir
 * @param {string} variant - Variante de cor ('primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @param {string} highlightColor - Cor de destaque customizada (opcional)
 * @param {function} onPress - Função a ser executada ao pressionar o card
 * @param {object} style - Estilos adicionais para o card
 * @param {boolean} animated - Se deve aplicar animações (padrão: true)
 * @param {boolean} formatLargeNumbers - Se deve formatar números grandes (padrão: true)
 * @param {number} animationDelay - Atraso da animação em ms (padrão: 0)
 */
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'primary',
  highlightColor,
  onPress,
  style,
  animated = true,
  formatLargeNumbers = true,
  animationDelay = 0,
  ...props 
}) => {
  const theme = useTheme();
  
  // Refs para animações
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Efeito de animação de entrada
  useEffect(() => {
    if (animated) {
      const animationSequence = Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          delay: animationDelay,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: animationDelay + 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay: animationDelay + 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      animationSequence.start();
    } else {
      // Se animação está desabilitada, definir valores finais
      scaleAnim.setValue(1);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [animated, animationDelay, scaleAnim, fadeAnim, slideAnim]);

  /**
   * Formata números grandes para exibição mais legível
   */
  const formatNumber = (num) => {
    if (!formatLargeNumbers || typeof num !== 'number') {
      return num.toString();
    }

    const absNum = Math.abs(num);
    
    if (absNum >= 1e9) {
      return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (absNum >= 1e6) {
      return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (absNum >= 1e3) {
      return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    
    return num.toLocaleString();
  };

  /**
   * Obtém a cor de fundo do card baseada na variante ou cor customizada
   */
  const getCardColor = () => {
    if (highlightColor) {
      return highlightColor + '20'; // Adiciona transparência
    }

    switch (variant) {
      case 'success': 
        return theme.colors.successContainer || theme.colors.primaryContainer;
      case 'error': 
        return theme.colors.errorContainer || theme.colors.primaryContainer;
      case 'warning': 
        return theme.colors.warningContainer || theme.colors.primaryContainer;
      case 'info':
        return theme.colors.tertiaryContainer || theme.colors.primaryContainer;
      case 'secondary':
        return theme.colors.secondaryContainer;
      default: 
        return theme.colors.primaryContainer;
    }
  };

  /**
   * Obtém a cor do texto baseada na variante ou cor customizada
   */
  const getTextColor = () => {
    if (highlightColor) {
      return highlightColor;
    }

    switch (variant) {
      case 'success': 
        return theme.colors.onSuccessContainer || theme.colors.onPrimaryContainer;
      case 'error': 
        return theme.colors.onErrorContainer || theme.colors.onPrimaryContainer;
      case 'warning': 
        return theme.colors.onWarningContainer || theme.colors.onPrimaryContainer;
      case 'info':
        return theme.colors.onTertiaryContainer || theme.colors.onPrimaryContainer;
      case 'secondary':
        return theme.colors.onSecondaryContainer;
      default: 
        return theme.colors.onPrimaryContainer;
    }
  };

  /**
   * Obtém a cor do ícone baseada na variante
   */
  const getIconColor = () => {
    const baseColor = getTextColor();
    return highlightColor || baseColor;
  };

  // Determinar o valor formatado
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  // Estilos responsivos baseados no tamanho da tela
  const getResponsiveStyles = () => {
    const isSmallScreen = screenWidth < 360;
    const isMediumScreen = screenWidth < 768;

    return {
      card: {
        minHeight: isSmallScreen ? 90 : isMediumScreen ? 110 : 120,
        flex: isSmallScreen ? undefined : 1,
        width: isSmallScreen ? '100%' : undefined,
      },
      content: {
        padding: isSmallScreen ? spacing.sm : spacing.md,
      },
      title: {
        fontSize: isSmallScreen ? 10 : 12,
      },
      value: {
        fontSize: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
        lineHeight: isSmallScreen ? 24 : isMediumScreen ? 28 : 32,
      },
      subtitle: {
        fontSize: isSmallScreen ? 10 : 12,
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  // Estilo de transformação da animação
  const animatedStyle = animated ? {
    transform: [
      { scale: scaleAnim },
      { translateY: slideAnim },
    ],
    opacity: fadeAnim,
  } : {};

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Card 
        style={[
          styles.card,
          responsiveStyles.card,
          { backgroundColor: getCardColor() },
          onPress && styles.pressable,
        ]}
        elevation={2}
        onPress={onPress}
        mode="elevated"
        {...props}
      >
        <Card.Content style={[styles.content, responsiveStyles.content]}>
          <View style={styles.header}>
            <Text 
              variant="labelLarge" 
              style={[
                styles.title,
                responsiveStyles.title,
                { color: getTextColor(), opacity: 0.8 }
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {title}
            </Text>
            {icon && (
              <View style={styles.iconContainer}>
                {React.isValidElement(icon) 
                  ? React.cloneElement(icon, { color: getIconColor() })
                  : icon
                }
              </View>
            )}
          </View>
          
          <Text 
            variant="headlineMedium" 
            style={[
              styles.value,
              responsiveStyles.value,
              { color: getTextColor() }
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayValue}
          </Text>
          
          {subtitle && (
            <Text 
              variant="bodyMedium" 
              style={[
                styles.subtitle,
                responsiveStyles.subtitle,
                { color: getTextColor(), opacity: 0.7 }
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.cardMargin,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    // Sombra customizada para melhor aparência
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  pressable: {
    // Adiciona indicação visual para cards clicáveis
    transform: [{ scale: 1 }],
  },
  content: {
    justifyContent: 'space-between',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  iconContainer: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  value: {
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontVariant: ['tabular-nums'], // Para melhor alinhamento de números
  },
  subtitle: {
    lineHeight: 16,
    fontWeight: '400',
  },
});

export default StatsCard;
