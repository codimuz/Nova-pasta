/**
 * Serviço de Exportação de Dados
 * Responsável por exportar dados de inventário para arquivos .txt organizados por motivo
 */

import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { ReasonService } from './ReasonService.js';
import { EntryService } from './EntryService.js';
import { productService } from './ProductService.js';

class ExportService {
  /**
   * Formata o código do produto para ter exatamente 13 caracteres
   * @param {string} code - Código do produto
   * @returns {string} - Código formatado com zeros à esquerda
   */
  formatProductCode(code) {
    return code.toString().padStart(13, '0');
  }

  /**
   * Consolida entradas por código de produto, somando as quantidades
   * @param {Array} entries - Lista de entradas a serem consolidadas
   * @returns {Array} - Lista de entradas consolidadas
   */
  async consolidateEntries(entries) {
    try {
      // Agrupar entradas por product_code e somar quantities
      const consolidated = entries.reduce((acc, entry) => {
        if (!acc[entry.product_code]) {
          acc[entry.product_code] = {
            product_code: entry.product_code,
            quantity: 0
          };
        }
        acc[entry.product_code].quantity += entry.quantity;
        return acc;
      }, {});
      
      return Object.values(consolidated);
    } catch (error) {
      console.error('EXPORT_SERVICE: Erro ao consolidar entradas:', error);
      throw new Error(`Falha ao consolidar entradas: ${error.message}`);
    }
  }

  /**
   * Formata a quantidade baseado no tipo de unidade do produto
   * @param {number} quantity - Quantidade a ser formatada
   * @param {string} unitType - Tipo de unidade (KG ou UN)
   * @returns {string} - Quantidade formatada com 3 casas decimais
   */
  formatQuantity(quantity, unitType) {
    if (unitType === 'UN') {
      quantity = Math.floor(quantity);
    }
    return quantity.toFixed(3);
  }

  /**
   * Realizar exportação completa de dados
   */
  async exportData() {
    console.log('EXPORT_SERVICE: Iniciando exportação de dados...');
    
    let baseDirectoryUri = null;

    if (Platform.OS === 'android') {
      try {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          baseDirectoryUri = permissions.directoryUri;
          console.log('EXPORT_SERVICE: Diretório de destino escolhido:', baseDirectoryUri);
        } else {
          Alert.alert('Permissão Negada', 'Não é possível exportar sem permissão para acessar o diretório.');
          return {
            totalReasons: 0,
            successfulExports: 0,
            failedExports: 0,
            exportedFiles: [],
            errors: [{ reason: 'N/A', error: 'Permissão de diretório negada.' }]
          };
        }
      } catch (err) {
        console.error('EXPORT_SERVICE: Erro ao solicitar permissões de diretório:', err);
        Alert.alert('Erro de Permissão', `Não foi possível solicitar permissão para o diretório de exportação: ${err.message}`);
        return {
          totalReasons: 0,
          successfulExports: 0,
          failedExports: 0,
          exportedFiles: [],
          errors: [{ reason: 'N/A', error: `Falha na permissão do diretório: ${err.message}` }]
        };
      }
    }

