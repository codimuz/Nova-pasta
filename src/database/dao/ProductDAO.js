import { dbManager } from '../index';

export class ProductDAO {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await dbManager.getDatabase();
    }
    return this.db;
  }

  // Buscar produto por código
  async findByCode(productCode) {
    try {
      const db = await this.getDb();
      const product = await db.getFirstAsync(
        'SELECT * FROM products WHERE product_code = ? AND deleted_at IS NULL',
        [productCode]
      );
      return product;
    } catch (error) {
      console.error('Error finding product by code:', error);
      throw error;
    }
  }

  // Buscar produtos por nome (para autocomplete)
  async searchByName(searchTerm, limit = 10) {
    try {
      const db = await this.getDb();
      const products = await db.getAllAsync(
        `SELECT * FROM products 
         WHERE product_name LIKE ? AND deleted_at IS NULL 
         ORDER BY product_name 
         LIMIT ?`,
        [`%${searchTerm}%`, limit]
      );
      return products;
    } catch (error) {
      console.error('Error searching products by name:', error);
      throw error;
    }
  }

  // Inserir novo produto
  async insert(product) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `INSERT INTO products 
         (product_code, product_name, regular_price, club_price, unit_type, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.product_code,
          product.product_name,
          product.regular_price,
          product.club_price,
          product.unit_type,
          now,
          now
        ]
      );
      
      console.log('Product inserted with ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error inserting product:', error);
      throw error;
    }
  }

  // Atualizar produto existente
  async update(productCode, updates) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `UPDATE products 
         SET product_name = ?, regular_price = ?, club_price = ?, unit_type = ?, updated_at = ?
         WHERE product_code = ? AND deleted_at IS NULL`,
        [
          updates.product_name,
          updates.regular_price,
          updates.club_price,
          updates.unit_type,
          now,
          productCode
        ]
      );
      
      console.log('Product updated, rows affected:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Inserir ou atualizar produto (upsert)
  async upsert(product) {
    try {
      const existing = await this.findByCode(product.product_code);
      
      if (existing) {
        return await this.update(product.product_code, product);
      } else {
        return await this.insert(product);
      }
    } catch (error) {
      console.error('Error upserting product:', error);
      throw error;
    }
  }

  // Soft delete (marcação como deletado)
  async softDelete(productCode) {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        'UPDATE products SET deleted_at = ?, updated_at = ? WHERE product_code = ?',
        [now, now, productCode]
      );
      
      console.log('Product soft deleted, rows affected:', result.changes);
      return result.changes > 0;
    } catch (error) {
      console.error('Error soft deleting product:', error);
      throw error;
    }
  }

  // Listar todos os produtos ativos
  async findAll(limit = 100, offset = 0) {
    try {
      const db = await this.getDb();
      const products = await db.getAllAsync(
        `SELECT * FROM products 
         WHERE deleted_at IS NULL 
         ORDER BY product_name 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return products;
    } catch (error) {
      console.error('Error finding all products:', error);
      throw error;
    }
  }

  // Contar total de produtos ativos
  async count() {
    try {
      const db = await this.getDb();
      const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL'
      );
      return result.count;
    } catch (error) {
      console.error('Error counting products:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productDAO = new ProductDAO();
export default productDAO;