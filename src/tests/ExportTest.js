/**
 * Teste para funcionalidade de exportação
 * Este arquivo pode ser usado para testar a exportação de dados
 */

import { expoDbManager } from '../database/expo-manager';
import { exportService } from '../services/ExportService';

// Função para inserir dados de teste
export const insertTestData = async () => {
  try {
    console.log('TEST: Inserindo dados de teste...');
    
    // Inicializar database
    await expoDbManager.initialize();
    
    // Dados de teste para diferentes motivos
    const testEntries = [
      {
        product_code: '78901234567890',
        product_name: 'Café Premium 250g',
        quantity: 5,
        reason_id: 1, // Produto Vencido
        unit_cost: 12.50
      },
      {
        product_code: '78901234567891',
        product_name: 'Açúcar Cristal 1kg',
        quantity: 2,
        reason_id: 1, // Produto Vencido
        unit_cost: 4.75
      },
      {
        product_code: '78901234567892',
        product_name: 'Leite Integral 1L',
        quantity: 3,
        reason_id: 2, // Produto Danificado
        unit_cost: 5.25
      },
      {
        product_code: '78901234567890',
        product_name: 'Café Premium 250g',
        quantity: 1,
        reason_id: 3, // Erro de Contagem
        unit_cost: 12.50
      },
      {
        product_code: 'INEXISTENTE001',
        product_name: 'PRODUTO NÃO CADASTRADO',
        quantity: 10,
        reason_id: 4, // Roubo/Furto
        unit_cost: 0
      }
    ];
    
    // Inserir entradas de teste
    for (const entry of testEntries) {
      const entryId = await expoDbManager.insertEntry(entry);
      console.log(`TEST: Entrada inserida com ID: ${entryId}`);
    }
    
    console.log(`TEST: ${testEntries.length} entradas de teste inseridas com sucesso`);
    return testEntries.length;
    
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
    const reasons = await expoDbManager.getReasons();
    console.log(`TEST: ${reasons.length} motivos encontrados`);
    
    const summary = [];
    
    for (const reason of reasons) {
      const entries = await expoDbManager.getUnsynchronizedEntriesByReason(reason.id);
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

// Função para limpar dados de teste
export const cleanTestData = async () => {
  try {
    console.log('TEST: Limpando dados de teste...');
    
    // CUIDADO: Esta função apaga TODOS os dados!
    await expoDbManager.resetDatabase();
    
    console.log('TEST: Dados de teste limpos');
    
  } catch (error) {
    console.error('TEST: Erro ao limpar dados:', error);
    throw error;
  }
};
