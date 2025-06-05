// src/services/EntryService.js
import { database } from '../database';
import Entry from '../database/model/Entry';
import Product from '../database/model/Product';
import Reason from '../database/model/Reason.js';

export class EntryService {
  /**
   * Cria uma nova entrada no inventário.
   * @param {string} productCode - Código de barras do produto.
   * @param {string} reasonId - ID do WatermelonDB da Reason.
   * @param {Object} quantityData - Dados da quantidade.
   * @param {string} quantityData.value - Valor da quantidade.
   * @param {string} quantityData.unit - Tipo de unidade escolhido (KG ou UN).
   * @returns {Promise<Entry>} Entrada criada.
   */
  static async createEntry(productCode, reasonId, quantityData) {
    return await database.write(async () => {
      // Buscar o produto pelo código
      const productsCollection = database.get('products');
      const products = await productsCollection.query().fetch();
      const product = products.find(p => p.productCode === productCode);
      
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
        // Definir campos básicos
        entry.productCodeValue = productCode;
        entry.productName = product.productName;
        entry.quantity = parseFloat(quantityData.value);
        entry.chosen_unit_type = quantityData.unit;
        entry.reasonCodeValue = reason.code;
        entry.entryDate = new Date();
        entry.isSynchronized = false;

        // Configurar relações
        entry.product.set(product);
        entry.reason.set(reason);
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
      product_code: entry.productCodeValue,
      product_name: entry.productName,
      quantity: entry.quantity,
      chosen_unit_type: entry.chosen_unit_type,
      reason_id: entry.linkedReasonId,
      reason_code: entry.reasonCodeValue,
      entry_date: entry.entryDate,
      is_synchronized: entry.isSynchronized
    }));
  }

  /**
   * Busca entradas não sincronizadas.
   * @returns {Promise<Entry[]>} Lista de entradas não sincronizadas.
   */
  static async getUnsyncedEntries() {
    const entriesCollection = database.get('entries');
    const entries = await entriesCollection.query().fetch();
    const unsyncedEntries = entries.filter(entry => !entry.isSynchronized);
    
    // Buscar produtos relacionados para obter o tipo de unidade
    const productsCollection = database.get('products');
    const products = await productsCollection.query().fetch();
    const productsMap = new Map(products.map(p => [p.productCode, p]));
    
    return unsyncedEntries.map(entry => ({
      id: entry.id,
      product_code: entry.productCodeValue,
      product_name: entry.productName,
      quantity: entry.quantity,
      chosen_unit_type: entry.chosen_unit_type,
      reason_id: entry.reason.id,
      reason_code: entry.reasonCodeValue,
      entry_date: entry.entryDate,
      is_synchronized: entry.isSynchronized,
      unit_type: productsMap.get(entry.productCodeValue)?.unitType || 'UN'
    }));
  }

  /**
   * Busca entradas não sincronizadas por motivo.
   * @param {string} reasonId - ID do motivo.
   * @returns {Promise<Entry[]>} Lista de entradas não sincronizadas do motivo.
   */
  static async getUnsyncedEntriesByReason(reasonId) {
    const entriesCollection = database.get('entries');
    const entries = await entriesCollection.query().fetch();
    const filteredEntries = entries.filter(entry =>
      !entry.isSynchronized && entry.reason.id === reasonId
    );
    
    // Buscar produtos relacionados para obter o tipo de unidade
    const productsCollection = database.get('products');
    const products = await productsCollection.query().fetch();
    const productsMap = new Map(products.map(p => [p.productCode, p]));
    
    return filteredEntries.map(entry => ({
      id: entry.id,
      product_code: entry.productCodeValue,
      product_name: entry.productName,
      quantity: entry.quantity,
      chosen_unit_type: entry.chosen_unit_type,
      reason_id: entry.reason.id,
      reason_code: entry.reasonCodeValue,
      entry_date: entry.entryDate,
      is_synchronized: entry.isSynchronized,
      unit_type: productsMap.get(entry.productCodeValue)?.unitType || 'UN'
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
        entry.isSynchronized = true;
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
        product_code: entry.productCodeValue,
        product_name: entry.productName,
        quantity: entry.quantity,
        chosen_unit_type: entry.chosen_unit_type,
        reason_id: entry.reason.id,
        reason_code: entry.reasonCodeValue,
        entry_date: entry.entryDate,
        is_synchronized: entry.isSynchronized
      };
    } catch (error) {
      console.error('EntryService: Erro ao buscar entrada por ID:', error);
      return null;
    }
  }
}
