import React from 'react';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../contexts/ThemeContext';

const AppTopBar = ({ 
  title, 
  onMenuPress, 
  onSearchPress, 
  showBackAction = false,
  onBackPress,
  actions = [],
  showThemeToggle = false,
  themeToggleComponent,
  ...props 
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  
  return (
    <Appbar.Header 
      style={{ 
        marginTop: insets.top,
        backgroundColor: theme.colors.surface,
        elevation: 4,
      }}
      {...props}
    >
      {showBackAction ? (
        <Appbar.BackAction 
          onPress={onBackPress}
          accessibilityLabel="Voltar"
          iconColor={theme.colors.onSurface}
        />
      ) : (
        <Appbar.Action 
          icon="menu" 
          onPress={onMenuPress}
          accessibilityLabel="Menu"
          iconColor={theme.colors.onSurface}
        />
      )}
      
      <Appbar.Content 
        title={title} 
        titleStyle={{ 
          fontWeight: '500',
          color: theme.colors.onSurface,
        }}
      />
      
      {onSearchPress && (
        <Appbar.Action 
          icon="magnify" 
          onPress={onSearchPress}
          accessibilityLabel="Buscar"
          iconColor={theme.colors.onSurface}
        />
      )}
      
      {actions.map((action, index) => (
        <Appbar.Action
          key={index}
          icon={action.icon}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel}
          iconColor={theme.colors.onSurface}
        />
      ))}
      
      {showThemeToggle && themeToggleComponent}
    </Appbar.Header>
  );
};

export default AppTopBar;