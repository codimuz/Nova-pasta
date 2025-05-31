import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from '@react-native-material/core';
import { Alert } from 'react-native';
import { materialTheme } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import { expoDbManager } from './src/database/expo-manager';

export default function App() {
  // Inicializar banco de dados quando app carrega
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Inicializando aplicativo...');
        await expoDbManager.initialize();
        console.log('Aplicativo inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar aplicativo:', error);
        Alert.alert(
          'Erro de Inicialização',
          'Falha ao inicializar o banco de dados. O app pode não funcionar corretamente.'
        );
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider theme={materialTheme}>
      <StatusBar style="light" backgroundColor="#6200EE" />
      <HomeScreen />
    </Provider>
  );
}
