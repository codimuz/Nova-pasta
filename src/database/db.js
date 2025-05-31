/**
 * Interface simplificada para acesso ao banco SQLite
 * Usando react-native-sqlite-storage corrigido com fallback robusto
 */

import { dbManager } from './index';
import { fallbackDb } from './fallback';

class DatabaseInterface {
  constructor() {
    this.isInitialized = false;
    this.useFallback = false;
  }

  // Inicializar banco de dados
  async initialize() {
    try {
      if (!this.isInitialized) {
        console.log('Inicializando aplicativo...');
        console.log('Tentando conectar SQLite...');
        
        // Tentar inicializar SQLite corrigido
        await dbManager.initialize();
        
        this.isInitialized = true;
        this.useFallback = false;
        console.log('SQLite interface inicializada com sucesso');
      }
    } catch (error) {
      console.error('Erro na conexão SQLite:', error.message);
      console.warn('SQLite indisponível, usando fallback:', error.message);
      
      // Usar fallback em caso de erro
      await fallbackDb.initialize();
      this.isInitialized = true;
      this.useFallback = true;
      console.log('Fallback database initialized');
      console.log('Fallback database interface inicializada');
    }
  }

  // Buscar produto por código
  async getProduct(productCode) {
    try {
      await this.initialize();
      
      if (this.useFallback) {
        return await fallbackDb.getProduct(productCode);
      }
      
      // Usar SQLite corrigido
      return await dbManager.getProduct(productCode);
      
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  // Buscar produtos (autocomplete)
  async searchProducts(searchTerm) {
    try {
      await this.initialize();
      
      if (this.useFallback) {
        return await fallbackDb.searchProducts(searchTerm);
      }
      
      // Para SQLite, implementar busca se necessário
      return [];
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  // Salvar entrada
  async saveEntry(entryData) {
    try {
      await this.initialize();
      
      if (this.useFallback) {
        return await fallbackDb.saveEntry(entryData);
      }
      
      // Usar SQLite corrigido
      return await dbManager.insertEntry(entryData);
      
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      throw error;
    }
  }

  // Buscar motivos
  async getReasons() {
    try {
      await this.initialize();
      
      if (this.useFallback) {
        return await fallbackDb.getReasons();
      }
      
      // Usar SQLite corrigido
      return await dbManager.getReasons();
      
    } catch (error) {
      console.error('Erro ao buscar motivos:', error);
      return [];
    }
  }

  // Verificar qual database está sendo usado
  getDatabaseStatus() {
    return {
      isInitialized: this.isInitialized,
      useFallback: this.useFallback,
      type: this.useFallback ? 'Fallback' : 'SQLite'
    };
  }

  // Resetar database (para desenvolvimento)
  async resetDatabase() {
    try {
      if (!this.useFallback) {
        await dbManager.resetDatabase();
        console.log('SQLite database resetado');
      } else {
        await fallbackDb.reset();
        console.log('Fallback database resetado');
      }
    } catch (error) {
      console.error('Erro ao resetar database:', error);
    }
  }

  // Verificar integridade (apenas SQLite)
  async checkIntegrity() {
    try {
      if (!this.useFallback) {
        return await dbManager.checkIntegrity();
      } else {
        console.log('Verificação de integridade não disponível no fallback');
        return { status: 'ok', note: 'fallback mode' };
      }
    } catch (error) {
      console.error('Erro na verificação de integridade:', error);
      return { status: 'error', error: error.message };
    }
  }
}

// Exportar instância singleton
export const db = new DatabaseInterface();
export default db;