import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

/**
 * ProductsScreen Component
 * 
 * Tela de Gestão de Produtos do aplicativo de inventário
 * Permite gerenciar o catálogo de produtos, adicionar, editar e remover itens
 */
const ProductsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Gestão de Produtos" />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          📦 Gestão de Produtos
        </Text>
        
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Gerencie todo o catálogo de produtos do seu inventário. 
          Adicione novos produtos, edite informações e mantenha seu estoque organizado.
        </Text>
        
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Funcionalidades disponíveis em breve:
        </Text>
        
        <Text variant="bodySmall" style={[styles.features, { color: theme.colors.onSurfaceVariant }]}>
          • Lista completa de produtos{'\n'}
          • Busca por nome ou código{'\n'}
          • Adicionar novos produtos{'\n'}
          • Editar informações dos produtos{'\n'}
          • Gerenciar preços e unidades{'\n'}
          • Importação em lote de produtos{'\n'}
          • Categorização de produtos
        </Text>
      </ScrollView>
    </SafeAreaView>
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

export default ProductsScreen;
