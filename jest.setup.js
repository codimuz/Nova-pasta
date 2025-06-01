// Mock simples e eficiente para expo-sqlite
const mockDb = {
  execSync: jest.fn(),
  getAllSync: jest.fn((sql) => {
    // Mock para busca de motivos
    if (sql.includes('FROM reasons')) {
      return sql.includes('WHERE id = \'1\'') ? 
        [{ id: '1', code: '01', description: 'Produto Vencido' }] : 
        [];
    }
    return [];
  }),
  runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
  closeSync: jest.fn()
};

const mockDbManager = {
  isConnected: true,
  db: mockDb,
  connect: jest.fn(() => mockDb),
  disconnect: jest.fn(),
  getDatabase: jest.fn(() => mockDb)
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb)
}));

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}));

// Definir variável de ambiente para aumentar memória
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Data fixa para testes
const FIXED_DATE = new Date('2025-01-06T03:00:00.000Z');
global.Date = class extends Date {
  constructor(...args) {
    if (args.length) {
      return super(...args);
    }
    return FIXED_DATE;
  }
};
global.Date.now = jest.fn(() => FIXED_DATE.getTime());

// Silenciar logs durante os testes
console.log = jest.fn();
console.info = jest.fn();
console.debug = jest.fn();
console.error = jest.fn();