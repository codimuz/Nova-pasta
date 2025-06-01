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
        unit_type: 'UN',
        price: 10.50,
        club_price: 9.50,
      }]
    ]);
    
    this.entries = [];
    this.reasons = [
      { id: '1', code: '01', description: 'Produto Vencido' },
      { id: '2', code: '02', description: 'Produto Danificado' },
      { id: '3', code: '03', description: 'Degustação no Depósito' },
      { id: '4', code: '04', description: 'Degustação na Loja' },
      { id: '5', code: '05', description: 'Furto Interno' },
      { id: '6', code: '06', description: 'Furto na Área de Vendas' },
      { id: '7', code: '07', description: 'Alimento Produzido para o Refeitório' },
      { id: '8', code: '08', description: 'Furto Não Recuperado' }
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
    const now = new Date().toISOString();
    const entry = {
      id: this.entries.length + 1,
      ...entryData,
      entry_date: now,
      created_at: now,
      is_synchronized: 0
    };
    this.entries.push(entry);
    return entry.id;
  }

  async getUnsynchronizedEntries(reasonId) {
    console.log('FALLBACK: Buscando entradas não sincronizadas para motivo', reasonId);
    return this.entries.filter(entry =>
      entry.reason_id === reasonId &&
      (!entry.is_synchronized || entry.is_synchronized === 0)
    );
  }

  async getReasons() {
    return this.reasons;
  }
}

export const fallbackDb = new FallbackDatabase();
export default fallbackDb;