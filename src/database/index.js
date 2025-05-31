import { openDatabase, enableDebug, closeDatabase, isDatabaseReady } from './connection';
import { TABLES, INDEXES, INITIAL_REASONS, INITIAL_PRODUCTS } from './schema';

export class DatabaseManager {
  static instance = null;
  db = null;

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize() {
    try {
      console.log('SQLITE: Inicializando database manager...');
      enableDebug();
      
      this.db = await openDatabase();
      
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto após conexão');
      }
      
      await this.createTables();
      await this.createIndexes();
      await this.insertInitialData();
      
      console.log('SQLITE: Database inicializado com sucesso');
      return this.db;
      
    } catch (error) {
      console.error('SQLITE: Falha na inicialização:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto para criar tabelas');
      }

      const tables = Object.values(TABLES);
      
      for (const tableSQL of tables) {
        console.log('SQLITE: Criando tabela...');
        await this.db.executeSql(tableSQL);
      }
      
      console.log('SQLITE: Todas as tabelas criadas com sucesso');
      
    } catch (error) {
      console.error('SQLITE: Erro ao criar tabelas:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto para criar índices');
      }

      const indexes = Object.values(INDEXES);
      
      for (const indexSQL of indexes) {
        console.log('SQLITE: Criando índice...');
        await this.db.executeSql(indexSQL);
      }
      
      console.log('SQLITE: Todos os índices criados com sucesso');
      
    } catch (error) {
      console.error('SQLITE: Erro ao criar índices:', error);
      throw error;
    }
  }

  async insertInitialData() {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto para inserir dados');
      }

      // Verificar e inserir reasons
      await this.insertInitialReasons();
      
      // Verificar e inserir products
      await this.insertInitialProducts();
      
      // Log de verificação
      await this.logDataVerification();
      
    } catch (error) {
      console.error('SQLITE: Erro ao inserir dados iniciais:', error);
      throw error;
    }
  }

  async insertInitialReasons() {
    try {
      console.log('SQLITE: Verificando tabela reasons...');
      
      const [results] = await this.db.executeSql(
        'SELECT COUNT(*) as count FROM reasons'
      );
      
      const count = results.rows.item(0).count;
      console.log(`SQLITE: Reasons existentes: ${count}`);

      if (count === 0) {
        console.log('SQLITE: Inserindo motivos iniciais...');
        
        for (const reason of INITIAL_REASONS) {
          await this.db.executeSql(
            'INSERT INTO reasons (id, code, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [reason.id, reason.code, reason.description, reason.created_at, reason.updated_at]
          );
        }
        
        console.log('SQLITE: Motivos inseridos com sucesso');
      } else {
        console.log('SQLITE: Motivos já existem, pulando inserção');
      }
      
    } catch (error) {
      console.error('SQLITE: Erro ao inserir motivos:', error);
      throw error;
    }
  }

  async insertInitialProducts() {
    try {
      console.log('SQLITE: Verificando tabela products...');
      
      const [results] = await this.db.executeSql(
        'SELECT COUNT(*) as count FROM products'
      );
      
      const count = results.rows.item(0).count;
      console.log(`SQLITE: Products existentes: ${count}`);

      if (count === 0) {
        console.log('SQLITE: Inserindo produtos iniciais...');
        
        for (const product of INITIAL_PRODUCTS) {
          await this.db.executeSql(
            'INSERT INTO products (product_code, product_name, regular_price, club_price, unit_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product.product_code, product.product_name, product.regular_price, product.club_price, product.unit_type, product.created_at, product.updated_at]
          );
        }
        
        console.log('SQLITE: Produtos inseridos com sucesso');
      } else {
        console.log('SQLITE: Produtos já existem, pulando inserção');
      }
      
    } catch (error) {
      console.error('SQLITE: Erro ao inserir produtos:', error);
      throw error;
    }
  }

  async logDataVerification() {
    try {
      console.log('SQLITE: Verificando dados inseridos...');
      
      // Verificar reasons
      const [reasonsResults] = await this.db.executeSql('SELECT * FROM reasons');
      const reasonsCount = reasonsResults.rows.length;
      console.log(`SQLITE: Motivos carregados: ${reasonsCount}`);
      
      for (let i = 0; i < reasonsCount; i++) {
        const reason = reasonsResults.rows.item(i);
        console.log(`SQLITE: - ${reason.code}: ${reason.description}`);
      }

      // Verificar products
      const [productsResults] = await this.db.executeSql('SELECT * FROM products');
      const productsCount = productsResults.rows.length;
      console.log(`SQLITE: Produtos carregados: ${productsCount}`);
      
      for (let i = 0; i < productsCount; i++) {
        const product = productsResults.rows.item(i);
        console.log(`SQLITE: - ${product.product_code}: ${product.product_name} (${product.unit_type})`);
      }
      
    } catch (error) {
      console.error('SQLITE: Erro na verificação de dados:', error);
    }
  }

  async getDatabase() {
    if (!this.db || !isDatabaseReady(this.db)) {
      console.log('SQLITE: Database não pronto, reinicializando...');
      await this.initialize();
    }
    return this.db;
  }

  async getProduct(productCode) {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto');
      }
      
      if (!productCode || typeof productCode !== 'string') {
        console.log('SQLITE: Código de produto inválido');
        return null;
      }

      console.log(`SQLITE: Buscando produto: ${productCode}`);
      
      const [results] = await this.db.executeSql(
        'SELECT * FROM products WHERE product_code = ? LIMIT 1',
        [productCode.trim()]
      );

      if (results.rows.length > 0) {
        const product = results.rows.item(0);
        console.log(`SQLITE: Produto encontrado: ${product.product_name}`);
        return product;
      }

      console.log('SQLITE: Produto não encontrado');
      return null;
      
    } catch (error) {
      console.error('SQLITE: Erro ao buscar produto:', error);
      return null;
    }
  }

  async insertEntry(entryData) {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto');
      }

      const { product_code, product_name, quantity, reason_id } = entryData;
      
      if (!product_code || !product_name || !quantity || !reason_id) {
        throw new Error('Dados da entrada incompletos');
      }

      console.log('SQLITE: Inserindo entrada...', entryData);

      const entry_date = new Date().toISOString();
      
      const [results] = await this.db.executeSql(`
        INSERT INTO entries (product_code, product_name, quantity, reason_id, entry_date)
        VALUES (?, ?, ?, ?, ?)
      `, [product_code, product_name, quantity, reason_id, entry_date]);

      const entryId = results.insertId;
      console.log(`SQLITE: Entrada inserida com sucesso, ID: ${entryId}`);
      return entryId;

    } catch (error) {
      console.error('SQLITE: Erro ao inserir entrada:', error);
      throw error;
    }
  }

  async getReasons() {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto');
      }

      console.log('SQLITE: Buscando motivos...');
      
      const [results] = await this.db.executeSql(
        'SELECT * FROM reasons ORDER BY code'
      );

      const reasons = [];
      for (let i = 0; i < results.rows.length; i++) {
        reasons.push(results.rows.item(i));
      }

      console.log(`SQLITE: ${reasons.length} motivos encontrados`);
      return reasons;

    } catch (error) {
      console.error('SQLITE: Erro ao buscar motivos:', error);
      return [];
    }
  }

  async close() {
    if (this.db) {
      await closeDatabase(this.db);
      this.db = null;
    }
  }

  // Método para resetar o banco (útil para desenvolvimento/testes)
  async resetDatabase() {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto');
      }

      const tables = ['imports', 'entry_changes', 'entries', 'reasons', 'products'];
      
      for (const table of tables) {
        await this.db.executeSql(`DROP TABLE IF EXISTS ${table}`);
      }
      
      console.log('SQLITE: Database resetado com sucesso');
      await this.initialize();
      
    } catch (error) {
      console.error('SQLITE: Erro ao resetar database:', error);
      throw error;
    }
  }

  // Método para verificar a integridade do banco
  async checkIntegrity() {
    try {
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database não está pronto');
      }

      const [results] = await this.db.executeSql('PRAGMA integrity_check');
      const result = results.rows.item(0);
      console.log('SQLITE: Verificação de integridade:', result);
      return result;
      
    } catch (error) {
      console.error('SQLITE: Erro na verificação de integridade:', error);
      throw error;
    }
  }
}

