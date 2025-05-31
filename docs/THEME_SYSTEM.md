# Sistema de Temas - React Native Paper

Este documento descreve o sistema completo de alternância entre temas claro e escuro implementado na aplicação Invent.

## 📋 Funcionalidades Implementadas

### ✅ Funcionalidades Principais
- **Alternância entre temas claro e escuro** usando MD3LightTheme e MD3DarkTheme
- **Detecção automática do tema do sistema** (modo automático)
- **Persistência da preferência do usuário** usando AsyncStorage
- **Transições suaves entre temas** com animações customizadas
- **StatusBar responsivo** que se adapta ao tema atual
- **Componentes totalmente adaptáveis** ao sistema de temas

## 🏗️ Arquitetura do Sistema

### 1. Context Provider (`src/contexts/ThemeContext.js`)
Gerencia o estado global do tema da aplicação:

```javascript
import { useAppTheme } from './src/contexts/ThemeContext';

const { theme, isDarkMode, themePreference, toggleTheme } = useAppTheme();
```

**Propriedades disponíveis:**
- `theme`: Objeto do tema atual (MD3LightTheme ou MD3DarkTheme)
- `isDarkMode`: Boolean indicando se está no modo escuro
- `themePreference`: String com a preferência ('light', 'dark', 'auto')
- `toggleTheme()`: Função para alternar entre os temas
- `setThemePreference(preference)`: Função para definir preferência específica

### 2. Hook de Transições (`src/hooks/useThemeTransition.js`)
Fornece animações suaves para transições de tema:

```javascript
import { useThemeTransition } from './src/hooks/useThemeTransition';

const { backgroundColor, textColor, shadowOpacity } = useThemeTransition();
```

### 3. Componente de Alternância (`src/components/common/ThemeToggle.js`)
Botão/menu para alternar entre temas:

```javascript
import ThemeToggle from './src/components/common/ThemeToggle';

<ThemeToggle />
```

## 🚀 Como Usar

### Configuração Básica

1. **Wrap da aplicação com ThemeProvider:**
```javascript
import { ThemeProvider } from './src/contexts/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
};
```

2. **Usar o tema em componentes:**
```javascript
import { useAppTheme } from './src/contexts/ThemeContext';
import { useTheme } from 'react-native-paper';

const MyComponent = () => {
  const { isDarkMode } = useAppTheme();
  const theme = useTheme(); // Tema do React Native Paper
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.onBackground }}>
        Modo: {isDarkMode ? 'Escuro' : 'Claro'}
      </Text>
    </View>
  );
};
```

### Componentes Animados

Para componentes com transições suaves:

```javascript
import { useThemeTransition } from './src/hooks/useThemeTransition';
import { Animated } from 'react-native';

const AnimatedComponent = () => {
  const { backgroundColor, textColor } = useThemeTransition();
  
  return (
    <Animated.View style={{ backgroundColor }}>
      <Animated.Text style={{ color: textColor }}>
        Texto com transição suave
      </Animated.Text>
    </Animated.View>
  );
};
```

### Componentes Pré-construídos

#### AnimatedCard
```javascript
import AnimatedCard from './src/components/common/AnimatedCard';

<AnimatedCard title="Meu Card">
  <Text>Conteúdo do card com tema responsivo</Text>
</AnimatedCard>
```

#### AnimatedText
```javascript
import { AnimatedText } from './src/components/common/AnimatedCard';

<AnimatedText variant="headlineMedium">
  Texto com transição suave
</AnimatedText>
```

## 🎨 Personalização

### Criando Componentes Responsivos ao Tema

```javascript
import { useTheme } from 'react-native-paper';
import { useAppTheme } from './src/contexts/ThemeContext';

const CustomComponent = () => {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
      // Use cores do tema ao invés de valores fixos
    },
    text: {
      color: theme.colors.onSurface,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Componente responsivo</Text>
    </View>
  );
};
```

### Adicionando Transições Customizadas

```javascript
import { useAnimatedThemeStyles } from './src/hooks/useThemeTransition';

const CustomAnimatedComponent = () => {
  const { interpolateStyle } = useAnimatedThemeStyles();
  
  const animatedBackgroundColor = interpolateStyle('#FFFFFF', '#000000');
  const animatedBorderRadius = interpolateStyle(8, 16);
  
  return (
    <Animated.View 
      style={{
        backgroundColor: animatedBackgroundColor,
        borderRadius: animatedBorderRadius,
      }}
    >
      {/* Conteúdo */}
    </Animated.View>
  );
};
```

## 📱 StatusBar Responsivo

O StatusBar é automaticamente configurado no `App.js`:

```javascript
// Configuração automática baseada no tema
<StatusBar
  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  backgroundColor={theme.colors.surface}
  animated={true}
/>
```

## 💾 Persistência

A preferência do usuário é automaticamente salva no AsyncStorage:

- **Chave:** `@invent_theme_preference`
- **Valores:** `'light'`, `'dark'`, `'auto'`
- **Comportamento:** Carregada na inicialização da app

## 🔧 Configurações Avançadas

### Modificar Duração das Transições

```javascript
const { backgroundColor } = useThemeTransition(500); // 500ms ao invés de 300ms padrão
```

### Detectar Mudanças de Tema do Sistema

```javascript
import { useColorScheme } from 'react-native';

const systemTheme = useColorScheme(); // 'light' | 'dark' | null
```

## 📝 Boas Práticas

1. **Use sempre o hook `useTheme()` do React Native Paper** para acessar cores
2. **Evite cores hardcoded** nos estilos - use sempre do tema
3. **Para transições suaves**, use os hooks `useThemeTransition`
4. **Teste em ambos os temas** durante o desenvolvimento
5. **Considere o contraste** ao personalizar cores

## 🎯 Componentes de Exemplo

Veja `src/components/demo/ThemeDemo.js` para exemplos completos de implementação.

## 🐛 Troubleshooting

### Cores não mudando
- Verifique se está usando `theme.colors.x` ao invés de cores fixas
- Confirme que o componente está dentro do `ThemeProvider`

### Transições não funcionando
- Verifique se está usando `Animated.View/Text` com os valores animados
- Confirme que `useNativeDriver: false` está configurado para animações de cor

### Preferência não persistindo
- Verifique se o AsyncStorage está instalado e configurado
- Confirme permissões de storage no dispositivo