    try {
      const reasons = await ReasonService.getAllReasons();
      if (!reasons || reasons.length === 0) {
        throw new Error('Nenhum motivo encontrado no banco de dados');
      }
      console.log(`EXPORT_SERVICE: ${reasons.length} motivos encontrados`);

      if (!baseDirectoryUri) {
        await this.createBaseDirectories();
      }

      const results = {
        totalReasons: reasons.length,
        successfulExports: 0,
        failedExports: 0,
        exportedFiles: [],
        errors: []
      };

      for (const reason of reasons) {
        try {
          const exported = await this.exportReasonData(reason, baseDirectoryUri);
          if (exported) {
            results.successfulExports++;
            results.exportedFiles.push(exported);
          }
        } catch (error) {
          console.error(`EXPORT_SERVICE: Erro ao exportar motivo ${reason.code}:`, error);
          results.failedExports++;
          results.errors.push({
            reason: reason.code,
            error: error.message
          });
        }
      }

      this.showExportResults(results);
      return results;

    } catch (error) {
      console.error('EXPORT_SERVICE: Erro na exportação:', error);
      Alert.alert(
        'Erro na Exportação',
        `Ocorreu um erro durante a exportação: ${error.message}`,
        [{ text: 'OK' }]
      );
      throw error;
    }
  }
  
  /**
   * Criar estrutura base de diretórios
   */
  async createBaseDirectories() {
    try {
      const documentsDir = FileSystem.documentDirectory;
      const baseDir = `${documentsDir}inventario/`;
      const motivosDir = `${baseDir}motivos/`;
      
      // Verificar e criar diretório inventario
      const baseDirInfo = await FileSystem.getInfoAsync(baseDir);
      if (!baseDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
        console.log('EXPORT_SERVICE: Diretório inventario/ criado');
      }
      
      // Verificar e criar diretório motivos
      const motivosDirInfo = await FileSystem.getInfoAsync(motivosDir);
      if (!motivosDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(motivosDir, { intermediates: true });
        console.log('EXPORT_SERVICE: Diretório motivos/ criado');
      }
      
      return motivosDir;
      
    } catch (error) {
      console.error('EXPORT_SERVICE: Erro ao criar diretórios base:', error);
      throw new Error(`Falha ao criar estrutura de diretórios: ${error.message}`);
    }
  }
  
  /**
   * Exportar dados de um motivo específico
   */
  async exportReasonData(reason, baseDirectoryUri = null) {
    try {
      console.log(`EXPORT_SERVICE: Processando motivo ${reason.code} - ${reason.description}`);
      
      const allEntries = await EntryService.getUnsyncedEntries();
      const entries = allEntries.filter(entry => entry.reason_id === reason.id);
      
      if (!entries || entries.length === 0) {
        console.log(`EXPORT_SERVICE: Nenhuma entrada pendente para motivo ${reason.code}`);
        return null;
      }
      
      console.log(`EXPORT_SERVICE: ${entries.length} entradas encontradas para motivo ${reason.code}`);
      
      const consolidatedEntries = await this.consolidateEntries(entries);
      console.log(`EXPORT_SERVICE: ${consolidatedEntries.length} produtos únicos após consolidação`);
      
      const fileName = this.generateFileName(reason.code);
      const fileContent = await this.generateFileContent(consolidatedEntries);
      
      let finalFilePathForLog = '';

      if (Platform.OS === 'android' && baseDirectoryUri) {
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          baseDirectoryUri,
          fileName,
          'text/plain'
        );
        await FileSystem.writeAsStringAsync(fileUri, fileContent, {
          encoding: FileSystem.EncodingType.UTF8
        });
        finalFilePathForLog = fileUri;
      } else {
        const reasonDir = await this.createReasonDirectory(reason.code);
        const filePath = `${reasonDir}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, fileContent, {
          encoding: FileSystem.EncodingType.UTF8
        });
        finalFilePathForLog = filePath;
      }
      
      console.log(`EXPORT_SERVICE: Arquivo criado: ${finalFilePathForLog}`);
      
      for (const entry of entries) {
        try {
          await EntryService.markAsSynced(entry.id);
        } catch (error) {
          console.error(`EXPORT_SERVICE: Erro ao marcar entrada ${entry.id} como sincronizada:`, error);
        }
      }
      
      return {
        reason: reason.code,
        fileName,
        filePath: finalFilePathForLog,
        entriesCount: consolidatedEntries.length
      };
      
    } catch (error) {
      console.error(`EXPORT_SERVICE: Erro ao exportar motivo ${reason.code}:`, error);
      throw new Error(`Falha na exportação do motivo ${reason.code}: ${error.message}`);
    }
  }
  
  /**
   * Criar diretório específico do motivo
   */
  async createReasonDirectory(reasonCode) {
    try {
      const documentsDir = FileSystem.documentDirectory;
      const reasonDir = `${documentsDir}inventario/motivos/motivo${reasonCode.padStart(2, '0')}/`;
      
      const dirInfo = await FileSystem.getInfoAsync(reasonDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(reasonDir, { intermediates: true });
        console.log(`EXPORT_SERVICE: Diretório motivo${reasonCode.padStart(2, '0')}/ criado`);
      }
      
      return reasonDir;
      
    } catch (error) {
      console.error(`EXPORT_SERVICE: Erro ao criar diretório do motivo ${reasonCode}:`, error);
      throw error;
    }
  }
  
  /**
   * Gerar nome do arquivo com padrão motivoXX_YYYYMMDD_HHMMSS.txt
   * Inclui hora/minuto/segundo para garantir unicidade
   */
  generateFileName(reasonCode) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const dateStr = `${year}${month}${day}`;
    const timeStr = `${hour}${minute}${second}`;
    const paddedCode = reasonCode.padStart(2, '0');
    
    return `motivo${paddedCode}_${dateStr}_${timeStr}.txt`;
  }
  
  /**
   * Gerar conteúdo do arquivo no formato especificado
   * com validações e formatações necessárias
   */
  async generateFileContent(entries) {
    console.log('EXPORT_SERVICE: Gerando conteúdo do arquivo com', entries.length, 'entradas');
    const lines = [];
    const errors = [];
    
    for (const entry of entries) {
      try {
        console.log('EXPORT_SERVICE: Processando entrada:', entry);
        
        if (!entry.product_code || !entry.quantity) {
          console.error('EXPORT_SERVICE: Entrada inválida:', entry);
          errors.push(`Entrada inválida: código ou quantidade ausente`);
          continue;
        }

        const product = await productService.getProductByCode(entry.product_code);
        if (!product) {
          console.error(`EXPORT_SERVICE: Produto não encontrado: ${entry.product_code}`);
          errors.push(`Produto não encontrado: ${entry.product_code}`);
          continue;
        }

        console.log('EXPORT_SERVICE: Produto encontrado:', product);

        const formattedCode = this.formatProductCode(entry.product_code);
        const formattedQuantity = this.formatQuantity(entry.quantity, product.unitType);

        const line = `Inventario ${formattedCode} ${formattedQuantity}`;
        console.log('EXPORT_SERVICE: Linha gerada:', line);
        lines.push(line);
      } catch (error) {
        console.error(`EXPORT_SERVICE: Erro ao processar entrada:`, error);
        errors.push(`Erro ao processar entrada: ${error.message}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn('EXPORT_SERVICE: Erros durante geração do conteúdo:', errors);
    }

    console.log('EXPORT_SERVICE: Conteúdo gerado com', lines.length, 'linhas válidas');
    
    if (lines.length === 0) {
      throw new Error('Nenhuma linha válida gerada para o arquivo');
    }
    
    return lines.join('\n') + '\n';
  }
  
  /**
   * Exibir resultados da exportação
   */
  showExportResults(results) {
    const { totalReasons, successfulExports, failedExports, exportedFiles, errors } = results;
    
    if (successfulExports === 0 && failedExports === 0) {
      Alert.alert(
        'Exportação Concluída',
        'Nenhuma entrada pendente encontrada para exportação.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let message = `Exportação concluída!\n\n`;
    message += `• Motivos processados: ${totalReasons}\n`;
    message += `• Exportações bem-sucedidas: ${successfulExports}\n`;
    
    if (failedExports > 0) {
      message += `• Falhas: ${failedExports}\n`;
    }
    
    if (exportedFiles.length > 0) {
      message += `\nArquivos gerados:\n`;
      exportedFiles.forEach(file => {
        let fileInfo = `• ${file.fileName} (${file.entriesCount} entradas)`;
        if (file.errorsCount > 0) {
          fileInfo += ` - ${file.errorsCount} avisos`;
        }
        message += fileInfo + '\n';
        
        // Exibir avisos específicos do arquivo se houver
        if (file.errors && file.errors.length > 0) {
          file.errors.forEach(error => {
            message += `    - ${error}\n`;
          });
        }
      });
    }
    
    if (errors.length > 0) {
      message += `\nErros gerais:\n`;
      errors.forEach(error => {
        message += `• Motivo ${error.reason}: ${error.error}\n`;
      });
    }
    
    if (Platform.OS === 'android') {
      message += `\nArquivos salvos no diretório selecionado`;
    } else {
      message += `\nArquivos salvos em: Documentos/inventario/motivos/`;
    }
    
    Alert.alert(
      successfulExports > 0 ? 'Exportação Realizada' : 'Exportação com Problemas',
      message,
      [{ text: 'OK' }]
    );
  }
  
}

// Exportar instância singleton
export const exportService = new ExportService();
export default exportService;
