import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

/**
 * SettingsScreen Component
 * 
 * Tela de Configurações do aplicativo de inventário
 * Permite configurar preferências do usuário e configurações do sistema
 */
const SettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Configurações" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          ⚙️ Configurações
        </Text>
        
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Personalize sua experiência com o aplicativo. 
          Configure preferências, temas e parâmetros do sistema para otimizar seu fluxo de trabalho.
        </Text>
        
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Configurações disponíveis em breve:
        </Text>
        
        <Text variant="bodySmall" style={[styles.features, { color: theme.colors.onSurfaceVariant }]}>
          • Tema claro/escuro{'\n'}
          • Configurações de backup{'\n'}
          • Preferências de exportação{'\n'}
          • Configuração de códigos de barras{'\n'}
          • Notificações e alertas{'\n'}
          • Configurações de rede{'\n'}
          • Informações do aplicativo{'\n'}
          • Limpeza de dados
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

export default SettingsScreen;