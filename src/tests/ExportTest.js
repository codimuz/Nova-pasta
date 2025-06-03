/**
 * Teste para funcionalidade de exportação
 * Este arquivo pode ser usado para testar a exportação de dados
 */

import { ReasonService } from '../services/ReasonService.js';
import { EntryService } from '../services/EntryService.js';
import { ProductService } from '../services/ProductService.js';
import { exportService } from '../services/ExportService';

// Função para inserir dados de teste
export const insertTestData = async () => {
  try {
    console.log('TEST: Inserindo dados de teste...');
    
    // Buscar motivos disponíveis
    const reasons = await ReasonService.getAllReasons();
    if (reasons.length === 0) {
      throw new Error('Nenhum motivo encontrado. Execute o seeder primeiro.');
    }
    
    // Dados de teste para diferentes motivos
    const testEntries = [
      {
        product_code: '78901234567890',
        quantity: 5,
        reason_id: reasons[0]?.id // Primeiro motivo disponível
      },
      {
        product_code: '78901234567891',
        quantity: 2,
        reason_id: reasons[0]?.id // Primeiro motivo disponível
      },
      {
        product_code: '78901234567892',
        quantity: 3,
        reason_id: reasons[1]?.id || reasons[0]?.id // Segundo motivo ou primeiro se não houver
      },
      {
        product_code: '78901234567890',
        quantity: 1,
        reason_id: reasons[2]?.id || reasons[0]?.id // Terceiro motivo ou primeiro se não houver
      }
    ];
    
    // Inserir entradas de teste
    let insertedCount = 0;
    for (const entryData of testEntries) {
      try {
        const entry = await EntryService.createEntry(
          entryData.product_code,
          entryData.reason_id,
          entryData.quantity
        );
        console.log(`TEST: Entrada inserida com ID: ${entry.id}`);
        insertedCount++;
      } catch (error) {
        console.warn(`TEST: Erro ao inserir entrada para produto ${entryData.product_code}:`, error.message);
        // Continua com as outras entradas mesmo se uma falhar
      }
    }
    
    console.log(`TEST: ${insertedCount} entradas de teste inseridas com sucesso`);
    return insertedCount;
    
  } catch (error) {
    console.error('TEST: Erro ao inserir dados de teste:', error);
    throw error;
  }
};

// Função para testar exportação
export const testExport = async () => {
  try {
    console.log('TEST: Iniciando teste de exportação...');
    
    // Verificar estrutura existente
    const structure = await exportService.checkExistingStructure();
    console.log('TEST: Estrutura existente:', structure);
    
    // Realizar exportação
    const results = await exportService.exportData();
    console.log('TEST: Resultados da exportação:', results);
    
    // Listar arquivos criados
    const files = await exportService.listExportedFiles();
    console.log('TEST: Arquivos exportados:', files);
    
    return {
      structure,
      results,
      files
    };
    
  } catch (error) {
    console.error('TEST: Erro no teste de exportação:', error);
    throw error;
  }
};

// Função para verificar dados não sincronizados
export const checkUnsynchronizedData = async () => {
  try {
    console.log('TEST: Verificando dados não sincronizados...');
    
    // Buscar todos os motivos
    const reasons = await ReasonService.getAllReasons();
    console.log(`TEST: ${reasons.length} motivos encontrados`);
    
    // Buscar todas as entradas não sincronizadas
    const allUnsyncedEntries = await EntryService.getUnsyncedEntries();
    
    const summary = [];
    
    for (const reason of reasons) {
      const entries = allUnsyncedEntries.filter(entry => entry.reason_id === reason.id);
      if (entries.length > 0) {
        summary.push({
          reason: reason.code,
          description: reason.description,
          unsynchronizedCount: entries.length,
          entries: entries
        });
        console.log(`TEST: Motivo ${reason.code} - ${entries.length} entradas não sincronizadas`);
      }
    }
    
    return summary;
    
  } catch (error) {
    console.error('TEST: Erro ao verificar dados:', error);
    throw error;
  }
};

