import { expoDbManager } from '../database/expo-manager';
import { INITIAL_PRODUCTS } from '../database/schema';

/**
 * Serviço para operações relacionadas a produtos
 * Centraliza toda a lógica de negócio e acesso a dados dos produtos
 */
class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.isInitialized = false;
  }

  /**
   * Normaliza string para busca insensível a acentos
   * @param {string} str - String para normalizar
   * @returns {string} - String normalizada
   */
  normalizeString(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Verifica se o cache ainda é válido
   * @param {number} timestamp - Timestamp do cache
   * @returns {boolean} - True se o cache é válido
   */
  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Limpa todo o cache de produtos
   */
  clearCache() {
    this.cache.clear();
    console.log('ProductService: Cache limpo');
  }

  /**
   * Inicializa produtos padrão se não existirem
   * @returns {Promise<Array>} - Lista de produtos inicializados
   */
  async initializeProducts() {
    try {
      const existingProducts = await expoDbManager.fetchData('products');
      
      if (existingProducts.length > 0) {
        console.log('ProductService: Produtos já existem no banco -', existingProducts.length, 'itens');
        return existingProducts;
      }

      console.log('ProductService: Inicializando produtos padrão...');
      const db = await expoDbManager.getDatabase();
      const now = new Date().toISOString();
      
      const insertedProducts = [];
      
      for (const product of INITIAL_PRODUCTS) {
        const result = await db.runAsync(
          'INSERT INTO products (product_code, product_name, regular_price, club_price, unit_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            product.product_code,
            product.product_name,
            product.regular_price,
            product.club_price,
            product.unit_type,
            product.created_at || now,
            product.updated_at || now
          ]
        );
        
        insertedProducts.push({
          id: result.lastInsertRowId,
          ...product,
          created_at: product.created_at || now,
          updated_at: product.updated_at || now
        });
      }
      
      console.log(`ProductService: ${insertedProducts.length} produtos inicializados com sucesso`);
      this.isInitialized = true;
      return insertedProducts;
      
    } catch (error) {
      console.error('ProductService: Erro ao inicializar produtos:', error);
      throw new Error(`Falha ao inicializar produtos: ${error.message}`);
    }
  }

  /**
   * Busca todos os produtos
   * @param {boolean} useCache - Se deve usar cache
   * @returns {Promise<Array>} - Lista de produtos
   */
  async getAllProducts(useCache = true) {
    const cacheKey = 'all_products';
    
    // Verificar cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached.timestamp)) {
        console.log('ProductService: Retornando produtos do cache');
        return cached.data;
      }
    }

    try {
      // Garantir que produtos estão inicializados
      if (!this.isInitialized) {
        await this.initializeProducts();
      }

      const products = await expoDbManager.fetchData('products');
      
      // Salvar no cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: products,
          timestamp: Date.now()
        });
      }
      
      console.log(`ProductService: ${products.length} produtos carregados do banco`);
      return products;
      
    } catch (error) {
      console.error('ProductService: Erro ao buscar todos os produtos:', error);
      throw new Error(`Falha ao carregar produtos: ${error.message}`);
    }
  }

  /**
   * Busca produtos por termo de pesquisa
   * @param {string} searchTerm - Termo de busca
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} - Lista de produtos filtrados
   */
  async searchProducts(searchTerm, options = {}) {
    const { maxResults = 10, useCache = true } = options;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const normalizedTerm = this.normalizeString(searchTerm.trim());
    const cacheKey = `search_${normalizedTerm}_${maxResults}`;
    
    // Verificar cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached.timestamp)) {
        console.log(`ProductService: Retornando busca do cache para "${searchTerm}"`);
        return cached.data;
      }
    }

    try {
      // Usar a funcionalidade existente do expo-manager para busca básica
      const results = await expoDbManager.fetchData('products', searchTerm);
      
      // Filtrar com normalização adicional para melhor precisão
      const filteredResults = results.filter(product => {
        const normalizedCode = this.normalizeString(product.product_code || '');
        const normalizedName = this.normalizeString(product.product_name || '');
        
        return normalizedCode.includes(normalizedTerm) ||
               normalizedName.includes(normalizedTerm);
      });

      // Limitar resultados
      const limitedResults = filteredResults.slice(0, maxResults);
      
      // Salvar no cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: limitedResults,
          timestamp: Date.now()
        });
        
        // Limitar tamanho do cache
        if (this.cache.size > 100) {
          const oldestKey = this.cache.keys().next().value;
          this.cache.delete(oldestKey);
        }
      }
      
      console.log(`ProductService: Busca por "${searchTerm}" retornou ${limitedResults.length} resultados`);
      return limitedResults;
      
    } catch (error) {
      console.error('ProductService: Erro na busca de produtos:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }

  /**
   * Busca produto por código específico
   * @param {string} productCode - Código do produto
   * @param {boolean} useCache - Se deve usar cache
   * @returns {Promise<Object|null>} - Produto encontrado ou null
   */
  async getProductByCode(productCode, useCache = true) {
    if (!productCode) return null;

    const cacheKey = `product_${productCode}`;
    
    // Verificar cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached.timestamp)) {
        console.log(`ProductService: Retornando produto do cache para código "${productCode}"`);
        return cached.data;
      }
    }

    try {
      const product = await expoDbManager.getProduct(productCode);
      
      // Salvar no cache
      if (useCache && product) {
        this.cache.set(cacheKey, {
          data: product,
          timestamp: Date.now()
        });
      }
      
      return product;
      
    } catch (error) {
      console.error('ProductService: Erro ao buscar produto por código:', error);
      throw new Error(`Falha ao buscar produto: ${error.message}`);
    }
  }

  /**
   * Adiciona um novo produto
   * @param {Object} productData - Dados do produto
   * @returns {Promise<number>} - ID do produto inserido
   */
  async addProduct(productData) {
    try {
      const db = await expoDbManager.getDatabase();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        'INSERT INTO products (product_code, product_name, regular_price, club_price, unit_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          productData.product_code,
          productData.product_name,
          productData.regular_price || 0,
          productData.club_price || 0,
          productData.unit_type || 'UN',
          now,
          now
        ]
      );

      // Limpar cache para forçar atualização
      this.clearCache();
      
      console.log('ProductService: Produto adicionado com ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
      
    } catch (error) {
      console.error('ProductService: Erro ao adicionar produto:', error);
      throw new Error(`Falha ao adicionar produto: ${error.message}`);
    }
  }

  /**
   * Atualiza um produto existente
   * @param {string} productCode - Código do produto
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<boolean>} - True se atualizado com sucesso
   */
  async updateProduct(productCode, updates) {
    try {
      const db = await expoDbManager.getDatabase();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        'UPDATE products SET product_name = ?, regular_price = ?, club_price = ?, unit_type = ?, updated_at = ? WHERE product_code = ? AND (deleted_at IS NULL OR deleted_at = "")',
        [
          updates.product_name,
          updates.regular_price,
          updates.club_price,
          updates.unit_type,
          now,
          productCode
        ]
      );

      if (result.changes > 0) {
        // Limpar cache
        this.clearCache();
        console.log('ProductService: Produto atualizado com sucesso');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('ProductService: Erro ao atualizar produto:', error);
      throw new Error(`Falha ao atualizar produto: ${error.message}`);
    }
  }

  /**
   * Remove um produto (soft delete)
   * @param {string} productCode - Código do produto
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  async removeProduct(productCode) {
    try {
      const db = await expoDbManager.getDatabase();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        'UPDATE products SET deleted_at = ?, updated_at = ? WHERE product_code = ?',
        [now, now, productCode]
      );

      if (result.changes > 0) {
        // Limpar cache
        this.clearCache();
        console.log('ProductService: Produto removido (soft delete)');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('ProductService: Erro ao remover produto:', error);
      throw new Error(`Falha ao remover produto: ${error.message}`);
    }
  }

  /**
   * Importa produtos em lote
   * @param {Array} productsData - Array de dados de produtos
   * @returns {Promise<Object>} - Resultado da importação
   */
  async importProducts(productsData) {
    if (!Array.isArray(productsData) || productsData.length === 0) {
      throw new Error('Dados de produtos inválidos para importação');
    }

    try {
      const db = await expoDbManager.getDatabase();
      const now = new Date().toISOString();
      
      let inserted = 0;
      let updated = 0;
      let errors = [];

      await db.execAsync('BEGIN TRANSACTION');

      for (const productData of productsData) {
        try {
          // Verificar se produto já existe
          const existing = await this.getProductByCode(productData.product_code, false);
          
          if (existing) {
            // Atualizar produto existente
            const updateResult = await this.updateProduct(productData.product_code, productData);
            if (updateResult) updated++;
          } else {
            // Inserir novo produto
            await this.addProduct(productData);
            inserted++;
          }
        } catch (error) {
          errors.push({
            product_code: productData.product_code,
            error: error.message
          });
        }
      }

      await db.execAsync('COMMIT');
      
      // Limpar cache após importação
      this.clearCache();
      
      const result = {
        total: productsData.length,
        inserted,
        updated,
        errors: errors.length,
        errorDetails: errors
      };
      
      console.log('ProductService: Importação concluída:', result);
      return result;
      
    } catch (error) {
      try {
        const db = await expoDbManager.getDatabase();
        await db.execAsync('ROLLBACK');
      } catch (rollbackError) {
        console.error('ProductService: Erro no rollback:', rollbackError);
      }
      
      console.error('ProductService: Erro na importação:', error);
      throw new Error(`Falha na importação: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas dos produtos
   * @returns {Promise<Object>} - Estatísticas dos produtos
   */
  async getProductStatistics() {
    try {
      const products = await this.getAllProducts();
      
      const stats = {
        total: products.length,
        byUnitType: {},
        priceRange: { min: 0, max: 0, average: 0 },
        lastUpdated: new Date().toISOString()
      };

      // Agrupar por tipo de unidade
      products.forEach(product => {
        const unitType = product.unit_type || 'UN';
        stats.byUnitType[unitType] = (stats.byUnitType[unitType] || 0) + 1;
      });

      // Calcular faixa de preços
      const prices = products
        .map(p => p.regular_price || 0)
        .filter(price => price > 0);
      
      if (prices.length > 0) {
        stats.priceRange.min = Math.min(...prices);
        stats.priceRange.max = Math.max(...prices);
        stats.priceRange.average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      }

      return stats;
      
    } catch (error) {
      console.error('ProductService: Erro ao obter estatísticas:', error);
      throw new Error(`Falha ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Verifica integridade dos dados de produtos
   * @returns {Promise<Object>} - Resultado da verificação
   */
  async checkDataIntegrity() {
    try {
      const db = await expoDbManager.getDatabase();
      
      // Verificar produtos duplicados
      const [duplicates] = await db.getAllAsync(
        'SELECT product_code, COUNT(*) as count FROM products WHERE deleted_at IS NULL GROUP BY product_code HAVING COUNT(*) > 1'
      );

      // Verificar produtos sem nome
      const [missingNames] = await db.getAllAsync(
        'SELECT COUNT(*) as count FROM products WHERE (product_name IS NULL OR product_name = "") AND deleted_at IS NULL'
      );

      // Verificar produtos com preços inválidos
      const [invalidPrices] = await db.getAllAsync(
        'SELECT COUNT(*) as count FROM products WHERE (regular_price < 0 OR club_price < 0) AND deleted_at IS NULL'
      );

      const result = {
        duplicateProducts: duplicates?.rows?._array || [],
        missingNames: missingNames?.rows?.item(0)?.count || 0,
        invalidPrices: invalidPrices?.rows?.item(0)?.count || 0,
        isHealthy: duplicates?.rows?._array?.length === 0 && 
                  (missingNames?.rows?.item(0)?.count || 0) === 0 && 
                  (invalidPrices?.rows?.item(0)?.count || 0) === 0
      };

      console.log('ProductService: Verificação de integridade:', result);
      return result;
      
    } catch (error) {
      console.error('ProductService: Erro na verificação de integridade:', error);
      throw new Error(`Falha na verificação: ${error.message}`);
    }
  }
}

// Exportar instância singleton
export const productService = new ProductService();
export default productService;