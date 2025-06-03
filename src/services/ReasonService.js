// src/services/ReasonService.js
import { database } from '../database'; // Assume que src/database/index.js exporta 'database'
import Reason from '../database/model/Reason.js'; // Importa o modelo Reason

export class ReasonService {
  /**
   * Busca todos os motivos.
   * @returns {Promise<Reason[]>} Lista de motivos.
   */
  static async getAllReasons() {
    const reasonsCollection = database.get('reasons'); // Usa o nome da tabela como string
    const reasons = await reasonsCollection.query().fetch();
    // O objeto Reason do WatermelonDB já terá as propriedades como code, description, etc.
    // Se o Dropdown espera um formato específico, mapeie aqui se necessário.
    // Por exemplo, se o dropdown espera { id: 'wm_id_string', code: '01', description: 'Produto Vencido' }
    return reasons.map(reason => ({
        id: reason.id, // ID do WatermelonDB
        code: reason.code,
        description: reason.description,
        // Adicione outros campos do modelo Reason se necessário para o dropdown
    }));
  }

  /**
   * Busca um motivo pelo código.
   * @param {string} code - Código do motivo (ex: '01', '02').
   * @returns {Promise<Reason|null>} Motivo encontrado ou null.
   */
  static async getReasonByCode(code) {
    const reasonsCollection = database.get('reasons');
    const reasons = await reasonsCollection.query().fetch();
    const reason = reasons.find(r => r.code === code);
    
    if (!reason) {
      return null;
    }
    
    return {
      id: reason.id,
      code: reason.code,
      description: reason.description,
    };
  }

  /**
   * Busca um motivo pelo ID do WatermelonDB.
   * @param {string} id - ID do WatermelonDB.
   * @returns {Promise<Reason|null>} Motivo encontrado ou null.
   */
  static async getReasonById(id) {
    try {
      const reasonsCollection = database.get('reasons');
      const reason = await reasonsCollection.find(id);
      
      return {
        id: reason.id,
        code: reason.code,
        description: reason.description,
      };
    } catch (error) {
      console.error('ReasonService: Erro ao buscar motivo por ID:', error);
      return null;
    }
  }
}
