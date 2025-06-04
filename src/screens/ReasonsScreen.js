import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

/**
 * ReasonsScreen Component
 * 
 * Tela de Gestão de Motivos do aplicativo de inventário
 * Permite gerenciar os motivos de entrada e saída de produtos
 */
const ReasonsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Gestão de Motivos" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          🏷️ Gestão de Motivos
        </Text>
        
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Configure e gerencie os motivos de movimentação do seu inventário.
          Organize as razões de entrada e saída de produtos para melhor controle.
        </Text>
        
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Funcionalidades disponíveis em breve:
        </Text>
        
        <Text variant="bodySmall" style={[styles.features, { color: theme.colors.onSurfaceVariant }]}>
          • Lista de todos os motivos{'\n'}
          • Adicionar novos motivos{'\n'}
          • Editar motivos existentes{'\n'}
          • Ativar/desativar motivos{'\n'}
          • Categorizar por tipo (entrada/saída){'\n'}
          • Estatísticas de uso por motivo{'\n'}
          • Motivos padrão do sistema
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

export default ReasonsScreen;