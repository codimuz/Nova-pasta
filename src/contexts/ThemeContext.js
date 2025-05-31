import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@invent_theme_preference';

const ThemeContext = createContext({
  theme: MD3LightTheme,
  isDarkMode: false,
  themePreference: 'auto', // 'light', 'dark', 'auto'
  toggleTheme: () => {},
  setThemePreference: () => {},
});

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Determine current theme based on preference and system theme
  const isDarkMode = themePreference === 'dark' || 
    (themePreference === 'auto' && systemTheme === 'dark');
  
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      saveThemePreference(themePreference);
    }
  }, [themePreference, isLoading]);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        setThemePreference(stored);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (preference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setThemePreference(current => {
      switch (current) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'auto';
        case 'auto':
        default:
          return 'light';
      }
    });
  };

  const setThemePreferenceValue = (preference) => {
    if (['light', 'dark', 'auto'].includes(preference)) {
      setThemePreference(preference);
    }
  };

  const value = {
    theme,
    isDarkMode,
    themePreference,
    toggleTheme,
    setThemePreference: setThemePreferenceValue,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;