// Função genérica para buscar dados (motivos e produtos)
export const fetchData = async (table, searchTerm = '') => {
  try {
    const manager = DatabaseManager.getInstance();
    const db = await manager.getDatabase();
    
    if (!isDatabaseReady(db)) {
      throw new Error('Database não está pronto');
    }

    let query = `SELECT * FROM ${table}`;
    let params = [];
    
    // Adicionar filtro de busca para produtos
    if (searchTerm && table === 'products') {
      query += ` WHERE product_code LIKE ? OR product_name LIKE ?`;
      params = [`${searchTerm}%`, `${searchTerm}%`];
    }
    
    // Ordenar resultados
    if (table === 'reasons') {
      query += ` ORDER BY code`;
    } else if (table === 'products') {
      query += ` ORDER BY product_name`;
    }

    console.log(`SQLITE: Buscando dados da tabela ${table}...`);
    const [results] = await db.executeSql(query, params);
    
    // Converter ResultSet para Array
    const data = [];
    for (let i = 0; i < results.rows.length; i++) {
      data.push(results.rows.item(i));
    }
    
    console.log(`SQLITE: ${data.length} registros encontrados na tabela ${table}`);
    return data;
    
  } catch (error) {
    console.error(`SQLITE: Erro ao buscar dados da tabela ${table}:`, error);
    return [];
  }
};

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();

// Export para uso direto
export default dbManager;