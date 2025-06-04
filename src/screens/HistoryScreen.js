import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

/**
 * HistoryScreen Component
 * 
 * Tela de Histórico de Quebras do aplicativo de inventário
 * Permite visualizar histórico de todas as movimentações e quebras registradas
 */
const HistoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Histórico de Quebras" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          📋 Histórico de Quebras
        </Text>
        
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Visualize todo o histórico de quebras e movimentações de estoque registradas no sistema.
          Acompanhe tendências e identifique padrões.
        </Text>
        
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Funcionalidades disponíveis em breve:
        </Text>
        
        <Text variant="bodySmall" style={[styles.features, { color: theme.colors.onSurfaceVariant }]}>
          • Lista completa de todas as quebras{'\n'}
          • Filtros por data, produto e motivo{'\n'}
          • Pesquisa por código de barras{'\n'}
          • Detalhes de cada movimentação{'\n'}
          • Ordenação cronológica{'\n'}
          • Exportação do histórico
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  subtitle: {
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  features: {
    textAlign: 'left',
    lineHeight: 20,
  },
});

export default HistoryScreen;