import { dbManager } from '../index';

export class ReasonDAO {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await dbManager.getDatabase();
    }
    return this.db;
  }

  // Buscar motivo por ID
  async findById(reasonId) {
    try {
      const db = await this.getDb();
      const reason = await db.getFirstAsync(
        'SELECT * FROM reasons WHERE reason_id = ?',
        [reasonId]
      );
      return reason;
    } catch (error) {
      console.error('Error finding reason by ID:', error);
      throw error;
    }
  }

  // Buscar motivo por nome
  async findByName(reasonName) {
    try {
      const db = await this.getDb();
      const reason = await db.getFirstAsync(
        'SELECT * FROM reasons WHERE reason_name = ?',
        [reasonName]
      );
      return reason;
    } catch (error) {
      console.error('Error finding reason by name:', error);
      throw error;
    }
  }

  // Listar todos os motivos ativos
  async getAll() {
    try {
      const db = await this.getDb();
      const reasons = await db.getAllAsync(
        'SELECT * FROM reasons WHERE is_active = 1 ORDER BY reason_name'
      );
      return reasons;
    } catch (error) {
      console.error('Error getting all reasons:', error);
      throw error;
    }
  }

  // Inserir novo motivo
  async insert(reason) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `INSERT INTO reasons 
         (reason_name, description, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          reason.reason_name,
          reason.description || null,
          reason.is_active !== undefined ? reason.is_active : 1,
          now,
          now
        ]
      );
      
      console.log('Reason inserted with ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error inserting reason:', error);
      throw error;
    }
  }

  // Atualizar motivo
  async update(reasonId, updates) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `UPDATE reasons 
         SET reason_name = ?, description = ?, is_active = ?, updated_at = ?
         WHERE reason_id = ?`,
        [
          updates.reason_name,
          updates.description,
          updates.is_active,
          now,
          reasonId
        ]
      );
      
      console.log('Reason updated, rows affected:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating reason:', error);
      throw error;
    }
  }

  // Desativar motivo
  async deactivate(reasonId) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        'UPDATE reasons SET is_active = 0, updated_at = ? WHERE reason_id = ?',
        [now, reasonId]
      );
      
      console.log('Reason deactivated, rows affected:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deactivating reason:', error);
      throw error;
    }
  }

  // Contar motivos ativos
  async count() {
    try {
      const db = await this.getDb();
      const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM reasons WHERE is_active = 1'
      );
      return result.count;
    } catch (error) {
      console.error('Error counting reasons:', error);
      throw error;
    }
  }

  // Buscar motivos mais usados
  async getMostUsed(limit = 5) {
    try {
      const db = await this.getDb();
      const reasons = await db.getAllAsync(
        `SELECT r.*, COUNT(e.entry_id) as usage_count
         FROM reasons r
         LEFT JOIN entries e ON r.reason_id = e.reason_id
         WHERE r.is_active = 1
         GROUP BY r.reason_id
         ORDER BY usage_count DESC, r.reason_name
         LIMIT ?`,
        [limit]
      );
      return reasons;
    } catch (error) {
      console.error('Error getting most used reasons:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reasonDAO = new ReasonDAO();
export default reasonDAO;