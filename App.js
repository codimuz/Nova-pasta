import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import { expoDbManager } from './src/database/expo-manager';
import HomeScreen from './src/screens/HomeScreen';

// Component that uses the theme context and manages StatusBar
const AppContent = () => {
  const { theme, isDarkMode, isLoading } = useAppTheme();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await expoDbManager.initialize();
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

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
          translucent={false}
          animated={true}
        />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <HomeScreen />
        </View>
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
