/**
 * Fallback Database Interface
 * Interface de backup para quando o SQLite não estiver disponível
 */

class FallbackDatabase {
  constructor() {
    this.products = new Map([
      ['123456', {
        id: 1,
        product_code: '123456',
        product_name: 'Produto Teste',
        package_type: 'Unidade',
        regular_price: 10.50,
      }]
    ]);
    
    this.entries = [];
    this.reasons = [
      { id: 1, reason_name: 'Vencimento' },
      { id: 2, reason_name: 'Avaria' },
      { id: 3, reason_name: 'Roubo' },
      { id: 4, reason_name: 'Perda operacional' },
      { id: 5, reason_name: 'Quebra' },
      { id: 6, reason_name: 'Devolução' },
      { id: 7, reason_name: 'Outros' },
    ];
  }

  async initialize() {
    console.log('Fallback database initialized');
  }

  async getProduct(productCode) {
    return this.products.get(productCode) || null;
  }

  async searchProducts(searchTerm) {
    const results = [];
    for (const product of this.products.values()) {
      if (product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.product_code.includes(searchTerm)) {
        results.push(product);
      }
    }
    return results.slice(0, 10);
  }

  async saveEntry(entryData) {
    const entry = {
      id: this.entries.length + 1,
      ...entryData,
      created_at: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry.id;
  }

  async getReasons() {
    return this.reasons;
  }
}

export const fallbackDb = new FallbackDatabase();
export default fallbackDb;