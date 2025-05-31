# Migração para React Native Paper - Tema Padrão

## Visão Geral
Este documento descreve a estratégia de migração para usar o tema padrão do React Native Paper, removendo todas as customizações atuais de tema.

## Objetivos
- Simplificar o sistema de tema
- Usar o design system padrão do React Native Paper
- Manter consistência visual através dos componentes nativos

## Mudanças Planejadas

### 1. Remoção de Arquivos
Os seguintes arquivos serão removidos pois não serão mais necessários:
- `src/theme/colors.js`
- `src/theme/typography.js`
- `src/theme/spacing.js`

### 2. Novo Provider
Em `App.js`, implementaremos o PaperProvider com o tema padrão:

```javascript
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      {/* App content */}
    </PaperProvider>
  );
}
```

### 3. Benefícios
- Melhor manutenibilidade
- Consistência com o Material Design 3
- Compatibilidade garantida com atualizações do Paper
- Redução de código personalizado

## Próximos Passos
1. Remover arquivos de tema customizado
2. Implementar PaperProvider com MD3LightTheme
3. Adaptar componentes para usar o tema padrão

## Impacto
- Visual: A aplicação seguirá o design system padrão do Material Design 3
- Desenvolvimento: Simplificação do processo de estilização
- Manutenção: Redução de código personalizado para manter