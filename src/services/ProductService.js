import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

/**
 * Serviço para operações relacionadas a produtos usando WatermelonDB
 * Centraliza toda a lógica de negócio e acesso a dados dos produtos
 */
class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.searchDebounceTimer = null;
  }

  /**
   * Formata o código do produto para ter exatamente 13 caracteres
   * @param {string} code - Código do produto
   * @returns {string} - Código formatado com zeros à esquerda
   */
  formatProductCode(code) {
    if (!code) return null;
    return String(code).padStart(13, '0');
  }

  /**
   * Determina o tipo de unidade baseado no nome do produto
   * Se o nome contiver "KG" (case-insensitive), retorna "KG", caso contrário retorna "UN"
   * @param {string} productName - Nome do produto
   * @returns {string} - "KG" ou "UN"
   */
  determineUnitType(productName) {
    if (!productName) return 'UN';
    return productName.toUpperCase().includes('KG') ? 'KG' : 'UN';
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
   * Busca todos os produtos ativos (não excluídos)
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
      const products = await productsCollection
        .query(
          Q.where('deleted_at', null) // Filtrar produtos não excluídos
        )
        .fetch();
      
      // Mapear para formato esperado
      const mappedProducts = products.map(product => ({
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        regularPrice: product.regularPrice,
        clubPrice: product.clubPrice,
        unitType: product.unitType,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Campos legacy para compatibilidade
        product_code: product.productCode,
        product_name: product.productName,
        regular_price: product.regularPrice,
        club_price: product.clubPrice,
        unit_type: product.unitType,
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
   * Busca produtos por termo de pesquisa usando WatermelonDB queries
   * @param {string} searchTerm - Termo de busca
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} - Lista de produtos filtrados
   */
  async searchProducts(searchTerm, options = {}) {
    const { maxResults = 10, useCache = true } = options;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const trimmedTerm = searchTerm.trim().toLowerCase();
    const cacheKey = `search_${trimmedTerm}_${maxResults}`;
    
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
      
      // Busca usando WatermelonDB queries com Q.like para busca por nome e código
      const products = await productsCollection
        .query(
          Q.where('deleted_at', null), // Apenas produtos não excluídos
          Q.or(
            Q.where('product_name', Q.like(`%${trimmedTerm}%`)),
            Q.where('product_code', Q.like(`%${trimmedTerm}%`))
          ),
          Q.take(maxResults) // Limitar resultados na query
        )
        .fetch();
      
      // Mapear resultados
      const mappedResults = products.map(product => ({
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        regularPrice: product.regularPrice,
        clubPrice: product.clubPrice,
        unitType: product.unitType,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Campos legacy para compatibilidade
        product_code: product.productCode,
        product_name: product.productName,
        regular_price: product.regularPrice,
        club_price: product.clubPrice,
        unit_type: product.unitType,
      }));
      
      // Salvar no cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: mappedResults,
          timestamp: Date.now()
        });
        
        // Limitar tamanho do cache
        if (this.cache.size > 100) {
          const oldestKey = this.cache.keys().next().value;
          this.cache.delete(oldestKey);
        }
      }
      
      console.log(`ProductService: Busca por "${searchTerm}" retornou ${mappedResults.length} resultados`);
      return mappedResults;
      
    } catch (error) {
      console.error('ProductService: Erro na busca de produtos:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }

  /**
   * Busca produtos com debounce para otimizar performance
   * @param {string} searchTerm - Termo de busca
   * @param {Object} options - Opções de busca
   * @param {number} debounceMs - Tempo de debounce em ms
   * @returns {Promise<Array>} - Lista de produtos filtrados
   */
  async searchProductsDebounced(searchTerm, options = {}, debounceMs = 300) {
    return new Promise((resolve, reject) => {
      // Limpar timer anterior
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      // Configurar novo timer
      this.searchDebounceTimer = setTimeout(async () => {
        try {
          const results = await this.searchProducts(searchTerm, options);
          resolve(results);
        } catch (error) {
          reject(error);
        }
      }, debounceMs);
    });
  }

  /**
   * Busca produto por código específico
   * @param {string} productCode - Código do produto
   * @param {boolean} useCache - Se deve usar cache
   * @returns {Promise<Object|null>} - Produto encontrado ou null
   */
  async getProductByCode(productCode, useCache = true) {
    if (!productCode) return null;

    // Formatar código do produto para busca
    const formattedCode = this.formatProductCode(productCode);
    if (!formattedCode) return null;

    const cacheKey = `product_${formattedCode}`;
    
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
      const products = await productsCollection
        .query(
          Q.or(
            Q.where('product_code', formattedCode),
            Q.where('product_code', productCode.replace(/^0+/, '')) // Também busca sem zeros à esquerda
          ),
          Q.where('deleted_at', null) // Apenas produtos não excluídos
        )
        .fetch();
      
      if (products.length === 0) {
        return null;
      }
      
      const product = products[0];
      const mappedProduct = {
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        regularPrice: product.regularPrice,
        clubPrice: product.clubPrice,
        unitType: product.unitType,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Campos legacy para compatibilidade
        product_code: product.productCode,
        product_name: product.productName,
        regular_price: product.regularPrice,
        club_price: product.clubPrice,
        unit_type: product.unitType,
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
          const productName = productData.product_name || productData.productName;
          const determinedUnitType = this.determineUnitType(productName);
  
          return await productsCollection.create(product => {
            const rawCode = productData.product_code || productData.productCode;
            product.productCode = this.formatProductCode(rawCode);
            product.productName = productName;
            product.regularPrice = productData.regular_price || productData.regularPrice || 0;
            product.clubPrice = productData.club_price || productData.clubPrice || 0;
            product.unitType = productData.unit_type || productData.unitType || determinedUnitType;
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
        const formattedCode = this.formatProductCode(productCode);
        if (!formattedCode) {
          console.error('ProductService: Código de produto inválido para atualização:', productCode);
          return false;
        }
        
        const product = await this.getProductByCode(formattedCode, false);
        
        if (!product) {
          return false;
        }
  
        await database.write(async () => {
          const productsCollection = database.get('products');
          const productRecord = await productsCollection.find(product.id);
          
          await productRecord.update(product => {
            if (updates.product_name || updates.productName) {
              const newProductName = updates.product_name || updates.productName;
              product.productName = newProductName;
              // Atualiza o unit_type baseado no novo nome se não foi explicitamente fornecido
              if (!updates.unit_type && !updates.unitType) {
                product.unitType = this.determineUnitType(newProductName);
              }
            }
          if (updates.regular_price !== undefined || updates.regularPrice !== undefined) {
            product.regularPrice = updates.regular_price || updates.regularPrice;
          }
          if (updates.club_price !== undefined || updates.clubPrice !== undefined) {
            product.clubPrice = updates.club_price || updates.clubPrice;
          }
          if (updates.unit_type || updates.unitType) {
            product.unitType = updates.unit_type || updates.unitType;
          }
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
   * Remove um produto (soft delete)
   * @param {string} productCode - Código do produto
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  async removeProduct(productCode) {
    try {
      const formattedCode = this.formatProductCode(productCode);
      if (!formattedCode) {
        console.error('ProductService: Código de produto inválido para remoção:', productCode);
        return false;
      }
      
      const product = await this.getProductByCode(formattedCode, false);
      
      if (!product) {
        return false;
      }

      await database.write(async () => {
        const productsCollection = database.get('products');
        const productRecord = await productsCollection.find(product.id);
        
        await productRecord.update(product => {
          product.deletedAt = new Date();
        });
      });

      // Limpar cache
      this.clearCache();
      console.log('ProductService: Produto removido (soft delete)');
      return true;
      
    } catch (error) {
      console.error('ProductService: Erro ao remover produto:', error);
      throw new Error(`Falha ao remover produto: ${error.message}`);
    }
  }

  /**
   * Importa produtos a partir de um arquivo TXT
   * Formato esperado: cada linha com 40 caracteres exatos
   * - Posições 0-12: product_code (13 dígitos numéricos)
   * - Posições 13-32: product_name (20 caracteres, trim)
   * - Posições 33-39: regular_price (7 caracteres, decimal)
   * 
   * @returns {Promise<Object>} - Estatísticas da importação
   */
  async importProductsFromTxt() {
    const stats = {
      inserted: 0,
      updated: 0,
      errors: [], // Array de {lineNumber, lineContent, error}
    };
    const processedProductCodesInFile = new Set(); // Para evitar duplicatas do arquivo

    try {
      console.log('ProductService: Iniciando seleção de arquivo para importação...');
      
      // 1. Seleção do arquivo
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
        multiple: false,
      });

      // Verificar se a seleção foi cancelada (API mais recente do expo-document-picker)
      if (pickerResult.canceled === true || !pickerResult.assets || pickerResult.assets.length === 0) {
        console.log('ProductService: Seleção de arquivo cancelada');
        return { 
          ...stats, 
          errors: [{ 
            lineNumber: 0, 
            lineContent: '', 
            error: 'Seleção de arquivo cancelada ou falhou.' 
          }] 
        };
      }

      const asset = pickerResult.assets[0];
      if (!asset.uri) {
        console.log('ProductService: URI do arquivo não encontrado');
        return { 
          ...stats, 
          errors: [{ 
            lineNumber: 0, 
            lineContent: '', 
            error: 'URI do arquivo não encontrado.' 
          }] 
        };
      }

      console.log(`ProductService: Arquivo selecionado: ${asset.name || 'arquivo.txt'}`);

      // 2. Leitura do conteúdo do arquivo
      const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const lines = fileContent.split(/\r\n|\n|\r/); // Lida com diferentes quebras de linha
      console.log(`ProductService: Arquivo lido com ${lines.length} linhas`);

      const productsCollection = database.get('products');

      // 3. Processamento das linhas dentro de uma transação do WatermelonDB
      await database.write(async () => {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNumber = i + 1;

          // Pular linhas vazias
          if (!line.trim()) {
            continue;
          }

          try {
            // 3.1. Validação de comprimento da linha
            if (line.length !== 40) {
              stats.errors.push({ 
                lineNumber, 
                lineContent: line, 
                error: `Linha não tem 40 caracteres (possui ${line.length}).` 
              });
              continue;
            }

            // 3.2. Extração de campos
            const productCodeStr = line.substring(0, 13);
            let productNameStr = line.substring(13, 33).trim(); // Usar 'let' para permitir reassinalação

            // Sanitização do nome do produto - remover sufixo "000"
            if (productNameStr.endsWith('000')) {
              productNameStr = productNameStr.substring(0, productNameStr.length - 3).trim();
            }
            const regularPriceStr = line.substring(33, 40); // 7 caracteres

            // 3.3. Validações de conteúdo
            // Validar código do produto (13 dígitos numéricos)
            if (!/^\d{13}$/.test(productCodeStr)) {
              stats.errors.push({ 
                lineNumber, 
                lineContent: line, 
                error: `Código de produto inválido: '${productCodeStr}'. Deve ter 13 dígitos numéricos.` 
              });
              continue;
            }

            // Validar nome do produto (não pode ser vazio após trim)
            if (!productNameStr) {
              stats.errors.push({ 
                lineNumber, 
                lineContent: line, 
                error: 'Nome do produto não pode ser vazio.' 
              });
              continue;
            }

            // Validar preço regular (converter para decimal, suportando vírgula)
            const regularPriceNum = parseFloat(regularPriceStr.replace(',', '.'));
            if (isNaN(regularPriceNum) || regularPriceNum <= 0) {
              stats.errors.push({ 
                lineNumber, 
                lineContent: line, 
                error: `Preço regular inválido ou não positivo: '${regularPriceStr}'.` 
              });
              continue;
            }

            // 3.4. Verificar duplicatas dentro do mesmo arquivo
            if (processedProductCodesInFile.has(productCodeStr)) {
              stats.errors.push({ 
                lineNumber, 
                lineContent: line, 
                error: `Código de produto duplicado neste arquivo: '${productCodeStr}'.` 
              });
              continue;
            }
            processedProductCodesInFile.add(productCodeStr);

            // 3.5. Verificar se produto já existe no banco
            const existingProducts = await productsCollection
              .query(
                Q.where('product_code', this.formatProductCode(productCodeStr)),
                Q.where('deleted_at', null) // Apenas produtos não excluídos
              )
              .fetch();

            if (existingProducts.length > 0) {
              // 3.6. Produto existe - fazer UPDATE
              const productToUpdate = existingProducts[0];
              await productToUpdate.update(product => {
                              product.productName = productNameStr;
                              product.regularPrice = regularPriceNum;
                              product.unitType = this.determineUnitType(productNameStr);
                // updatedAt será gerenciado automaticamente pelo WatermelonDB
              });
              stats.updated++;
              console.log(`ProductService: Produto atualizado - ${productCodeStr}: ${productNameStr}`);
            } else {
              // 3.7. Produto não existe - fazer CREATE
              await productsCollection.create(product => {
                              product.productCode = productCodeStr;
                              product.productName = productNameStr;
                              product.regularPrice = regularPriceNum;
                              product.clubPrice = 0; // Valor padrão
                              product.unitType = this.determineUnitType(productNameStr);
                // createdAt e updatedAt serão gerenciados automaticamente pelo WatermelonDB
              });
              stats.inserted++;
              console.log(`ProductService: Produto criado - ${productCodeStr}: ${productNameStr}`);
            }

          } catch (lineError) {
            console.error(`ProductService: Erro ao processar linha ${lineNumber}:`, lineError);
            stats.errors.push({ 
              lineNumber, 
              lineContent: line, 
              error: `Erro interno ao processar linha: ${lineError.message}` 
            });
          }
        }
      });

      // 4. Limpar cache após importação
      this.clearCache();

    } catch (error) {
      console.error('ProductService: Erro durante a importação:', error);
      stats.errors.push({ 
        lineNumber: 0, 
        lineContent: '', 
        error: `Erro geral na importação: ${error.message}` 
      });
    }

    // 5. Log das estatísticas finais
    console.log('ProductService: Importação concluída');
    console.log('ProductService: Estatísticas da Importação:', {
      inserted: stats.inserted,
      updated: stats.updated,
      errorsCount: stats.errors.length,
      totalProcessed: stats.inserted + stats.updated + stats.errors.length
    });

    return stats;
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
        const unitType = product.unitType || 'UN';
        stats.byUnitType[unitType] = (stats.byUnitType[unitType] || 0) + 1;
      });

      // Calcular faixa de preços
      const prices = products
        .map(p => p.regularPrice || 0)
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
