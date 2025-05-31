/**
 * Serviço de Exportação de Dados
 * Responsável por exportar dados de inventário para arquivos .txt organizados por motivo
 */

import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { expoDbManager } from '../database/expo-manager';

class ExportService {
  /**
   * Realizar exportação completa de dados
   */
  async exportData() {
    console.log('EXPORT_SERVICE: Iniciando exportação de dados...');
    
    try {
      // Realizar migração se necessário
      await expoDbManager.migrateExistingEntries();
      
      // Buscar todos os motivos cadastrados
      const reasons = await expoDbManager.getReasons();
      
      if (!reasons || reasons.length === 0) {
        throw new Error('Nenhum motivo encontrado no banco de dados');
      }
      
      console.log(`EXPORT_SERVICE: ${reasons.length} motivos encontrados`);
      
      // Criar estrutura de diretórios base
      await this.createBaseDirectories();
      
      // Processar cada motivo independentemente
      const results = {
        totalReasons: reasons.length,
        successfulExports: 0,
        failedExports: 0,
        exportedFiles: [],
        errors: []
      };
      
      for (const reason of reasons) {
        try {
          const exported = await this.exportReasonData(reason);
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
      
      // Exibir resultado final
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
  async exportReasonData(reason) {
    try {
      console.log(`EXPORT_SERVICE: Processando motivo ${reason.code} - ${reason.description}`);
      
      // Buscar entradas não sincronizadas para este motivo
      const entries = await expoDbManager.getUnsynchronizedEntriesByReason(reason.id);
      
      if (!entries || entries.length === 0) {
        console.log(`EXPORT_SERVICE: Nenhuma entrada pendente para motivo ${reason.code}`);
        return null;
      }
      
      console.log(`EXPORT_SERVICE: ${entries.length} entradas encontradas para motivo ${reason.code}`);
      
      // Criar diretório específico do motivo
      const reasonDir = await this.createReasonDirectory(reason.code);
      
      // Gerar nome do arquivo com data atual
      const fileName = this.generateFileName(reason.code);
      const filePath = `${reasonDir}${fileName}`;
      
      // Gerar conteúdo do arquivo
      const fileContent = this.generateFileContent(entries);
      
      // Salvar arquivo
      await FileSystem.writeAsStringAsync(filePath, fileContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      console.log(`EXPORT_SERVICE: Arquivo criado: ${filePath}`);
      
      // Marcar entradas como sincronizadas apenas após sucesso na gravação
      const entryIds = entries.map(entry => entry.id);
      await expoDbManager.markEntriesAsSynchronized(entryIds);
      
      return {
        reason: reason.code,
        fileName: fileName,
        filePath: filePath,
        entriesCount: entries.length
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
   * Gerar nome do arquivo com padrão motivoXX_YYYYMMDD.txt
   */
  generateFileName(reasonCode) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const dateStr = `${year}${month}${day}`;
    const paddedCode = reasonCode.padStart(2, '0');
    
    return `motivo${paddedCode}_${dateStr}.txt`;
  }
  
  /**
   * Gerar conteúdo do arquivo no formato especificado
   */
  generateFileContent(entries) {
    const lines = entries.map(entry => {
      // Formato: "Inventario [product_code] [quantity]"
      return `Inventario ${entry.product_code} ${entry.quantity}`;
    });
    
    // Adicionar quebra de linha no final
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
        message += `• ${file.fileName} (${file.entriesCount} entradas)\n`;
      });
    }
    
    if (errors.length > 0) {
      message += `\nErros encontrados:\n`;
      errors.forEach(error => {
        message += `• Motivo ${error.reason}: ${error.error}\n`;
      });
    }
    
    message += `\nArquivos salvos em: Documentos/inventario/motivos/`;
    
    Alert.alert(
      successfulExports > 0 ? 'Exportação Realizada' : 'Exportação com Problemas',
      message,
      [{ text: 'OK' }]
    );
  }
  
  /**
   * Verificar estrutura de diretórios existente
   */
  async checkExistingStructure() {
    try {
      const documentsDir = FileSystem.documentDirectory;
      const baseDir = `${documentsDir}inventario/`;
      const motivosDir = `${baseDir}motivos/`;
      
      const baseDirInfo = await FileSystem.getInfoAsync(baseDir);
      const motivosDirInfo = await FileSystem.getInfoAsync(motivosDir);
      
      return {
        baseExists: baseDirInfo.exists,
        motivosExists: motivosDirInfo.exists,
        basePath: baseDir,
        motivosPath: motivosDir
      };
      
    } catch (error) {
      console.error('EXPORT_SERVICE: Erro ao verificar estrutura:', error);
      return {
        baseExists: false,
        motivosExists: false,
        error: error.message
      };
    }
  }
  
  /**
   * Listar arquivos já exportados
   */
  async listExportedFiles() {
    try {
      const documentsDir = FileSystem.documentDirectory;
      const motivosDir = `${documentsDir}inventario/motivos/`;
      
      const motivosDirInfo = await FileSystem.getInfoAsync(motivosDir);
      if (!motivosDirInfo.exists) {
        return [];
      }
      
      const motivosDirContents = await FileSystem.readDirectoryAsync(motivosDir);
      const files = [];
      
      for (const motiveFolder of motivosDirContents) {
        const motiveFolderPath = `${motivosDir}${motiveFolder}/`;
        const motiveFolderInfo = await FileSystem.getInfoAsync(motiveFolderPath);
        
        if (motiveFolderInfo.exists && motiveFolderInfo.isDirectory) {
          const motiveFiles = await FileSystem.readDirectoryAsync(motiveFolderPath);
          
          for (const file of motiveFiles) {
            if (file.endsWith('.txt')) {
              const filePath = `${motiveFolderPath}${file}`;
              const fileInfo = await FileSystem.getInfoAsync(filePath);
              
              files.push({
                motiveFolder,
                fileName: file,
                filePath,
                size: fileInfo.size,
                modificationTime: fileInfo.modificationTime
              });
            }
          }
        }
      }
      
      return files.sort((a, b) => b.modificationTime - a.modificationTime);
      
    } catch (error) {
      console.error('EXPORT_SERVICE: Erro ao listar arquivos:', error);
      return [];
    }
  }
}

// Exportar instância singleton
export const exportService = new ExportService();
export default exportService;
