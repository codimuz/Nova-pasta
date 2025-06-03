// src/services/EntryService.js
import { database } from '../database';
import Entry from '../database/model/Entry.js';
import Product from '../database/model/Product.js';
import Reason from '../database/model/Reason.js';

export class EntryService {
  /**
   * Cria uma nova entrada no inventário.
   * @param {string} productCode - Código de barras do produto.
   * @param {string} reasonId - ID do WatermelonDB da Reason.
   * @param {number} quantity - Quantidade da entrada.
   * @returns {Promise<Entry>} Entrada criada.
   */
  static async createEntry(productCode, reasonId, quantity) {
    return await database.write(async () => {
      // Buscar o produto pelo código
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      const product = products.find(p => p.product_code === productCode);
      
      if (!product) {
        throw new Error(`Produto com código ${productCode} não encontrado`);
      }

      // Buscar o motivo pelo ID
      const reasonsCollection = database.get('reasons');
      const reason = await reasonsCollection.find(reasonId);
      
      if (!reason) {
        throw new Error(`Motivo com ID ${reasonId} não encontrado`);
      }

      // Criar a entrada
      const entriesCollection = database.get('entries');
      const entry = await entriesCollection.create(entry => {
        entry.product_code = productCode;
        entry.product_name = product.product_name;
        entry.quantity = quantity;
        entry.reason_id = reasonId;
        entry.unit_cost = product.price || 0;
        entry.created_at = new Date();
        entry.updated_at = new Date();
        entry.synced = false; // Entrada não sincronizada inicialmente
      });

      console.log('EntryService: Entrada criada com sucesso:', entry.id);
      return entry;
    });
  }

  /**
   * Busca todas as entradas.
   * @returns {Promise<Entry[]>} Lista de entradas.
   */
  static async getAllEntries() {
    const entriesCollection = database.get('entries');
    const entries = await entriesCollection.query().fetch();
    
    return entries.map(entry => ({
      id: entry.id,
      product_code: entry.product_code,
      product_name: entry.product_name,
      quantity: entry.quantity,
      reason_id: entry.reason_id,
      unit_cost: entry.unit_cost,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      synced: entry.synced,
    }));
  }

  /**
   * Busca entradas não sincronizadas.
   * @returns {Promise<Entry[]>} Lista de entradas não sincronizadas.
   */
  static async getUnsyncedEntries() {
    const entriesCollection = database.get('entries');
    const entries = await entriesCollection.query().fetch();
    const unsyncedEntries = entries.filter(entry => !entry.synced);
    
    return unsyncedEntries.map(entry => ({
      id: entry.id,
      product_code: entry.product_code,
      product_name: entry.product_name,
      quantity: entry.quantity,
      reason_id: entry.reason_id,
      unit_cost: entry.unit_cost,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      synced: entry.synced,
    }));
  }

  /**
   * Marca uma entrada como sincronizada.
   * @param {string} entryId - ID da entrada.
   * @returns {Promise<Entry>} Entrada atualizada.
   */
  static async markAsSynced(entryId) {
    return await database.write(async () => {
      const entriesCollection = database.get('entries');
      const entry = await entriesCollection.find(entryId);
      
      return await entry.update(entry => {
        entry.synced = true;
        entry.updated_at = new Date();
      });
    });
  }

  /**
   * Remove uma entrada.
   * @param {string} entryId - ID da entrada.
   * @returns {Promise<void>}
   */
  static async deleteEntry(entryId) {
    return await database.write(async () => {
      const entriesCollection = database.get('entries');
      const entry = await entriesCollection.find(entryId);
      await entry.destroyPermanently();
    });
  }

  /**
   * Busca uma entrada pelo ID.
   * @param {string} entryId - ID da entrada.
   * @returns {Promise<Entry|null>} Entrada encontrada ou null.
   */
  static async getEntryById(entryId) {
    try {
      const entriesCollection = database.get('entries');
      const entry = await entriesCollection.find(entryId);
      
      return {
        id: entry.id,
        product_code: entry.product_code,
        product_name: entry.product_name,
        quantity: entry.quantity,
        reason_id: entry.reason_id,
        unit_cost: entry.unit_cost,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        synced: entry.synced,
      };
    } catch (error) {
      console.error('EntryService: Erro ao buscar entrada por ID:', error);
      return null;
    }
  }
}
