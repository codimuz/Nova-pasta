/**
 * SQLite Database Connection usando expo-sqlite
 * Substituição do react-native-sqlite-storage para correção do erro
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'invent.db';

/**
 * Abrir conexão com o banco SQLite usando expo-sqlite
 */
export const openDatabase = async () => {
  try {
    console.log('EXPO-SQLITE: Tentando abrir banco de dados...');
    
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    
    if (!db) {
      throw new Error('Database object é null');
    }
    
    console.log('EXPO-SQLITE: Banco aberto com sucesso');
    return db;
    
  } catch (error) {
    console.error('EXPO-SQLITE: Erro ao abrir:', error.message);
    throw new Error(`Expo SQLite connection failed: ${error.message}`);
  }
};

/**
 * Habilitar debug do SQLite
 */
export const enableDebug = () => {
  console.log('EXPO-SQLITE: Debug habilitado');
};

/**
 * Fechar conexão com o banco
 */
export const closeDatabase = async (db) => {
  try {
    if (db && typeof db.closeAsync === 'function') {
      await db.closeAsync();
      console.log('EXPO-SQLITE: Conexão fechada com sucesso');
    }
  } catch (error) {
    console.error('EXPO-SQLITE: Erro ao fechar conexão:', error);
  }
};

/**
 * Verificar se o banco está disponível
 */
export const isDatabaseReady = (db) => {
  return db !== null && db !== undefined && typeof db.execAsync === 'function';
};

/**
 * Executar SQL com verificações de segurança
 */
export const executeSqlSafe = async (db, sql, params = []) => {
  try {
    if (!isDatabaseReady(db)) {
      throw new Error('Database não está pronto');
    }
    
    console.log('EXPO-SQLITE: Executando SQL:', sql.substring(0, 100) + '...');
    
    // expo-sqlite usa execAsync para statements sem retorno
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const result = await db.getAllAsync(sql, params);
      return [{ rows: { length: result.length, item: (i) => result[i], _array: result } }];
    } else {
      const result = await db.runAsync(sql, params);
      return [{ insertId: result.lastInsertRowId, rowsAffected: result.changes }];
    }
    
  } catch (error) {
    console.error('EXPO-SQLITE: Erro ao executar SQL:', error.message);
    throw error;
  }
};

/**
 * Manager de conexão SQLite com verificações robustas
 */
class ExpoSQLiteConnection {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      this.db = await openDatabase();
      
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database connection failed - object not ready');
      }

      this.isConnected = true;
      console.log('EXPO-SQLITE: Connection manager conectado');
      return this.db;

    } catch (error) {
      console.error('EXPO-SQLITE: Connection manager falhou:', error);
      this.isConnected = false;
      this.db = null;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.db) {
        await closeDatabase(this.db);
        this.db = null;
        this.isConnected = false;
      }
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao desconectar:', error);
    }
  }

  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database não conectado - chame connect() primeiro');
    }
    return this.db;
  }

  isReady() {
    return this.isConnected && isDatabaseReady(this.db);
  }
}

// Exportar instância singleton
export const expoDbConnection = new ExpoSQLiteConnection();

// Exportar funções utilitárias
export { DATABASE_NAME };