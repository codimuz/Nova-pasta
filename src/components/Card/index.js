import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const Card = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.components.card.backgroundColor,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.components.card.padding,
    margin: theme.components.card.margin,
    elevation: theme.components.card.elevation,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default Card;