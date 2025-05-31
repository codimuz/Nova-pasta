/**
 * Conexão SQLite Simplificada para React Native Bare Workflow
 */

import SQLite from 'react-native-sqlite-storage';

// Configurações básicas
SQLite.DEBUG(false); // Reduzir logs
SQLite.enablePromise(true);

class SimpleDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
  }

  async init() {
    try {
      console.log('Tentando conectar SQLite...');
      
      // Abrir database com configurações simples
      this.db = await SQLite.openDatabase(
        'invent.db',
        '1.0',
        'Invent Database',
        200000
      );

      console.log('SQLite conectado com sucesso');
      
      // Criar tabelas
      await this.createTables();
      await this.insertInitialData();
      
      this.isReady = true;
      return true;
      
    } catch (error) {
      console.error('Erro na conexão SQLite:', error.message);
      this.db = null;
      this.isReady = false;
      throw error;
    }
  }

  async createTables() {
    if (!this.db) return;

    const queries = [
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        package_type TEXT DEFAULT 'UN',
        regular_price REAL DEFAULT 0.0
      )`,
      
      `CREATE TABLE IF NOT EXISTS reasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason_name TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      )`,
      
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code TEXT NOT NULL,
        reason_id INTEGER,
        quantity_lost REAL NOT NULL,
        unit_cost REAL DEFAULT 0.0,
        total_value REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      await this.db.executeSql(query);
    }
    
    console.log('Tabelas SQLite criadas');
  }

  async insertInitialData() {
    if (!this.db) return;

    try {
      // Inserir produto teste
      await this.db.executeSql(
        `INSERT OR IGNORE INTO products (product_code, product_name, package_type, regular_price) 
         VALUES (?, ?, ?, ?)`,
        ['123456', 'Produto Teste', 'Unidade', 10.50]
      );

      // Inserir motivos
      const reasons = [
        'Vencimento', 'Avaria', 'Roubo', 'Perda operacional', 
        'Quebra', 'Devolução', 'Outros'
      ];

      for (const reason of reasons) {
        await this.db.executeSql(
          `INSERT OR IGNORE INTO reasons (reason_name) VALUES (?)`,
          [reason]
        );
      }

      console.log('Dados iniciais inseridos no SQLite');
    } catch (error) {
      console.error('Erro ao inserir dados iniciais:', error);
    }
  }

  async getProduct(productCode) {
    if (!this.db || !this.isReady) return null;

    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM products WHERE product_code = ?',
        [productCode]
      );

      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  async saveEntry(entryData) {
    if (!this.db || !this.isReady) throw new Error('Database não disponível');

    try {
      const totalValue = entryData.quantity_lost * entryData.unit_cost;
      
      const [result] = await this.db.executeSql(
        `INSERT INTO entries (product_code, quantity_lost, unit_cost, total_value, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          entryData.product_code,
          entryData.quantity_lost,
          entryData.unit_cost,
          totalValue,
          entryData.notes
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      throw error;
    }
  }

  isConnected() {
    return this.db !== null && this.isReady;
  }
}

export const simpleDb = new SimpleDatabase();