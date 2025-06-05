import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, useTheme, Button, Card, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { importService } from '../services/ImportService';
import { exportService } from '../services/ExportService';

/**
 * SettingsScreen Component
 * 
 * Tela de Configurações do aplicativo de inventário
 * Permite configurar preferências do usuário e configurações do sistema
 */
const SettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSanitizing, setIsSanitizing] = useState(false);

  const handleImportProducts = async () => {
    try {
      setIsImporting(true);
      await importService.importProducts();
    } catch (error) {
      console.error('Erro na importação:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportService.exportData();
    } catch (error) {
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSanitizeProducts = async () => {
    try {
      setIsSanitizing(true);
      await importService.sanitizeExistingProducts();
    } catch (error) {
      console.error('Erro na sanitização:', error);
    } finally {
      setIsSanitizing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Configurações" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          ⚙️ Configurações
        </Text>
        
        {/* Seção de Importação/Exportação */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              📁 Gestão de Dados
            </Text>
            
            <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
              Importe produtos ou exporte dados de inventário
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                icon="file-import"
                onPress={handleImportProducts}
                loading={isImporting}
                disabled={isImporting || isExporting || isSanitizing}
                style={styles.actionButton}
              >
                Importar Produtos
              </Button>
              
              <Button
                mode="contained"
                icon="file-export"
                onPress={handleExportData}
                loading={isExporting}
                disabled={isImporting || isExporting || isSanitizing}
                style={styles.actionButton}
              >
                Exportar Dados
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Seção de Manutenção */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              🔧 Manutenção
            </Text>
            
            <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
              Ferramentas para manutenção e correção de dados
            </Text>
            
            <Button
              mode="outlined"
              icon="auto-fix"
              onPress={handleSanitizeProducts}
              loading={isSanitizing}
              disabled={isImporting || isExporting || isSanitizing}
              style={styles.actionButton}
            >
              Corrigir Tipos de Unidade
            </Button>
            
            <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
              Corrige automaticamente o tipo de unidade (KG/UN) baseado no nome dos produtos
            </Text>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />
        
        {/* Seção de Configurações Futuras */}
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Outras configurações (em desenvolvimento):
        </Text>
        
        <Text variant="bodySmall" style={[styles.features, { color: theme.colors.onSurfaceVariant }]}>
          • Tema claro/escuro{'\n'}
          • Configurações de backup automático{'\n'}
          • Preferências de exportação{'\n'}
          • Configuração de códigos de barras{'\n'}
          • Notificações e alertas{'\n'}
          • Configurações de rede{'\n'}
          • Informações do aplicativo{'\n'}
          • Limpeza avançada de dados
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  subtitle: {
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  features: {
    textAlign: 'left',
    lineHeight: 20,
  },
});

export default SettingsScreen;