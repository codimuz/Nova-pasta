/**
 * Database Manager usando expo-sqlite
 * Centraliza todas as operações de banco de dados usando expo-sqlite
 */

import { expoDbConnection, executeSqlSafe } from './expo-connection';

// Definições de tabelas do banco
const TABLES = {
  PRODUCTS: `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      club_price REAL NOT NULL,
      unit_type TEXT CHECK (unit_type IN ('KG', 'UN')) NOT NULL,
      image_url TEXT,
      product_url TEXT,
      short_ean_code TEXT,
      total_weight_kg REAL,
      full_description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      restored_at TEXT
    )`,
  
  REASONS: `
    CREATE TABLE IF NOT EXISTS reasons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  
  ENTRIES: `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      reason_id TEXT NOT NULL,
      entry_date TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      is_synchronized BOOLEAN DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (product_code) REFERENCES products (product_code),
      FOREIGN KEY (reason_id) REFERENCES reasons (id)
    )`,
  
  ENTRY_CHANGES: `
    CREATE TABLE IF NOT EXISTS entry_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      old_quantity REAL,
      new_quantity REAL NOT NULL,
      old_reason_id TEXT,
      new_reason_id TEXT NOT NULL,
      change_date TEXT NOT NULL,
      action_type TEXT NOT NULL CHECK (action_type IN ('insertion', 'edition', 'removal', 'movement')),
      FOREIGN KEY (old_reason_id) REFERENCES reasons (id),
      FOREIGN KEY (new_reason_id) REFERENCES reasons (id)
    )`,
  
  IMPORTS: `
    CREATE TABLE IF NOT EXISTS imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      import_date TEXT NOT NULL,
      items_updated INTEGER,
      items_inserted INTEGER,
      source TEXT
    )`
};

// Índices para melhor performance
const INDEXES = {
  PRODUCTS: {
    CODE: 'CREATE INDEX IF NOT EXISTS idx_products_code ON products (product_code)',
    NAME: 'CREATE INDEX IF NOT EXISTS idx_products_name ON products (product_name COLLATE NOCASE)',
    SEARCH: 'CREATE INDEX IF NOT EXISTS idx_products_search ON products (product_code, product_name)'
  },
  ENTRIES: {
    PRODUCT: 'CREATE INDEX IF NOT EXISTS idx_entries_product ON entries (product_code)',
    DATE: 'CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (entry_date, created_at)',
    REASON: 'CREATE INDEX IF NOT EXISTS idx_entries_reason ON entries (reason_id)'
  },
  ENTRY_CHANGES: {
    PRODUCT: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_product ON entry_changes (product_code)',
    DATE: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_date ON entry_changes (change_date)'
  },
  IMPORTS: {
    DATE: 'CREATE INDEX IF NOT EXISTS idx_imports_date ON imports (import_date)'
  },
  REASONS: {
    CODE: 'CREATE INDEX IF NOT EXISTS idx_reasons_code ON reasons (code)'
  }
};

// Dados iniciais para a tabela reasons
const INITIAL_REASONS = [
  {
    id: "1",
    code: "01",
    description: "Produto Vencido",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "2",
    code: "02",
    description: "Produto Danificado",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "3",
    code: "03",
    description: "Degustação no Depósito",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "4",
    code: "04",
    description: "Degustação na Loja",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "5",
    code: "05",
    description: "Furto Interno",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "6",
    code: "06",
    description: "Furto na Área de Vendas",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "7",
    code: "07",
    description: "Alimento Produzido para o Refeitório",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "8",
    code: "08",
    description: "Furto Não Recuperado",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  }
];

// Dados iniciais para a tabela products
const INITIAL_PRODUCTS = [
  {
    product_code: "7891234567890",
    product_name: "Arroz 5kg",
    price: 25.99,
    club_price: 22.99,
    unit_type: "UN",
    image_url: null,
    product_url: null,
    short_ean_code: "7890",
    total_weight_kg: 5.0,
    full_description: "Arroz branco tipo 1 - pacote 5kg",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    product_code: "7891234567891",
    product_name: "Feijão 1kg",
    price: 8.50,
    club_price: 7.50,
    unit_type: "UN",
    image_url: null,
    product_url: null,
    short_ean_code: "7891",
    total_weight_kg: 1.0,
    full_description: "Feijão carioca tipo 1 - pacote 1kg",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    product_code: "7891234567892",
    product_name: "Tomate",
    price: 5.99,
    club_price: 4.99,
    unit_type: "KG",
    image_url: null,
    product_url: null,
    short_ean_code: "7892",
    total_weight_kg: null,
    full_description: "Tomate salada - venda por kg",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  }
];

import { fallbackDb } from './fallback';

class ExpoSQLiteManager {
  constructor() {
    this.isInitialized = false;
    this.useFallback = false;
    this.connection = expoDbConnection;
    this.activeDb = null;
  }

  /**
   * Inicializar o banco de dados
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('EXPO-SQLITE: Manager já inicializado, usando fallback:', this.useFallback);
      return;
    }

    try {
      console.log('EXPO-SQLITE: Tentando inicializar com SQLite...');
      await this.connection.connect();
      this.activeDb = this.connection.getDatabase();
      
      // Criar tabelas e índices
      await this.createTables();
      
      // Verificar estrutura
      console.log('EXPO-SQLITE: Verificando estrutura do banco...');
      const structure = await this.verifyDatabaseStructure();
      
      // Validar se todas as tabelas e índices foram criados
      const validation = this.validateDatabaseStructure(structure);
      if (!validation.isValid) {
        throw new Error(`Estrutura do banco inválida: ${validation.errors.join(', ')}`);
      }
      
      // Inserir dados iniciais
      await this.insertInitialData();
      
      this.isInitialized = true;
      this.useFallback = false;
      console.log('EXPO-SQLITE: Manager inicializado com SQLite');
      
    } catch (error) {
      console.error('EXPO-SQLITE: Erro na inicialização com SQLite:', error);
      
      try {
        console.log('EXPO-SQLITE: Tentando fallback...');
        await fallbackDb.initialize();
        this.activeDb = fallbackDb;
        this.isInitialized = true;
        this.useFallback = true;
        console.log('EXPO-SQLITE: Manager inicializado com fallback');
        
      } catch (fallbackError) {
        console.error('EXPO-SQLITE: Erro também no fallback:', fallbackError);
        throw new Error('Falha na inicialização do SQLite e do fallback');
      }
    }
  }

  /**
   * Validar estrutura do banco de dados
   */
  validateDatabaseStructure(structure) {
    const errors = [];
    
    // Verificar tabelas
    for (const tableName in TABLES) {
      if (!structure.tables[tableName]?.exists) {
        errors.push(`Tabela ${tableName} não encontrada`);
        continue;
      }

      // Verificar colunas essenciais
      if (tableName === 'entries') {
        const requiredColumns = ['entry_date', 'created_at', 'is_synchronized'];
        for (const column of requiredColumns) {
          if (!structure.tables[tableName].columns.includes(column)) {
            errors.push(`Coluna ${column} não encontrada na tabela ${tableName}`);
          }
        }
      }
    }

    // Verificar índices
    for (const tableName in INDEXES) {
      for (const indexType in INDEXES[tableName]) {
        if (!structure.indexes[tableName]?.[indexType]?.exists) {
          errors.push(`Índice ${tableName}_${indexType} não encontrado`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obter instância do banco
   */
  async getDatabase() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.activeDb;
  }

  /**
   * Criar todas as tabelas necessárias
   */
  async createTables() {
    const db = this.connection.getDatabase();
    console.log('EXPO-SQLITE: Criando tabelas e índices a partir de constantes centralizadas...');

    try {
      // Criar todas as tabelas primeiro
      for (const tableName in TABLES) {
        console.log(`EXPO-SQLITE: Criando tabela ${tableName}...`);
        try {
          await executeSqlSafe(db, TABLES[tableName]);
          console.log(`EXPO-SQLITE: Tabela ${tableName} criada com sucesso`);
        } catch (error) {
          console.error(`EXPO-SQLITE: Erro ao criar tabela ${tableName}:`, error);
          throw new Error(`Falha ao criar tabela ${tableName}: ${error.message}`);
        }
      }
      console.log('EXPO-SQLITE: Todas as tabelas criadas');

      // Depois criar os índices para cada tabela
      for (const tableName in INDEXES) {
        const tableIndexes = INDEXES[tableName];
        for (const indexType in tableIndexes) {
          console.log(`EXPO-SQLITE: Criando índice ${tableName}_${indexType}...`);
          try {
            await executeSqlSafe(db, tableIndexes[indexType]);
            console.log(`EXPO-SQLITE: Índice ${tableName}_${indexType} criado com sucesso`);
          } catch (error) {
            console.error(`EXPO-SQLITE: Erro ao criar índice ${tableName}_${indexType}:`, error);
            throw new Error(`Falha ao criar índice ${tableName}_${indexType}: ${error.message}`);
          }
        }
      }
      
      console.log('EXPO-SQLITE: Todas as tabelas e índices foram criados com sucesso');
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao criar tabelas ou índices:', error);
      throw error;
    }
  }

  /**
   * Inserir dados iniciais (motivos e produtos de teste)
   */
  async insertInitialData() {
    const db = this.connection.getDatabase();
    
    try {
      // Verificar se já existem dados em reasons
      const [reasonsResult] = await executeSqlSafe(db, 'SELECT COUNT(*) as count FROM reasons');
      const reasonsCount = reasonsResult.rows.item(0).count;
      
      if (reasonsCount === 0) {
        console.log('EXPO-SQLITE: Inserindo motivos iniciais...');
        
        for (const reason of INITIAL_REASONS) {
          await executeSqlSafe(db,
            'INSERT INTO reasons (id, code, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [reason.id, reason.code, reason.description, reason.created_at, reason.updated_at]
          );
        }
        
        console.log('EXPO-SQLITE: 8 motivos inseridos com sucesso');
      }
      
      // Verificar produtos
      const [productsResult] = await executeSqlSafe(db, 'SELECT COUNT(*) as count FROM products');
      const productsCount = productsResult.rows.item(0).count;
      
      if (productsCount === 0) {
        console.log('EXPO-SQLITE: Inserindo produtos iniciais...');
        
        for (const product of INITIAL_PRODUCTS) {
          await executeSqlSafe(db,
            `INSERT INTO products (
              product_code, product_name, price, club_price, unit_type,
              image_url, product_url, short_ean_code, total_weight_kg,
              full_description, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.product_code,
              product.product_name,
              product.price,
              product.club_price,
              product.unit_type,
              product.image_url,
              product.product_url,
              product.short_ean_code,
              product.total_weight_kg,
              product.full_description,
              product.created_at,
              product.updated_at
            ]
          );
        }
        
        console.log('EXPO-SQLITE: 3 produtos iniciais inseridos com sucesso');
      }
      
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao inserir dados iniciais:', error);
      throw error;
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
      // Se estiver usando fallback e for busca de produtos
      if (this.useFallback && table === 'products') {
        if (searchTerm) {
          console.log('EXPO-SQLITE: Buscando produtos via fallback');
          return await this.activeDb.searchProducts(searchTerm);
        }
        // Retornar todos os produtos do fallback
        return Array.from(this.activeDb.products.values());
      }

      // Se estiver usando fallback e for busca de motivos
      if (this.useFallback && table === 'reasons') {
        return await this.activeDb.getReasons();
      }

      // Caso contrário, usar SQLite normalmente
      let query = `SELECT * FROM ${table}`;
      let params = [];
      
      if (table === 'reasons') {
        query += ` ORDER BY code`;
      } else if (table === 'products') {
        query += ` ORDER BY product_name`;
      }

      console.log(`EXPO-SQLITE: Buscando dados da tabela ${table}...`);
      const [results] = await executeSqlSafe(this.activeDb, query, params);
      
      const data = [];
      if (results.rows._array) {
        data.push(...results.rows._array);
      } else {
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
      }
      
      // Filtrar produtos por busca insensível a acentos
      if (table === 'products' && searchTerm && searchTerm.trim().length > 0) {
        const normalizedSearch = this.normalizeString(searchTerm.trim());
        const filteredData = data.filter(product => {
          const normalizedCode = this.normalizeString(product.product_code || '');
          const normalizedName = this.normalizeString(product.product_name || '');
          
          return normalizedCode.includes(normalizedSearch) ||
                 normalizedName.includes(normalizedSearch);
        });
        
        console.log(`EXPO-SQLITE: Busca por "${searchTerm}" retornou ${filteredData.length} produtos após filtro de acentos`);
        return filteredData;
      }
      
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
      // Se estiver usando fallback
      if (this.useFallback) {
        console.log('EXPO-SQLITE: Buscando produto via fallback');
        return await this.activeDb.getProduct(productCode);
      }

      // Caso contrário, usar SQLite
      const [result] = await executeSqlSafe(this.activeDb,
        'SELECT * FROM products WHERE product_code = ? LIMIT 1',
        [productCode]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows._array ? result.rows._array[0] : result.rows.item(0);
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao buscar produto:', error);
      return null;
    }
  }

  /**
   * Buscar todos os motivos
   */
  /**
   * Buscar todos os motivos (otimizado para dropdown)
   */
  async getReasons() {
    try {
      // Se estiver usando fallback, delegar para ele
      if (this.useFallback) {
        console.log('EXPO-SQLITE: Buscando motivos via fallback');
        return await this.activeDb.getReasons();
      }

      // Caso contrário, usar SQLite
      const [results] = await executeSqlSafe(this.activeDb,
        'SELECT id, code, description FROM reasons ORDER BY code'
      );

      const data = [];
      if (results.rows._array) {
        data.push(...results.rows._array);
      } else {
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
      }

      console.log(`EXPO-SQLITE: ${data.length} motivos carregados para dropdown`);
      return data;
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao buscar motivos:', error);
      return [];
    }
  }

  /**
   * Buscar motivo por ID
   */
  async findReasonById(reasonId) {
    try {
      const db = await this.getDatabase();
      const [result] = await executeSqlSafe(db,
        'SELECT * FROM reasons WHERE id = ?',
        [reasonId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows._array ? result.rows._array[0] : result.rows.item(0);
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao buscar motivo por ID:', error);
      return null;
    }
  }

  /**
   * Buscar motivo por código
   */
  async findReasonByCode(code) {
    try {
      const db = await this.getDatabase();
      const [result] = await executeSqlSafe(db,
        'SELECT * FROM reasons WHERE code = ?',
        [code]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows._array ? result.rows._array[0] : result.rows.item(0);
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao buscar motivo por código:', error);
      return null;
    }
  }

  /**
   * Verificar estrutura do banco de dados
   */
  async verifyDatabaseStructure() {
    try {
      const db = await this.getDatabase();
      const results = {
        tables: {},
        indexes: {}
      };

      // Verificar tabelas
      for (const tableName in TABLES) {
        const [tableResult] = await executeSqlSafe(db,
          `SELECT * FROM sqlite_master WHERE type='table' AND name=?`,
          [tableName.toLowerCase()]
        );
        results.tables[tableName] = {
          exists: tableResult.rows.length > 0
        };

        if (results.tables[tableName].exists) {
          // Verificar colunas
          const [columnsResult] = await executeSqlSafe(db, `PRAGMA table_info(${tableName})`);
          results.tables[tableName].columns = [];
          for (let i = 0; i < columnsResult.rows.length; i++) {
            results.tables[tableName].columns.push(columnsResult.rows.item(i).name);
          }
        }
      }

      // Verificar índices
      for (const tableName in INDEXES) {
        results.indexes[tableName] = {};
        const tableIndexes = INDEXES[tableName];
        
        for (const indexType in tableIndexes) {
          const indexName = `idx_${tableName.toLowerCase()}_${indexType.toLowerCase()}`;
          const [indexResult] = await executeSqlSafe(db,
            `SELECT * FROM sqlite_master WHERE type='index' AND name=?`,
            [indexName]
          );
          results.indexes[tableName][indexType] = {
            exists: indexResult.rows.length > 0
          };
        }
      }

      console.log('EXPO-SQLITE: Verificação de estrutura concluída:', results);
      return results;
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao verificar estrutura:', error);
      throw error;
    }
  }

  /**
   * Inserir novo motivo
   */
  async insertReason(reason) {
    try {
      const db = await this.getDatabase();
      const now = new Date().toISOString();
      
      const [result] = await executeSqlSafe(db,
        `INSERT INTO reasons (code, description, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [reason.code, reason.description, now, now]
      );
      
      console.log('EXPO-SQLITE: Motivo inserido com ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao inserir motivo:', error);
      throw error;
    }
  }

  /**
   * Atualizar motivo
   */
  async updateReason(reasonId, updates) {
    try {
      const db = await this.getDatabase();
      const now = new Date().toISOString();
      
      const [result] = await executeSqlSafe(db,
        `UPDATE reasons
         SET code = ?, description = ?, updated_at = ?
         WHERE id = ?`,
        [updates.code, updates.description, now, reasonId]
      );
      
      console.log('EXPO-SQLITE: Motivo atualizado, linhas afetadas:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao atualizar motivo:', error);
      throw error;
    }
  }

  /**
   * Buscar motivos mais usados (para otimização do dropdown)
   */
  async getMostUsedReasons(limit = 5) {
    try {
      const db = await this.getDatabase();
      const [results] = await executeSqlSafe(db,
        `SELECT r.*, COUNT(e.id) as usage_count
         FROM reasons r
         LEFT JOIN entries e ON r.id = e.reason_id
         GROUP BY r.id
         ORDER BY usage_count DESC, r.description
         LIMIT ?`,
        [limit]
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
      console.error('EXPO-SQLITE: Erro ao buscar motivos mais usados:', error);
      return [];
    }
  }

  /**
   * Inserir nova entrada
   */
  async insertEntry(entryData) {
    try {
      // Se estiver usando fallback
      if (this.useFallback) {
        console.log('EXPO-SQLITE: Inserindo entrada via fallback');
        return await this.activeDb.saveEntry(entryData);
      }

      // Caso contrário, usar SQLite
      const { product_code, product_name, quantity, reason_id } = entryData;
      
      const [result] = await executeSqlSafe(this.activeDb,
        `INSERT INTO entries (
          product_code,
          product_name,
          reason_id,
          quantity
         ) VALUES (?, ?, ?, ?)`,
        [
          product_code,
          product_name || 'PRODUTO NÃO CADASTRADO',
          reason_id,
          quantity
        ]
      );
      
      // entry_date, created_at e is_synchronized serão preenchidos com os valores default
      
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
      // Se estiver usando fallback
      if (this.useFallback) {
        console.log('EXPO-SQLITE: Buscando entradas não sincronizadas via fallback');
        const entries = await this.activeDb.getUnsynchronizedEntries(reasonId);
        return entries.sort((a, b) => {
          // Ordenar por data de entrada e criação
          const dateA = new Date(a.entry_date || a.created_at);
          const dateB = new Date(b.entry_date || b.created_at);
          return dateA - dateB;
        });
      }

      // Caso contrário, usar SQLite
      const [results] = await executeSqlSafe(this.activeDb,
        `SELECT * FROM entries
         WHERE reason_id = ? AND (is_synchronized = 0 OR is_synchronized IS NULL)
         ORDER BY entry_date ASC, created_at ASC`,
        [reasonId]
      );
      
      // Processar resultados
      const data = [];
      if (results.rows._array) {
        data.push(...results.rows._array);
      } else {
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
      }
      
      console.log(`EXPO-SQLITE: ${data.length} entradas não sincronizadas encontradas para motivo ${reasonId}`);
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
      if (this.useFallback) {
        // No modo fallback, apenas resetar o estado
        this.isInitialized = false;
        this.activeDb = null;
        console.log('EXPO-SQLITE: Manager fechado (modo fallback)');
      } else {
        // No modo SQLite, desconectar propriamente
        await this.connection.disconnect();
        this.isInitialized = false;
        this.activeDb = null;
        console.log('EXPO-SQLITE: Manager fechado (modo SQLite)');
      }
    } catch (error) {
      console.error('EXPO-SQLITE: Erro ao fechar manager:', error);
      throw error;
    }
  }
}

// Exportar instância singleton e constantes
export const expoDbManager = new ExpoSQLiteManager();
export { TABLES, INDEXES, INITIAL_REASONS, INITIAL_PRODUCTS };
export default expoDbManager;
