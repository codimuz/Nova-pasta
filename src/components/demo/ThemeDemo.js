import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Chip, Divider } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';
import AnimatedCard, { AnimatedText, AnimatedContainer } from '../common/AnimatedCard';
import ThemeToggle from '../common/ThemeToggle';

/**
 * Componente de demonstração do sistema de temas
 * Mostra como os componentes respondem às mudanças de tema
 */
const ThemeDemo = () => {
  const { theme, isDarkMode, themePreference } = useAppTheme();

  const getThemeInfo = () => {
    return {
      mode: isDarkMode ? 'Escuro' : 'Claro',
      preference: themePreference,
      surface: theme.colors.surface,
      background: theme.colors.background,
      primary: theme.colors.primary,
      onSurface: theme.colors.onSurface,
    };
  };

  const themeInfo = getThemeInfo();

  return (
    <AnimatedContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Demonstração de Temas
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sistema de alternância entre temas claro e escuro
          </Text>
          <ThemeToggle />
        </View>

        <AnimatedCard title="Informações do Tema Atual">
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text variant="labelMedium">Modo:</Text>
              <Chip 
                icon={isDarkMode ? 'moon-waning-crescent' : 'white-balance-sunny'}
                style={styles.chip}
              >
                {themeInfo.mode}
              </Chip>
            </View>
            
            <View style={styles.infoItem}>
              <Text variant="labelMedium">Preferência:</Text>
              <Chip style={styles.chip}>
                {themeInfo.preference}
              </Chip>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.colorDemo}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Cores do Tema
            </Text>
            
            <View style={styles.colorGrid}>
              <View style={styles.colorItem}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: theme.colors.primary }
                  ]} 
                />
                <Text variant="bodySmall">Primary</Text>
              </View>
              
              <View style={styles.colorItem}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: theme.colors.surface }
                  ]} 
                />
                <Text variant="bodySmall">Surface</Text>
              </View>
              
              <View style={styles.colorItem}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: theme.colors.background }
                  ]} 
                />
                <Text variant="bodySmall">Background</Text>
              </View>
              
              <View style={styles.colorItem}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: theme.colors.secondary }
                  ]} 
                />
                <Text variant="bodySmall">Secondary</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard title="Componentes Responsivos">
          <Text variant="bodyMedium" style={styles.description}>
            Todos os componentes se adaptam automaticamente ao tema selecionado:
          </Text>
          
          <View style={styles.componentDemo}>
            <Button mode="contained" style={styles.demoButton}>
              Botão Contained
            </Button>
            
            <Button mode="outlined" style={styles.demoButton}>
              Botão Outlined
            </Button>
            
            <Button mode="text" style={styles.demoButton}>
              Botão Text
            </Button>
          </View>
          
          <View style={styles.chipDemo}>
            <Chip icon="check" style={styles.chip}>Success</Chip>
            <Chip icon="alert" style={styles.chip}>Warning</Chip>
            <Chip icon="close" style={styles.chip}>Error</Chip>
          </View>
        </AnimatedCard>

        <AnimatedCard title="Texto Animado">
          <AnimatedText variant="headlineSmall">
            Este texto usa transições suaves
          </AnimatedText>
          
          <AnimatedText variant="bodyMedium" style={styles.animatedTextDemo}>
            As cores do texto se adaptam automaticamente com animações suaves 
            quando você alterna entre os temas. Isso proporciona uma experiência 
            visual mais agradável para o usuário.
          </AnimatedText>
          
          <Text variant="bodySmall" style={styles.note}>
            💡 Dica: Experimente alternar entre os temas usando o botão no topo 
            da tela para ver as transições em ação.
          </Text>
        </AnimatedCard>

        <Card style={styles.featuresCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.featuresTitle}>
              Funcionalidades Implementadas
            </Text>
            
            <View style={styles.featuresList}>
              <Text variant="bodyMedium">✅ Alternância entre temas claro e escuro</Text>
              <Text variant="bodyMedium">✅ Detecção automática do tema do sistema</Text>
              <Text variant="bodyMedium">✅ Persistência da preferência do usuário</Text>
              <Text variant="bodyMedium">✅ Transições suaves entre temas</Text>
              <Text variant="bodyMedium">✅ StatusBar responsivo ao tema</Text>
              <Text variant="bodyMedium">✅ Componentes totalmente adaptáveis</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </AnimatedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  chip: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  colorDemo: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  colorItem: {
    alignItems: 'center',
    margin: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  componentDemo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    flexWrap: 'wrap',
  },
  demoButton: {
    margin: 4,
  },
  chipDemo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  animatedTextDemo: {
    marginVertical: 12,
    lineHeight: 22,
  },
  note: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    fontStyle: 'italic',
  },
  featuresCard: {
    margin: 16,
    marginBottom: 32,
  },
  featuresTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 8,
  },
});

export default ThemeDemo;