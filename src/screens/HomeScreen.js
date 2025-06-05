// src/screens/HomeScreen.js
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, useTheme, Card, Button, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ThemeToggle from '../components/common/ThemeToggle';
import StatsCard from '../components/common/StatsCard'; // Supondo que você tenha este componente
import { spacing } from '../theme'; // Supondo que você tenha este arquivo de espaçamento

/**
 * HomeScreen Component
 *
 * Tela principal do aplicativo de inventário.
 * Exibe um dashboard com estatísticas e acesso rápido às funcionalidades.
 */
const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // Dados de exemplo para os cards de estatísticas
  // Você pode buscar esses dados de forma dinâmica no futuro
  const statsData = [
    { 
      title: 'Produtos Cadastrados', 
      value: 1247, 
      subtitle: 'Itens no estoque',
      iconName: 'package-variant-closed', 
      variant: 'primary', 
      screen: 'Products' 
    },
    { 
      title: 'Quebras Hoje', 
      value: 12, 
      subtitle: 'Registradas hoje',
      iconName: 'alert-octagon-outline', 
      variant: 'error', 
      screen: 'History' 
    },
    { 
      title: 'Total de Quebras (Mês)', 
      value: 2847, 
      subtitle: 'Este mês',
      iconName: 'chart-line', 
      variant: 'warning', 
      screen: 'Reports' 
    },
    { 
      title: 'Motivos Ativos', 
      value: 8, 
      subtitle: 'Categorizados',
      iconName: 'tag-multiple-outline', 
      variant: 'secondary', 
      screen: 'Reasons' 
    },
  ];

  const handleNavigate = (screenName) => {
    if (screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Início - Inventário" />
        <ThemeToggle />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Dashboard do Inventário
        </Text>

        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Bem-vindo ao sistema de controle de perdas. Acesse as funcionalidades através do menu ou dos atalhos abaixo.
        </Text>

        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={<List.Icon icon={stat.iconName} />}
              variant={stat.variant}
              style={styles.statsCard}
              onPress={() => handleNavigate(stat.screen)}
              animationDelay={index * 150} // Animação escalonada
              formatLargeNumbers={true}
              animated={true}
            />
          ))}
        </View>

        {/* Ações Rápidas */}
        <Card style={styles.actionsCard}>
          <Card.Title title="Ações Rápidas" titleVariant="titleMedium" />
          <Card.Content>
            <Button
              mode="contained"
              icon="plus-circle-outline"
              onPress={() => navigation.navigate('BreakEntry')} // Navega para a tela de registrar quebra
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
            >
              Registrar Nova Quebra
            </Button>
            <Button
              mode="outlined"
              icon="format-list-bulleted"
              onPress={() => navigation.navigate('Products')}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
            >
              Gerenciar Produtos
            </Button>
             <Button
              mode="outlined"
              icon="chart-bar"
              onPress={() => navigation.navigate('Reports')}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
            >
              Visualizar Relatórios
            </Button>
            <Button
              mode="text"
              icon="cog-outline"
              onPress={() => navigation.navigate('Settings')}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
            >
              Configurações
            </Button>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          Utilize o menu lateral para explorar todas as funcionalidades do aplicativo.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Alterado para space-around para melhor distribuição
    marginBottom: spacing.md,
  },
  statsCard: {
    width: '48%',
    marginBottom: spacing.md,
    minHeight: 120, // Altura mínima para consistência
  },
  actionsCard: {
    marginBottom: spacing.lg,
    elevation: 2, // Adiciona uma leve sombra
  },
  actionButton: {
    marginVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 14, // Tamanho de fonte consistente para botões
  },
  footerText: {
    textAlign: 'center',
    marginTop: spacing.lg,
    opacity: 0.8,
  },
});

export default HomeScreen;
