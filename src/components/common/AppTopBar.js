import React from 'react';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AppTopBar = ({ 
  title, 
  onMenuPress, 
  onSearchPress, 
  showBackAction = false,
  onBackPress,
  actions = [],
  ...props 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Appbar.Header 
      style={{ marginTop: insets.top }}
      {...props}
    >
      {showBackAction ? (
        <Appbar.BackAction 
          onPress={onBackPress}
          accessibilityLabel="Voltar"
        />
      ) : (
        <Appbar.Action 
          icon="menu" 
          onPress={onMenuPress}
          accessibilityLabel="Menu"
        />
      )}
      
      <Appbar.Content 
        title={title} 
        titleStyle={{ fontWeight: '500' }}
      />
      
      {onSearchPress && (
        <Appbar.Action 
          icon="magnify" 
          onPress={onSearchPress}
          accessibilityLabel="Buscar"
        />
      )}
      
      {actions.map((action, index) => (
        <Appbar.Action
          key={index}
          icon={action.icon}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel}
        />
      ))}
    </Appbar.Header>
  );
};

export default AppTopBar;