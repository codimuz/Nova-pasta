/**
 * Database Manager usando expo-sqlite
 * Substituição completa do react-native-sqlite-storage
 */

import { expoDbConnection, executeSqlSafe } from './expo-connection';

class ExpoSQLiteManager {
  constructor() {
    this.isInitialized = false;
    this.connection = expoDbConnection;
  }

  /**
   * Inicializar o banco de dados
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('EXPO-SQLITE: Manager já inicializado');
        return;
      }

      console.log('EXPO-SQLITE: Inicializando manager...');
      
      // Conectar ao banco
      await this.connection.connect();
      
      // Criar tabelas
      await this.createTables();
      
      // Inserir dados iniciais
      await this.insertInitialData();
      
      this.isInitialized = true;
      console.log('EXPO-SQLITE: Manager inicializado com sucesso');
      
    } catch (error) {
      console.error('EXPO-SQLITE: Erro na inicialização:', error);
      throw new Error(`Expo SQLite initialization failed: ${error.message}`);
    }
  }

  /**
   * Obter instância do banco
   */
  async getDatabase() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.connection.getDatabase();
  }

  /**
   * Criar todas as tabelas necessárias
   */
  async createTables() {
    const db = this.connection.getDatabase();
    
    const tables = [
      // Tabela de motivos
      `CREATE TABLE IF NOT EXISTS reasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de produtos
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        unit_type TEXT DEFAULT 'UN',
        regular_price REAL DEFAULT 0.0,
        cost_price REAL DEFAULT 0.0,
        category_id INTEGER DEFAULT 1,
        supplier_id INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de entradas
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code TEXT NOT NULL,
        product_name TEXT,
        reason_id INTEGER,
        quantity REAL NOT NULL,
        unit_cost REAL DEFAULT 0.0,
        total_cost REAL DEFAULT 0.0,
        notes TEXT,
        is_synchronized INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reason_id) REFERENCES reasons (id)
      )`,
      
      // Tabela de mudanças nas entradas
      `CREATE TABLE IF NOT EXISTS entry_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL,
        field_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entry_id) REFERENCES entries (id)
      )`,
      
      // Tabela de importações
      `CREATE TABLE IF NOT EXISTS imports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        total_records INTEGER DEFAULT 0,
        successful_records INTEGER DEFAULT 0,
        failed_records INTEGER DEFAULT 0,
        status TEXT DEFAULT 'processing',
        error_log TEXT,
        imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const sql of tables) {
      await executeSqlSafe(db, sql);
    }
    
    console.log('EXPO-SQLITE: Tabelas criadas com sucesso');
  }

  /**
   * Inserir dados iniciais (motivos e produtos de teste)
   */
  async insertInitialData() {
    const db = this.connection.getDatabase();
    
    try {
      // Verificar se já existem dados
      const [reasonsResult] = await executeSqlSafe(db, 'SELECT COUNT(*) as count FROM reasons');
      const reasonsCount = reasonsResult.rows.item(0).count;
      
      if (reasonsCount === 0) {
        console.log('EXPO-SQLITE: Inserindo motivos iniciais...');
        
        const reasons = [
          ['001', 'Produto Vencido'],
          ['002', 'Produto Danificado'],
          ['003', 'Erro de Contagem'],
          ['004', 'Roubo/Furto'],
          ['005', 'Perda Operacional'],
          ['006', 'Descarte'],
          ['007', 'Transferência'],
          ['008', 'Outros']
        ];
        
        for (const [code, description] of reasons) {
          await executeSqlSafe(db, 
            'INSERT INTO reasons (code, description) VALUES (?, ?)', 
            [code, description]
          );
        }
        
        console.log('EXPO-SQLITE: 8 motivos inseridos');
      }
      
      // Verificar produtos
      const [productsResult] = await executeSqlSafe(db, 'SELECT COUNT(*) as count FROM products');
      const productsCount = productsResult.rows.item(0).count;
      
      if (productsCount === 0) {
        console.log('EXPO-SQLITE: Inserindo produtos de teste...');
        
        const products = [
          ['78901234567890', 'Café Premium 250g', 'UN', 12.50, 8.75],
          ['78901234567891', 'Açúcar Cristal 1kg', 'KG', 4.75, 3.20],
          ['78901234567892', 'Leite Integral 1L', 'UN', 5.25, 3.80]
        ];
        
        for (const [code, name, unit, price, cost] of products) {
          await executeSqlSafe(db, 
            'INSERT INTO products (product_code, product_name, unit_type, regular_price, cost_price) VALUES (?, ?, ?, ?, ?)', 
            [code, name, unit, price, cost]
          );
        }
        
        console.log('EXPO-SQLITE: 3 produtos de teste inseridos');
      }
      
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao inserir dados iniciais:', error);
    }
  }

  /**
   * Normalizar string removendo acentos
   */
  normalizeString(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Buscar dados genéricos (substitui fetchData)
   */
  async fetchData(table, searchTerm = '') {
    try {
      const db = await this.getDatabase();
      
      let query = `SELECT * FROM ${table}`;
      let params = [];
      
      if (searchTerm && table === 'products') {
        // Busca insensível a acentos e case
        const normalizedSearch = this.normalizeString(searchTerm);
        
        // Buscar todos os produtos e filtrar em memória para busca insensível a acentos
        query = `SELECT * FROM ${table}`;
        params = [];
      }
      
      if (table === 'reasons') {
        query += ` ORDER BY code`;
      } else if (table === 'products') {
        query += ` ORDER BY product_name`;
      }

      console.log(`EXPO-SQLITE: Buscando dados da tabela ${table}...`);
      const [results] = await executeSqlSafe(db, query, params);
      
      const data = [];
      if (results.rows._array) {
        data.push(...results.rows._array);
      } else {
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
      }
      
      // Filtrar produtos por busca insensível a acentos
      if (searchTerm && table === 'products') {
        const normalizedSearch = this.normalizeString(searchTerm);
        const filteredData = data.filter(product => {
          const normalizedCode = this.normalizeString(product.product_code || '');
          const normalizedName = this.normalizeString(product.product_name || '');
          
          return normalizedCode.includes(normalizedSearch) || 
                 normalizedName.includes(normalizedSearch);
        });
        
        console.log(`EXPO-SQLITE: ${filteredData.length} produtos encontrados após filtro de acentos`);
        return filteredData;
      }
      
      console.log(`EXPO-SQLITE: ${data.length} registros encontrados na tabela ${table}`);
      return data;
      
    } catch (error) {
      console.error(`EXPO-SQLITE: Erro ao buscar dados da tabela ${table}:`, error);
      return [];
    }
  }

  /**
   * Buscar produto por código
   */
  async getProduct(productCode) {
    try {
      const products = await this.fetchData('products', productCode);
      return products.find(p => p.product_code === productCode) || null;
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao buscar produto:', error);
      return null;
    }
  }

  /**
   * Buscar todos os motivos
   */
  async getReasons() {
    return await this.fetchData('reasons');
  }

  /**
   * Inserir nova entrada
   */
  async insertEntry(entryData) {
    try {
      const db = await this.getDatabase();
      
      const { product_code, product_name, quantity, reason_id } = entryData;
      const totalCost = (entryData.unit_cost || 0) * quantity;
      
      const [result] = await executeSqlSafe(db,
        `INSERT INTO entries (product_code, product_name, reason_id, quantity, unit_cost, total_cost, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product_code,
          product_name || 'PRODUTO NÃO CADASTRADO',
          reason_id,
          quantity,
          entryData.unit_cost || 0,
          totalCost,
          entryData.notes || `Entrada manual - ${new Date().toLocaleString('pt-BR')}`
        ]
      );
      
      console.log('EXPO-SQLITE: Entrada inserida com ID:', result.insertId);
      return result.insertId;
      
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao inserir entrada:', error);
      throw error;
    }
  }

  /**
   * Verificar integridade do banco
   */
  async checkIntegrity() {
    try {
      const db = await this.getDatabase();
      const [result] = await executeSqlSafe(db, 'PRAGMA integrity_check');
      
      return {
        status: result.rows.item(0)['integrity_check'] === 'ok' ? 'ok' : 'error',
        details: result.rows.item(0)
      };
    } catch (error) {
      console.error('EXPO-SQLITE: Erro na verificação de integridade:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Resetar banco (para desenvolvimento)
   */
  async resetDatabase() {
    try {
      const db = await this.getDatabase();
      
      const tables = ['entries', 'entry_changes', 'imports', 'products', 'reasons'];
      
      for (const table of tables) {
        await executeSqlSafe(db, `DROP TABLE IF EXISTS ${table}`);
      }
      
      await this.createTables();
      await this.insertInitialData();
      
      console.log('EXPO-SQLITE: Database resetado com sucesso');
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao resetar database:', error);
      throw error;
    }
  }

  /**
   * Buscar entradas não sincronizadas por motivo
   */
  async getUnsynchronizedEntriesByReason(reasonId) {
    try {
      const db = await this.getDatabase();
      const [results] = await executeSqlSafe(db,
        `SELECT * FROM entries 
         WHERE reason_id = ? AND (is_synchronized = 0 OR is_synchronized IS NULL)
         ORDER BY created_at ASC`,
        [reasonId]
      );
      
      const data = [];
      if (results.rows._array) {
        data.push(...results.rows._array);
      } else {
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
      }
      
      return data;
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao buscar entradas não sincronizadas:', error);
      return [];
    }
  }

  /**
   * Marcar entradas como sincronizadas
   */
  async markEntriesAsSynchronized(entryIds) {
    if (!entryIds || entryIds.length === 0) return;
    
    try {
      const db = await this.getDatabase();
      const placeholders = entryIds.map(() => '?').join(',');
      
      await executeSqlSafe(db,
        `UPDATE entries SET is_synchronized = 1 WHERE id IN (${placeholders})`,
        entryIds
      );
      
      console.log(`EXPO-SQLITE: ${entryIds.length} entradas marcadas como sincronizadas`);
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao marcar entradas como sincronizadas:', error);
      throw error;
    }
  }

  /**
   * Atualizar campo is_synchronized para registros existentes (migração)
   */
  async migrateExistingEntries() {
    try {
      const db = await this.getDatabase();
      
      // Verificar se existe a coluna is_synchronized usando uma abordagem mais robusta
      console.log('EXPO-SQLITE: Executando SQL: PRAGMA table_info(entries)...');
      const [columns] = await executeSqlSafe(db, "PRAGMA table_info(entries)");
      
      const hasColumn = [];
      
      // Verificar formato de retorno do expo-sqlite
      if (columns.rows._array) {
        hasColumn.push(...columns.rows._array);
      } else if (columns.rows.length) {
        for (let i = 0; i < columns.rows.length; i++) {
          hasColumn.push(columns.rows.item(i));
        }
      }
      
      console.log('EXPO-SQLITE: Colunas encontradas:', hasColumn.length);
      
      const columnExists = hasColumn.some(col => col.name === 'is_synchronized');
      
      if (!columnExists) {
        console.log('EXPO-SQLITE: Coluna is_synchronized não encontrada, adicionando...');
        // Adicionar coluna se não existir
        await executeSqlSafe(db, 'ALTER TABLE entries ADD COLUMN is_synchronized INTEGER DEFAULT 0');
        console.log('EXPO-SQLITE: Coluna is_synchronized adicionada à tabela entries');
      } else {
        console.log('EXPO-SQLITE: Coluna is_synchronized já existe');
      }
      
      // Garantir que registros existentes tenham valor 0
      await executeSqlSafe(db, 
        'UPDATE entries SET is_synchronized = 0 WHERE is_synchronized IS NULL'
      );
      
      console.log('EXPO-SQLITE: Migração concluída com sucesso');
      
    } catch (error) {
      console.error('EXPO-SQLITE: Erro na migração:', error);
      
      // Se falhar, tentar adicionar a coluna sem verificação
      try {
        console.log('EXPO-SQLITE: Tentando adicionar coluna sem verificação...');
        const db = await this.getDatabase();
        await executeSqlSafe(db, 'ALTER TABLE entries ADD COLUMN is_synchronized INTEGER DEFAULT 0');
        console.log('EXPO-SQLITE: Coluna adicionada com sucesso na segunda tentativa');
      } catch (secondError) {
        // Se falhar novamente, provavelmente a coluna já existe
        console.log('EXPO-SQLITE: Coluna provavelmente já existe:', secondError.message);
        
        // Apenas garantir que registros existentes tenham valor 0
        try {
          const db = await this.getDatabase();
          await executeSqlSafe(db, 
            'UPDATE entries SET is_synchronized = 0 WHERE is_synchronized IS NULL'
          );
          console.log('EXPO-SQLITE: Valores NULL atualizados para 0');
        } catch (updateError) {
          console.error('EXPO-SQLITE: Erro ao atualizar valores NULL:', updateError);
        }
      }
    }
  }

  /**
   * Fechar conexão
   */
  async close() {
    try {
      await this.connection.disconnect();
      this.isInitialized = false;
      console.log('EXPO-SQLITE: Manager fechado');
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao fechar manager:', error);
    }
  }
}

// Exportar instância singleton
export const expoDbManager = new ExpoSQLiteManager();
export default expoDbManager;
