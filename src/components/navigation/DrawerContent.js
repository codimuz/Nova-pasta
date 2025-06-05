import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Drawer, Text, useTheme, Divider, Avatar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerContent = (props) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, navigation } = props;
  
  // Obter a rota ativa atual
  const activeRoute = state?.routes?.[state?.index]?.name;

  // Função para navegar para uma tela
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  // Função para verificar se um item está ativo
  const isActiveRoute = (routeName) => {
    return activeRoute === routeName;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.drawerContent,
          { paddingTop: insets.top }
        ]}
      >
        {/* Header do Drawer */}
        <View style={[
          styles.headerContainer,
          { backgroundColor: theme.colors.primary }
        ]}>
          <Avatar.Icon
            size={64}
            icon="package-variant-closed"
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primaryContainer }
            ]}
            color={theme.colors.onPrimaryContainer}
          />
          <Text 
            variant="headlineSmall" 
            style={[styles.appTitle, { color: theme.colors.onPrimary }]}
          >
            Invent App
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.appSubtitle, { color: theme.colors.onPrimary }]}
          >
            Controle de Perdas
          </Text>
        </View>

        {/* Seção Principal */}
        <Drawer.Section 
          title="Principal"
          titleStyle={{ color: theme.colors.onSurface }}
        >
          <Drawer.Item
            label="Início"
            icon="home-outline"
            active={isActiveRoute('Home')}
            onPress={() => navigateToScreen('Home')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
          {/* Nova Rota para Registrar Quebra */}
          <Drawer.Item
            label="Registrar Quebra"
            icon="alert-circle-plus-outline"
            active={isActiveRoute('BreakEntry')}
            onPress={() => navigateToScreen('BreakEntry')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
          <Drawer.Item
            label="Relatórios"
            icon="chart-bar"
            active={isActiveRoute('Reports')}
            onPress={() => navigateToScreen('Reports')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
          <Drawer.Item
            label="Histórico de Quebras"
            icon="history"
            active={isActiveRoute('History')}
            onPress={() => navigateToScreen('History')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
          <Drawer.Item
            label="Produtos"
            icon="package-variant-closed"
            active={isActiveRoute('Products')}
            onPress={() => navigateToScreen('Products')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
          <Drawer.Item
            label="Motivos"
            icon="tag-multiple-outline"
            active={isActiveRoute('Reasons')}
            onPress={() => navigateToScreen('Reasons')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
        </Drawer.Section>

        <Divider style={styles.divider} />

        {/* Seção de Configurações */}
        <Drawer.Section 
          title="Outros"
          titleStyle={{ color: theme.colors.onSurface }}
        >
          <Drawer.Item
            label="Configurações"
            icon="cog-outline"
            active={isActiveRoute('Settings')}
            onPress={() => navigateToScreen('Settings')}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                onSurfaceVariant: theme.colors.onSurfaceVariant,
              }
            }}
          />
        </Drawer.Section>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  headerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    marginBottom: 12,
  },
  appTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  divider: {
    marginVertical: 8,
  },
});

export default DrawerContent;