// Função completa de teste
export const runCompleteTest = async () => {
  try {
    console.log('TEST: ===== INICIANDO TESTE COMPLETO =====');
    
    // 1. Verificar dados atuais
    console.log('TEST: 1. Verificando dados não sincronizados...');
    const currentData = await checkUnsynchronizedData();
    
    // 2. Inserir dados de teste se necessário
    if (currentData.length === 0) {
      console.log('TEST: 2. Inserindo dados de teste...');
      await insertTestData();
    } else {
      console.log('TEST: 2. Dados existentes encontrados, pulando inserção');
    }
    
    // 3. Verificar novamente após inserção
    console.log('TEST: 3. Verificando dados após inserção...');
    const updatedData = await checkUnsynchronizedData();
    
    // 4. Realizar exportação
    console.log('TEST: 4. Testando exportação...');
    const exportResults = await testExport();
    
    // 5. Verificar dados após exportação
    console.log('TEST: 5. Verificando dados após exportação...');
    const finalData = await checkUnsynchronizedData();
    
    console.log('TEST: ===== TESTE COMPLETO FINALIZADO =====');
    
    return {
      initialData: currentData,
      dataAfterInsertion: updatedData,
      exportResults: exportResults,
      finalData: finalData
    };
    
  } catch (error) {
    console.error('TEST: Erro no teste completo:', error);
    throw error;
  }
};

// Função para verificar estatísticas dos produtos
export const checkProductStatistics = async () => {
  try {
    console.log('TEST: Verificando estatísticas dos produtos...');
    
    const stats = await ProductService.getProductStatistics();
    console.log('TEST: Estatísticas dos produtos:', stats);
    
    return stats;
    
  } catch (error) {
    console.error('TEST: Erro ao verificar estatísticas:', error);
    throw error;
  }
};

// Função para verificar integridade dos dados
export const checkDataIntegrity = async () => {
  try {
    console.log('TEST: Verificando integridade dos dados...');
    
    // Verificar produtos
    const productStats = await ProductService.getProductStatistics();
    
    // Verificar motivos
    const reasons = await ReasonService.getAllReasons();
    
    // Verificar entradas
    const allEntries = await EntryService.getAllEntries();
    const unsyncedEntries = await EntryService.getUnsyncedEntries();
    
    const integrity = {
      products: {
        total: productStats.total,
        byUnitType: productStats.byUnitType,
        priceRange: productStats.priceRange
      },
      reasons: {
        total: reasons.length,
        list: reasons.map(r => ({ code: r.code, description: r.description }))
      },
      entries: {
        total: allEntries.length,
        unsynced: unsyncedEntries.length,
        synced: allEntries.length - unsyncedEntries.length
      }
    };
    
    console.log('TEST: Integridade dos dados:', integrity);
    return integrity;
    
  } catch (error) {
    console.error('TEST: Erro ao verificar integridade:', error);
    throw error;
  }
};

// Função para teste rápido (sem inserção de dados)
export const runQuickTest = async () => {
  try {
    console.log('TEST: ===== INICIANDO TESTE RÁPIDO =====');
    
    // 1. Verificar integridade
    const integrity = await checkDataIntegrity();
    
    // 2. Verificar dados não sincronizados
    const unsyncedData = await checkUnsynchronizedData();
    
    // 3. Verificar estrutura de exportação
    const structure = await exportService.checkExistingStructure();
    
    // 4. Listar arquivos existentes
    const existingFiles = await exportService.listExportedFiles();
    
    console.log('TEST: ===== TESTE RÁPIDO FINALIZADO =====');
    
    return {
      integrity,
      unsyncedData,
      exportStructure: structure,
      existingFiles
    };
    
  } catch (error) {
    console.error('TEST: Erro no teste rápido:', error);
    throw error;
  }
};
