/**
 * ImportProgressDialog Component
 * Componente que exibe o progresso de importação de arquivos em tempo real
 * Utiliza Surface do react-native-paper para interface padrão
 */

import React from 'react';
import { View } from 'react-native';
import {
  Surface,
  Portal,
  Text,
  ProgressBar,
  Button,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';

const ImportProgressDialog = ({
  visible,
  onDismiss,
  onCancel,
  progress = 0,
  status = 'Preparando importação...',
  currentFile = '',
  processedLines = 0,
  totalLines = 0,
  canCancel = true,
  isCompleted = false,
  hasError = false,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  const getStatusColor = () => {
    if (hasError) return theme.colors.error;
    if (isCompleted) return theme.colors.primary;
    return theme.colors.onSurface;
  };

  const getProgressColor = () => {
    if (hasError) return theme.colors.error;
    if (isCompleted) return theme.colors.primary;
    return theme.colors.primary;
  };

  const handleCancel = () => {
    if (onCancel && canCancel && !isCompleted) {
      onCancel();
    }
  };

  const handleDismiss = () => {
    if (isCompleted || hasError) {
      onDismiss();
    }
  };

  return (
    <Portal>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <Surface elevation={4}>
          <View style={{ padding: 24, minWidth: 300, maxWidth: 400 }}>
            {/* Título */}
            <Text
              variant="headlineSmall"
              style={{
                textAlign: 'center',
                marginBottom: 16,
                color: getStatusColor()
              }}
            >
              {hasError ? '❌ Erro na Importação' :
               isCompleted ? '✅ Importação Concluída' :
               '📥 Importando Produtos'}
            </Text>
            
            {/* Status Principal */}
            <Text
              variant="bodyLarge"
              style={{
                textAlign: 'center',
                marginBottom: 12,
                color: getStatusColor()
              }}
            >
              {status}
            </Text>

            {/* Nome do Arquivo */}
            {currentFile && (
              <Text
                variant="bodyMedium"
                style={{
                  textAlign: 'center',
                  marginBottom: 8,
                  color: theme.colors.onSurfaceVariant
                }}
              >
                📄 {currentFile}
              </Text>
            )}

            {/* Progresso Numérico */}
            {totalLines > 0 && (
              <Text
                variant="bodySmall"
                style={{
                  textAlign: 'center',
                  marginBottom: 12,
                  color: theme.colors.onSurfaceVariant
                }}
              >
                {processedLines} de {totalLines} linhas processadas
              </Text>
            )}

            {/* Barra de Progresso */}
            <View style={{ marginVertical: 16 }}>
              <ProgressBar
                progress={Math.max(0, Math.min(1, progress))}
                color={getProgressColor()}
              />
              <Text
                variant="bodySmall"
                style={{
                  textAlign: 'center',
                  marginTop: 8,
                  color: theme.colors.onSurfaceVariant
                }}
              >
                {Math.round(progress * 100)}%
              </Text>
            </View>

            {/* Indicador de carregamento adicional para operações sem progresso específico */}
            {!isCompleted && !hasError && progress === 0 && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 16,
              }}>
                <ActivityIndicator
                  animating={true}
                  color={theme.colors.primary}
                  size="small"
                />
                <Text
                  variant="bodySmall"
                  style={{
                    marginLeft: 8,
                    color: theme.colors.onSurfaceVariant
                  }}
                >
                  Aguarde...
                </Text>
              </View>
            )}

            {/* Botões */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 24,
              gap: 12,
            }}>
              {/* Botão Cancelar - apenas durante processamento */}
              {!isCompleted && !hasError && canCancel && (
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  textColor={theme.colors.error}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
              )}

              {/* Botão OK - apenas quando concluído ou com erro */}
              {(isCompleted || hasError) && (
                <Button
                  mode="contained"
                  onPress={handleDismiss}
                  style={{ flex: 1 }}
                >
                  OK
                </Button>
              )}
            </View>
          </View>
        </Surface>
      </View>
    </Portal>
  );
};

export default ImportProgressDialog;
