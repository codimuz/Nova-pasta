import { dbManager } from '../index';

export class EntryDAO {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await dbManager.getDatabase();
    }
    return this.db;
  }

  // Buscar entrada por ID
  async findById(entryId) {
    try {
      const db = await this.getDb();
      const entry = await db.getFirstAsync(
        `SELECT e.*, p.product_name, r.reason_name
         FROM entries e
         LEFT JOIN products p ON e.product_code = p.product_code
         LEFT JOIN reasons r ON e.reason_id = r.reason_id
         WHERE e.entry_id = ?`,
        [entryId]
      );
      return entry;
    } catch (error) {
      console.error('Error finding entry by ID:', error);
      throw error;
    }
  }

  // Inserir nova entrada
  async insert(entry) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `INSERT INTO entries 
         (product_code, reason_id, quantity_lost, unit_cost, notes, entry_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.product_code,
          entry.reason_id,
          entry.quantity_lost,
          entry.unit_cost || null,
          entry.notes || null,
          entry.entry_date || now,
          now,
          now
        ]
      );
      
      console.log('Entry inserted with ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error inserting entry:', error);
      throw error;
    }
  }

  // Atualizar entrada
  async update(entryId, updates) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `UPDATE entries 
         SET product_code = ?, reason_id = ?, quantity_lost = ?, 
             unit_cost = ?, notes = ?, updated_at = ?
         WHERE entry_id = ?`,
        [
          updates.product_code,
          updates.reason_id,
          updates.quantity_lost,
          updates.unit_cost,
          updates.notes,
          now,
          entryId
        ]
      );
      
      console.log('Entry updated, rows affected:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  // Buscar entradas por produto
  async findByProduct(productCode, limit = 50) {
    try {
      const db = await this.getDb();
      const entries = await db.getAllAsync(
        `SELECT e.*, p.product_name, r.reason_name
         FROM entries e
         LEFT JOIN products p ON e.product_code = p.product_code
         LEFT JOIN reasons r ON e.reason_id = r.reason_id
         WHERE e.product_code = ?
         ORDER BY e.entry_date DESC
         LIMIT ?`,
        [productCode, limit]
      );
      return entries;
    } catch (error) {
      console.error('Error finding entries by product:', error);
      throw error;
    }
  }

  // Buscar entradas por motivo
  async findByReason(reasonId, limit = 50) {
    try {
      const db = await this.getDb();
      const entries = await db.getAllAsync(
        `SELECT e.*, p.product_name, r.reason_name
         FROM entries e
         LEFT JOIN products p ON e.product_code = p.product_code
         LEFT JOIN reasons r ON e.reason_id = r.reason_id
         WHERE e.reason_id = ?
         ORDER BY e.entry_date DESC
         LIMIT ?`,
        [reasonId, limit]
      );
      return entries;
    } catch (error) {
      console.error('Error finding entries by reason:', error);
      throw error;
    }
  }

  // Buscar entradas por período
  async getByDateRange(startDate, endDate, limit = 100) {
    try {
      const db = await this.getDb();
      const entries = await db.getAllAsync(
        `SELECT e.*, p.product_name, r.reason_name
         FROM entries e
         LEFT JOIN products p ON e.product_code = p.product_code
         LEFT JOIN reasons r ON e.reason_id = r.reason_id
         WHERE e.entry_date BETWEEN ? AND ?
         ORDER BY e.entry_date DESC
         LIMIT ?`,
        [startDate, endDate, limit]
      );
      return entries;
    } catch (error) {
      console.error('Error finding entries by date range:', error);
      throw error;
    }
  }

  // Listar todas as entradas
  async getAll(limit = 100, offset = 0) {
    try {
      const db = await this.getDb();
      const entries = await db.getAllAsync(
        `SELECT e.*, p.product_name, r.reason_name
         FROM entries e
         LEFT JOIN products p ON e.product_code = p.product_code
         LEFT JOIN reasons r ON e.reason_id = r.reason_id
         ORDER BY e.entry_date DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return entries;
    } catch (error) {
      console.error('Error finding all entries:', error);
      throw error;
    }
  }

  // Contar total de entradas
  async count() {
    try {
      const db = await this.getDb();
      const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM entries'
      );
      return result.count;
    } catch (error) {
      console.error('Error counting entries:', error);
      throw error;
    }
  }

  // Contar entradas por período
  async countByDateRange(startDate, endDate) {
    try {
      const db = await this.getDb();
      const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM entries WHERE entry_date BETWEEN ? AND ?',
        [startDate, endDate]
      );
      return result.count;
    } catch (error) {
      console.error('Error counting entries by date range:', error);
      throw error;
    }
  }

  // Calcular valor total das perdas
  async getTotalLossValue(startDate = null, endDate = null) {
    try {
      const db = await this.getDb();
      let query = `
        SELECT 
          SUM(quantity_lost * COALESCE(unit_cost, 0)) as total_value,
          SUM(quantity_lost) as total_quantity,
          COUNT(*) as total_entries
        FROM entries
      `;
      const params = [];
      
      if (startDate && endDate) {
        query += ' WHERE entry_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const result = await db.getFirstAsync(query, params);
      return {
        totalValue: result.total_value || 0,
        totalQuantity: result.total_quantity || 0,
        totalEntries: result.total_entries || 0,
      };
    } catch (error) {
      console.error('Error calculating total loss value:', error);
      throw error;
    }
  }

  // Relatório de perdas por motivo
  async getLossByReason(startDate = null, endDate = null) {
    try {
      const db = await this.getDb();
      let query = `
        SELECT 
          r.reason_name,
          COUNT(e.entry_id) as entry_count,
          SUM(e.quantity_lost) as total_quantity,
          SUM(e.quantity_lost * COALESCE(e.unit_cost, 0)) as total_value
        FROM entries e
        JOIN reasons r ON e.reason_id = r.reason_id
      `;
      const params = [];
      
      if (startDate && endDate) {
        query += ' WHERE e.entry_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      query += ' GROUP BY r.reason_id, r.reason_name ORDER BY total_value DESC';
      
      const results = await db.getAllAsync(query, params);
      return results;
    } catch (error) {
      console.error('Error getting loss by reason:', error);
      throw error;
    }
  }

  // Deletar entrada (soft delete)
  async delete(entryId) {
    try {
      const db = await this.getDb();
      const result = await db.runAsync(
        'DELETE FROM entries WHERE entry_id = ?',
        [entryId]
      );
      
      console.log('Entry deleted, rows affected:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const entryDAO = new EntryDAO();
export default entryDAO;