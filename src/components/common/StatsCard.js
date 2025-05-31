import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { spacing } from '../../theme/spacing';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'primary',
  onPress,
  style,
  ...props 
}) => {
  const theme = useTheme();
  
  const getCardColor = () => {
    switch (variant) {
      case 'success': 
        return theme.colors.successContainer;
      case 'error': 
        return theme.colors.errorContainer;
      case 'warning': 
        return theme.colors.warningContainer;
      case 'secondary':
        return theme.colors.secondaryContainer;
      default: 
        return theme.colors.primaryContainer;
    }
  };
  
  const getValueColor = () => {
    switch (variant) {
      case 'success': 
        return theme.colors.onSuccessContainer;
      case 'error': 
        return theme.colors.onErrorContainer;
      case 'warning': 
        return theme.colors.onWarningContainer;
      case 'secondary':
        return theme.colors.onSecondaryContainer;
      default: 
        return theme.colors.onPrimaryContainer;
    }
  };
  
  return (
    <Card 
      style={[
        styles.card, 
        { backgroundColor: getCardColor() },
        style
      ]}
      elevation={2}
      onPress={onPress}
      {...props}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text 
            variant="labelLarge" 
            style={[
              styles.title,
              { color: getValueColor(), opacity: 0.8 }
            ]}
          >
            {title}
          </Text>
          {icon && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
        </View>
        
        <Text 
          variant="headlineMedium" 
          style={[
            styles.value,
            { color: getValueColor() }
          ]}
        >
          {value}
        </Text>
        
        {subtitle && (
          <Text 
            variant="bodyMedium" 
            style={[
              styles.subtitle,
              { color: getValueColor(), opacity: 0.7 }
            ]}
          >
            {subtitle}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.cardMargin,
    borderRadius: spacing.borderRadius.md,
    minHeight: 100,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginLeft: spacing.sm,
  },
  value: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default StatsCard;