import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

const TopAppBar = ({ title, onMenuPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>{title}</Text>
      
      {/* Spacer para balancear o layout */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    // Removido backgroundColor customizado - usando padrão do sistema
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  menuIcon: {
    fontSize: 20,
    // Removido color customizado - usando padrão do sistema
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.headlineSmall,
    fontWeight: theme.typography.weights.medium,
    // Removido color customizado - usando padrão do sistema
    fontFamily: theme.typography.fontFamily,
    marginLeft: theme.spacing.md,
  },
  spacer: {
    width: 40,
  },
});

export default TopAppBar;