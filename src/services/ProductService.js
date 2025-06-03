import { database } from '../database';
import Product from '../database/model/Product.js';

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
      .replace(/[-]/g, '');
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
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      
      // Mapear para formato esperado
      const mappedProducts = products.map(product => ({
        id: product.id,
        product_code: product.product_code,
        product_name: product.product_name,
        price: product.price,
        club_price: product.club_price,
        regular_price: product.regular_price,
        unit_type: product.unit_type,
        image_url: product.image_url,
        product_url: product.product_url,
        short_ean_code: product.short_ean_code,
        total_weight_kg: product.total_weight_kg,
        full_description: product.full_description,
        created_at: product.created_at,
        updated_at: product.updated_at
      }));
      
      // Salvar no cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: mappedProducts,
          timestamp: Date.now()
        });
      }
      
      console.log(`ProductService: ${mappedProducts.length} produtos carregados do banco`);
      return mappedProducts;
      
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
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      
      // Filtrar com normalização para melhor precisão
      const filteredResults = products.filter(product => {
        const normalizedCode = this.normalizeString(product.product_code || '');
        const normalizedName = this.normalizeString(product.product_name || '');
        
        return normalizedCode.includes(normalizedTerm) ||
               normalizedName.includes(normalizedTerm);
      }).map(product => ({
        id: product.id,
        product_code: product.product_code,
        product_name: product.product_name,
        price: product.price,
        club_price: product.club_price,
        regular_price: product.regular_price,
        unit_type: product.unit_type,
        image_url: product.image_url,
        product_url: product.product_url,
        short_ean_code: product.short_ean_code,
        total_weight_kg: product.total_weight_kg,
        full_description: product.full_description,
        created_at: product.created_at,
        updated_at: product.updated_at
      }));

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
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      const product = products.find(p => p.product_code === productCode);
      
      if (!product) {
        return null;
      }
      
      const mappedProduct = {
        id: product.id,
        product_code: product.product_code,
        product_name: product.product_name,
        price: product.price,
        club_price: product.club_price,
        regular_price: product.regular_price,
        unit_type: product.unit_type,
        image_url: product.image_url,
        product_url: product.product_url,
        short_ean_code: product.short_ean_code,
        total_weight_kg: product.total_weight_kg,
        full_description: product.full_description,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
      
      // Salvar no cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: mappedProduct,
          timestamp: Date.now()
        });
      }
      
      return mappedProduct;
      
    } catch (error) {
      console.error('ProductService: Erro ao buscar produto por código:', error);
      throw new Error(`Falha ao buscar produto: ${error.message}`);
    }
  }

  /**
   * Adiciona um novo produto
   * @param {Object} productData - Dados do produto
   * @returns {Promise<Object>} - Produto criado
   */
  async addProduct(productData) {
    try {
      const product = await database.write(async () => {
        const productsCollection = database.get('products');
        return await productsCollection.create(product => {
          product.product_code = productData.product_code;
          product.product_name = productData.product_name;
          product.price = productData.price || 0;
          product.club_price = productData.club_price || 0;
          product.regular_price = productData.regular_price || productData.price || 0;
          product.unit_type = productData.unit_type || 'UN';
          product.image_url = productData.image_url || null;
          product.product_url = productData.product_url || null;
          product.short_ean_code = productData.short_ean_code || null;
          product.total_weight_kg = productData.total_weight_kg || null;
          product.full_description = productData.full_description || null;
          product.created_at = new Date();
          product.updated_at = new Date();
        });
      });

      // Limpar cache para forçar atualização
      this.clearCache();
      
      console.log('ProductService: Produto adicionado com ID:', product.id);
      return product;
      
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
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      const product = products.find(p => p.product_code === productCode);
      
      if (!product) {
        return false;
      }

      await database.write(async () => {
        await product.update(product => {
          if (updates.product_name !== undefined) product.product_name = updates.product_name;
          if (updates.price !== undefined) product.price = updates.price;
          if (updates.club_price !== undefined) product.club_price = updates.club_price;
          if (updates.regular_price !== undefined) product.regular_price = updates.regular_price;
          if (updates.unit_type !== undefined) product.unit_type = updates.unit_type;
          if (updates.image_url !== undefined) product.image_url = updates.image_url;
          if (updates.product_url !== undefined) product.product_url = updates.product_url;
          if (updates.short_ean_code !== undefined) product.short_ean_code = updates.short_ean_code;
          if (updates.total_weight_kg !== undefined) product.total_weight_kg = updates.total_weight_kg;
          if (updates.full_description !== undefined) product.full_description = updates.full_description;
          product.updated_at = new Date();
        });
      });

      // Limpar cache
      this.clearCache();
      console.log('ProductService: Produto atualizado com sucesso');
      return true;
      
    } catch (error) {
      console.error('ProductService: Erro ao atualizar produto:', error);
      throw new Error(`Falha ao atualizar produto: ${error.message}`);
    }
  }

  /**
   * Remove um produto
   * @param {string} productCode - Código do produto
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  async removeProduct(productCode) {
    try {
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      const product = products.find(p => p.product_code === productCode);
      
      if (!product) {
        return false;
      }

      await database.write(async () => {
        await product.destroyPermanently();
      });

      // Limpar cache
      this.clearCache();
      console.log('ProductService: Produto removido');
      return true;
      
    } catch (error) {
      console.error('ProductService: Erro ao remover produto:', error);
      throw new Error(`Falha ao remover produto: ${error.message}`);
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
        .map(p => p.price || 0)
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
}

// Exportar instância singleton
export const productService = new ProductService();
export default productService;
