import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import { ProductsProvider } from './src/contexts/ProductsContext';
import { initializeDatabase } from './src/database';

// Import all screens
import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ReasonsScreen from './src/screens/ReasonsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import custom drawer content
import DrawerContent from './src/components/navigation/DrawerContent';

// Create drawer navigator
const Drawer = createDrawerNavigator();

// Root Navigator component
const RootNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Use custom Appbar.Header
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Início'
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Relatórios'
        }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Histórico'
        }}
      />
      <Drawer.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'Produtos'
        }}
      />
      <Drawer.Screen
        name="Reasons"
        component={ReasonsScreen}
        options={{
          title: 'Motivos'
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações'
        }}
      />
    </Drawer.Navigator>
  );
};

// Component that uses the theme context and manages StatusBar
const AppContent = () => {
  const { theme, isDarkMode, isLoading } = useAppTheme();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        console.log('App initialized with WatermelonDB successfully');
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Erro ao inicializar aplicativo:', error);
      }
    };

    initializeApp();
  }, []);

  // Configure StatusBar based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.surface, true);
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
    } else {
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
    }
  }, [isDarkMode, theme.colors.surface]);

  // Show loading or prevent render until theme is loaded
  if (isLoading) {
    return null; // ou um componente de loading
  }

  // Create navigation theme based on app theme
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.primary,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <ProductsProvider
          options={{
            enableCache: true,
            cacheTimeout: 5 * 60 * 1000, // 5 minutos
            initialLoad: true,
          }}
        >
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.surface}
            translucent={false}
            animated={true}
          />
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </ProductsProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

// Main App component with ThemeProvider
const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
