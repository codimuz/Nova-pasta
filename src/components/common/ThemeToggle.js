import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const [visible, setVisible] = React.useState(false);
  const { themePreference, setThemePreference, isDarkMode } = useAppTheme();
  const theme = useTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleThemeSelect = (preference) => {
    setThemePreference(preference);
    closeMenu();
  };

  const getThemeIcon = () => {
    switch (themePreference) {
      case 'light':
        return 'white-balance-sunny';
      case 'dark':
        return 'moon-waning-crescent';
      case 'auto':
      default:
        return 'theme-light-dark';
    }
  };

  const getThemeLabel = (preference) => {
    switch (preference) {
      case 'light':
        return 'Tema Claro';
      case 'dark':
        return 'Tema Escuro';
      case 'auto':
      default:
        return 'Automático';
    }
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          icon={getThemeIcon()}
          onPress={openMenu}
          iconColor={theme.colors.onSurface}
          size={24}
        />
      }
      contentStyle={styles.menuContent}
    >
      <View style={styles.menuHeader}>
        <Text variant="labelLarge" style={styles.menuTitle}>
          Escolher tema
        </Text>
      </View>
      
      <Menu.Item
        onPress={() => handleThemeSelect('light')}
        title="Claro"
        leadingIcon="white-balance-sunny"
        trailingIcon={themePreference === 'light' ? 'check' : undefined}
        titleStyle={[
          styles.menuItemTitle,
          themePreference === 'light' && styles.selectedItem
        ]}
      />
      
      <Menu.Item
        onPress={() => handleThemeSelect('dark')}
        title="Escuro"
        leadingIcon="moon-waning-crescent"
        trailingIcon={themePreference === 'dark' ? 'check' : undefined}
        titleStyle={[
          styles.menuItemTitle,
          themePreference === 'dark' && styles.selectedItem
        ]}
      />
      
      <Menu.Item
        onPress={() => handleThemeSelect('auto')}
        title="Automático"
        leadingIcon="theme-light-dark"
        trailingIcon={themePreference === 'auto' ? 'check' : undefined}
        titleStyle={[
          styles.menuItemTitle,
          themePreference === 'auto' && styles.selectedItem
        ]}
      />
      
      <View style={styles.menuFooter}>
        <Text variant="bodySmall" style={styles.footerText}>
          {themePreference === 'auto' 
            ? `Seguindo sistema: ${isDarkMode ? 'Escuro' : 'Claro'}`
            : `Tema: ${getThemeLabel(themePreference)}`
          }
        </Text>
      </View>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuContent: {
    borderRadius: 12,
    minWidth: 200,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuTitle: {
    fontWeight: '600',
  },
  menuItemTitle: {
    fontSize: 16,
  },
  selectedItem: {
    fontWeight: '600',
  },
  menuFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default ThemeToggle;