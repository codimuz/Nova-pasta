import { expoDbManager } from '../expo-manager';
import { TABLES, INDEXES } from '../expo-manager';

const { describe, beforeEach, it, expect } = require('@jest/globals');

describe('ExpoSQLiteManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validação de Estrutura', () => {
    it('deve identificar problemas estruturais', () => {
      const badStructure = {
        tables: {
          ENTRIES: {
            exists: true,
            columns: ['id']
          }
        },
        indexes: {}
      };

      const validation = expoDbManager.validateDatabaseStructure(badStructure);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Normalização de Strings', () => {
    it('deve normalizar strings removendo acentos', () => {
      expect(expoDbManager.normalizeString('Pão')).toBe('pao');
      expect(expoDbManager.normalizeString('Café')).toBe('cafe');
    });
  });

  describe('Operações com Motivos', () => {
    it('deve buscar motivo por ID', async () => {
      const result = await expoDbManager.findReasonById('1');
      expect(result).toEqual({
        id: '1',
        code: '01',
        description: 'Produto Vencido'
      });
    });

    it('deve retornar null quando motivo não existe', async () => {
      const result = await expoDbManager.findReasonById('999');
      expect(result).toBeNull();
    });
  });
});