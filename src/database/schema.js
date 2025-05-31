export const TABLES = {
  PRODUCTS: `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL,
      regular_price REAL NOT NULL,
      club_price REAL NOT NULL,
      unit_type TEXT CHECK (unit_type IN ('KG', 'UN')) NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      restored_at TEXT
    )`,
  
  REASONS: `
    CREATE TABLE IF NOT EXISTS reasons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  
  ENTRIES: `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      reason_id TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      is_synchronized BOOLEAN DEFAULT 0,
      FOREIGN KEY (product_code) REFERENCES products (product_code),
      FOREIGN KEY (reason_id) REFERENCES reasons (id)
    )`,
  
  ENTRY_CHANGES: `
    CREATE TABLE IF NOT EXISTS entry_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      old_quantity REAL,
      new_quantity REAL NOT NULL,
      old_reason_id TEXT,
      new_reason_id TEXT NOT NULL,
      change_date TEXT NOT NULL,
      action_type TEXT NOT NULL CHECK (action_type IN ('insertion', 'edition', 'removal', 'movement')),
      FOREIGN KEY (old_reason_id) REFERENCES reasons (id),
      FOREIGN KEY (new_reason_id) REFERENCES reasons (id)
    )`,
  
  IMPORTS: `
    CREATE TABLE IF NOT EXISTS imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      import_date TEXT NOT NULL,
      items_updated INTEGER,
      items_inserted INTEGER,
      source TEXT
    )`
};

// Índices para melhor performance
export const INDEXES = {
  PRODUCTS_CODE: 'CREATE INDEX IF NOT EXISTS idx_products_code ON products (product_code)',
  PRODUCTS_NAME: 'CREATE INDEX IF NOT EXISTS idx_products_name ON products (product_name COLLATE NOCASE)',
  PRODUCTS_SEARCH: 'CREATE INDEX IF NOT EXISTS idx_products_search ON products (product_code, product_name)',
  ENTRIES_PRODUCT: 'CREATE INDEX IF NOT EXISTS idx_entries_product ON entries (product_code)',
  ENTRIES_DATE: 'CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (entry_date)',
  ENTRIES_REASON: 'CREATE INDEX IF NOT EXISTS idx_entries_reason ON entries (reason_id)',
  ENTRY_CHANGES_PRODUCT: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_product ON entry_changes (product_code)',
  ENTRY_CHANGES_DATE: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_date ON entry_changes (change_date)',
  IMPORTS_DATE: 'CREATE INDEX IF NOT EXISTS idx_imports_date ON imports (import_date)',
  REASONS_CODE: 'CREATE INDEX IF NOT EXISTS idx_reasons_code ON reasons (code)'
};

// Dados iniciais para a tabela reasons - conforme especificação do usuário
export const INITIAL_REASONS = [
  {
    id: "1",
    code: "01",
    description: "Produto Vencido",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "2",
    code: "02",
    description: "Produto Danificado",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "3",
    code: "03",
    description: "Degustação no Depósito",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "4",
    code: "04",
    description: "Degustação na Loja",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "5",
    code: "05",
    description: "Furto Interno",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "6",
    code: "06",
    description: "Furto na Área de Vendas",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "7",
    code: "07",
    description: "Alimento Produzido para o Refeitório",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "8",
    code: "08",
    description: "Furto Não Recuperado",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  }
];

// Dados iniciais para a tabela products - conforme especificação do usuário
export const INITIAL_PRODUCTS = [
  {
    product_code: "7891234567890",
    product_name: "Arroz 5kg",
    regular_price: 25.99,
    club_price: 22.99,
    unit_type: "UN",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    product_code: "7891234567891",
    product_name: "Feijão 1kg",
    regular_price: 8.50,
    club_price: 7.50,
    unit_type: "UN",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    product_code: "7891234567892",
    product_name: "Tomate",
    regular_price: 5.99,
    club_price: 4.99,
    unit_type: "KG",
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  }
];