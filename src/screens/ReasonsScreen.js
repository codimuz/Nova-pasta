import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Text, useTheme, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import importService from '../services/ImportService';
import ImportProgressDialog from '../components/dialogs/ImportProgressDialog';

/**
 * ReasonsScreen Component
 *
 * Tela de Gestão de Motivos do aplicativo de inventário
 * Permite gerenciar os motivos de entrada e saída de produtos
 * Inclui funcionalidade de importação de CSV
 */
const ReasonsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  // Estados para controle da importação
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    visible: false,
    progress: 0,
    status: 'Preparando importação...',
    currentFile: '',
    processedLines: 0,
    totalLines: 0,
    canCancel: true,
    isCompleted: false,
    hasError: false,
  });
  
  // Referência para cancelamento da importação
  const cancelTokenRef = useRef({ cancelled: false });

  /**
   * Função para iniciar a importação de motivos
   */
  const handleImportReasons = async () => {
    try {
      setIsImporting(true);
      
      // Reset do token de cancelamento
      cancelTokenRef.current = { cancelled: false };
      
      // Reset do progresso
      setImportProgress({
        visible: true,
        progress: 0,
        status: 'Iniciando importação...',
        currentFile: '',
        processedLines: 0,
        totalLines: 0,
        canCancel: true,
        isCompleted: false,
        hasError: false,
      });

      // Executar importação com callback de progresso
      const result = await importService.importReasons(
        (progressData) => {
          setImportProgress(prev => ({
            ...prev,
            progress: progressData.progress || 0,
            status: progressData.status || 'Processando...',
            currentFile: progressData.currentFile || '',
            processedLines: progressData.processedLines || 0,
            totalLines: progressData.totalLines || 0,
            hasError: progressData.hasError || false,
          }));
        },
        cancelTokenRef.current
      );

      // Atualizar estado final baseado no resultado
      if (result.success) {
        const { stats } = result;
        
        setImportProgress(prev => ({
          ...prev,
          progress: 1,
          status: `Importação concluída! ${stats.inserted} criados, ${stats.updated} atualizados`,
          canCancel: false,
          isCompleted: true,
          hasError: false,
        }));

        // Exibir resumo da importação
        const message = createImportSummary(stats);
        setTimeout(() => {
          Alert.alert(
            'Importação Concluída',
            message,
            [{ text: 'OK' }]
          );
        }, 1000);
        
      } else {
        // Importação falhou ou foi cancelada
        if (result.stats?.cancelled) {
          setImportProgress(prev => ({
            ...prev,
            status: 'Importação cancelada pelo usuário',
            canCancel: false,
            isCompleted: true,
            hasError: false,
          }));
        } else {
          setImportProgress(prev => ({
            ...prev,
            status: `Erro na importação: ${result.message}`,
            canCancel: false,
            isCompleted: true,
            hasError: true,
          }));
        }
      }

    } catch (error) {
      console.error('REASONS_SCREEN: Erro na importação:', error);
      
      setImportProgress(prev => ({
        ...prev,
        status: `Erro inesperado: ${error.message}`,
        canCancel: false,
        isCompleted: true,
        hasError: true,
      }));
      
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Função para cancelar a importação
   */
  const handleCancelImport = () => {
    console.log('REASONS_SCREEN: Solicitando cancelamento da importação...');
    cancelTokenRef.current.cancelled = true;
    
    setImportProgress(prev => ({
      ...prev,
      status: 'Cancelando importação...',
      canCancel: false,
    }));
  };

  /**
   * Função para fechar o diálogo de progresso
   */
  const handleCloseProgressDialog = () => {
    setImportProgress(prev => ({
      ...prev,
      visible: false,
    }));
  };

  /**
   * Cria um resumo da importação para exibição
   */
  const createImportSummary = (stats) => {
    let summary = `Arquivo: ${stats.fileName}\n\n`;
    
    if (stats.inserted > 0) {
      summary += `✅ Motivos criados: ${stats.inserted}\n`;
    }
    
    if (stats.updated > 0) {
      summary += `📝 Motivos atualizados: ${stats.updated}\n`;
    }
    
    if (stats.errors.length > 0) {
      summary += `❌ Erros encontrados: ${stats.errors.length}\n\n`;
      
      // Mostrar primeiros 3 erros
      const firstErrors = stats.errors.slice(0, 3);
      summary += 'Primeiros erros:\n';
      firstErrors.forEach(error => {
        summary += `• Linha ${error.lineNumber}: ${error.error}\n`;
      });
      
      if (stats.errors.length > 3) {
        summary += `• ... e mais ${stats.errors.length - 3} erro(s)`;
      }
    } else {
      summary += '\n✨ Importação realizada sem erros!';
    }
    
    return summary;
  };

  /**
   * Exibe informações sobre o formato do arquivo CSV
   */
  const showCSVFormatInfo = () => {
    Alert.alert(
      'Formato do Arquivo CSV',
      'O arquivo CSV deve ter o seguinte formato:\n\n' +
      '• Separador: vírgula (,) ou ponto e vírgula (;)\n' +
      '• Codificação: UTF-8\n' +
      '• Colunas: code,description\n' +
      '• Primeira linha pode ser cabeçalho (será ignorada)\n\n' +
      'Exemplo:\n' +
      'code,description\n' +
      '01,Produto Vencido\n' +
      '02,Avaria no Transporte\n' +
      '03,Defeito de Fabricação\n\n' +
      '⚠️ Cada linha deve ter exatamente 2 campos.',
      [{ text: 'Entendi' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Gestão de Motivos" />
        <Appbar.Action icon="help-circle" onPress={showCSVFormatInfo} />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          🏷️ Gestão de Motivos
        </Text>
        
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Configure e gerencie os motivos de movimentação do seu inventário.
          Organize as razões de entrada e saída de produtos para melhor controle.
        </Text>

        {/* Card de Importação */}
        <Card style={styles.importCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.primary }]}>
              📥 Importar Motivos
            </Text>
            
            <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
              Importe motivos a partir de um arquivo CSV. O arquivo deve conter duas colunas: código e descrição.
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleImportReasons}
                disabled={isImporting}
                icon="file-upload"
                style={styles.importButton}
              >
                {isImporting ? 'Importando...' : 'Importar CSV'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={showCSVFormatInfo}
                icon="information"
                style={styles.infoButton}
                compact
              >
                Formato
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Outras funcionalidades disponíveis em breve:
        </Text>
        
        <Text variant="bodySmall" style={[styles.features, { color: theme.colors.onSurfaceVariant }]}>
          • Lista de todos os motivos{'\n'}
          • Adicionar novos motivos{'\n'}
          • Editar motivos existentes{'\n'}
          • Ativar/desativar motivos{'\n'}
          • Categorizar por tipo (entrada/saída){'\n'}
          • Estatísticas de uso por motivo{'\n'}
          • Exportação de motivos
        </Text>
      </View>

      {/* Diálogo de Progresso da Importação */}
      <ImportProgressDialog
        visible={importProgress.visible}
        onDismiss={handleCloseProgressDialog}
        onCancel={handleCancelImport}
        progress={importProgress.progress}
        status={importProgress.status}
        currentFile={importProgress.currentFile}
        processedLines={importProgress.processedLines}
        totalLines={importProgress.totalLines}
        canCancel={importProgress.canCancel}
        isCompleted={importProgress.isCompleted}
        hasError={importProgress.hasError}
      />
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
  importCard: {
    width: '100%',
    marginBottom: 24,
    maxWidth: 400,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  cardDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  importButton: {
    flex: 1,
  },
  infoButton: {
    minWidth: 80,
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

export default ReasonsScreen;