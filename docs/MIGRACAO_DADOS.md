# Plano de Migração de Dados - Motivos e Produtos

## 1. Análise da Situação Atual

### 1.1. Componentes e Suas Fontes de Dados

- **HomeScreen**: ✅ Já utiliza `expoDbManager.fetchData('reasons')`
- **MotiveDropdown**: ❌ Usa `dao.reasons.getAll()`
- **ProductService**: ✅ Já integrado com `expoDbManager`
- **EntryForm**: ✅ Recebe dados via props

### 1.2. Dados Iniciais
- Schema.js contém `INITIAL_REASONS` e `INITIAL_PRODUCTS`
- ExpoDbManager tem dados iniciais hardcoded

## 2. Problemas Identificados

1. Inconsistência nas fontes de dados:
   - HomeScreen usa expoDbManager
   - MotiveDropdown usa dao.reasons
   - Dados iniciais definidos em múltiplos lugares

2. Diferenças nos schemas:
   - Schema.js e expo-manager.js têm definições diferentes
   - Necessidade de unificação

## 3. Plano de Migração

### 3.1. Fase 1: Unificação dos Dados Iniciais

1. Modificar `expo-manager.js` para importar dados iniciais:
```javascript
import { INITIAL_REASONS, INITIAL_PRODUCTS } from './schema';
```

2. Atualizar método `insertInitialData()` para usar dados do schema:
```javascript
if (reasonsCount === 0) {
  for (const reason of INITIAL_REASONS) {
    await executeSqlSafe(db, 
      'INSERT INTO reasons (code, description) VALUES (?, ?)', 
      [reason.code, reason.description]
    );
  }
}
```

### 3.2. Fase 2: Migração do MotiveDropdown

1. Atualizar importações:
```javascript
import { expoDbManager } from '../../database/expo-manager';
```

2. Modificar função `loadReasons`:
```javascript
const loadReasons = async () => {
  try {
    setLoading(true);
    const data = await expoDbManager.getReasons();
    setReasons(data);
  } catch (error) {
    console.error('Erro ao carregar motivos:', error);
    setReasons([]);
  } finally {
    setLoading(false);
  }
};
```

### 3.3. Fase 3: Verificação de Consistência

1. Validar campos obrigatórios em todas as tabelas
2. Garantir que IDs e relações estejam preservados
3. Confirmar que todas as queries existentes continuam funcionando

### 3.4. Fase 4: Limpeza

1. Remover referências ao dao.reasons
2. Remover dados mock duplicados
3. Atualizar documentação

## 4. Testes

### 4.1. Testes Unitários
- Verificar funcionamento do MotiveDropdown com nova fonte
- Validar inserção de dados iniciais
- Testar queries de busca

### 4.2. Testes de Integração
- Testar fluxo completo de entrada de dados
- Verificar carregamento de motivos em todos os componentes
- Validar busca de produtos

### 4.3. Testes de Regressão
- Garantir que funcionalidades existentes não foram afetadas
- Verificar performance das consultas
- Testar comportamento offline

## 5. Rollback

### 5.1. Plano de Reversão
1. Manter código antigo comentado por uma versão
2. Criar backup do banco antes da migração
3. Documentar todas as alterações para reversão manual se necessário

## 6. Monitoramento

1. Adicionar logs estratégicos:
   - Tempo de carregamento dos motivos
   - Sucesso/falha nas operações de banco
   - Uso de cache vs consultas diretas

2. Métricas a monitorar:
   - Tempo de resposta das consultas
   - Taxa de sucesso das operações
   - Uso de memória e cache

## 7. Próximos Passos

1. Implementar as mudanças seguindo as fases definidas
2. Executar testes em ambiente de desenvolvimento
3. Validar com equipe de QA
4. Planejar deploy em produção