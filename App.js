import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import { expoDbManager } from './src/database/expo-manager';

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await expoDbManager.initialize();
      } catch (error) {
        console.error('Erro ao inicializar aplicativo:', error);
        Alert.alert(
          'Erro de Inicialização',
          'Falha ao inicializar o banco de dados.'
        );
      }
    };
    initializeApp();
  }, []);

  return (
    <PaperProvider theme={MD3LightTheme}>
      <SafeAreaView style={StyleSheet.absoluteFillObject}>
        <StatusBar style="auto" />
        <HomeScreen />
      </SafeAreaView>
    </PaperProvider>
  );
}
