# Sistema de Exportação de Dados - Inventário

## Visão Geral

O sistema de exportação permite exportar dados de inventário não sincronizados para arquivos de texto (.txt) organizados por motivo, seguindo o formato padrão "Inventario [código] [quantidade]".

## Funcionalidades Implementadas

### 1. Estrutura de Arquivos Gerada

```
Documentos/
└── inventario/
    └── motivos/
        ├── motivo01/
        │   ├── motivo01_20250527.txt
        │   └── motivo01_20250528.txt
        ├── motivo02/
        │   └── motivo02_20250527.txt
        └── motivo03/
            └── motivo03_20250527.txt
```

### 2. Formato dos Arquivos

Cada arquivo contém linhas no formato:
```
Inventario 78901234567890 5
Inventario 78901234567891 2
Inventario INEXISTENTE001 10
```

### 3. Nomenclatura

- **Diretórios**: `motivoXX` (onde XX é o código do motivo com padding de 2 dígitos)
- **Arquivos**: `motivoXX_YYYYMMDD.txt` (onde YYYYMMDD é a data de exportação)

## Componentes do Sistema

### 1. ExportService (`src/services/ExportService.js`)

Serviço principal responsável pela exportação:

#### Métodos Principais:

- `exportData()`: Realiza exportação completa de todos os motivos
- `createBaseDirectories()`: Cria estrutura de diretórios
- `exportReasonData(reason)`: Exporta dados de um motivo específico
- `generateFileName(reasonCode)`: Gera nome do arquivo com data
- `generateFileContent(entries)`: Gera conteúdo no formato correto
- `checkExistingStructure()`: Verifica estrutura de diretórios existente
- `listExportedFiles()`: Lista arquivos já exportados

#### Características:

- **Tratamento de Erros**: Cada motivo é processado independentemente
- **Feedback Detalhado**: Exibe resultados da exportação via Alert
- **Transações Seguras**: Marca como sincronizado apenas após sucesso na gravação
- **Estrutura Automática**: Cria diretórios automaticamente se não existirem

### 2. ExpoDbManager - Extensões (`src/database/expo-manager.js`)

Métodos adicionados para suportar exportação:

- `getUnsynchronizedEntriesByReason(reasonId)`: Busca entradas não sincronizadas por motivo
- `markEntriesAsSynchronized(entryIds)`: Marca entradas como sincronizadas
- `migrateExistingEntries()`: Migração para adicionar campo `is_synchronized`

### 3. HomeScreen - Integração (`src/screens/HomeScreen.js`)

- Botão "Exportar" integrado à interface
- Confirmação antes da exportação
- Tratamento de erros na interface

## Fluxo de Exportação

### 1. Início da Exportação

```javascript
await exportService.exportData();
```

### 2. Processo Detalhado

1. **Migração**: Verifica/adiciona campo `is_synchronized` em registros existentes
2. **Busca de Motivos**: Carrega todos os motivos cadastrados no sistema
3. **Criação de Estrutura**: Cria diretórios base (`inventario/motivos/`)
4. **Processamento por Motivo**:
   - Busca entradas não sincronizadas para o motivo
   - Se encontradas, cria diretório específico do motivo
   - Gera arquivo com nome baseado na data atual
   - Grava conteúdo no formato especificado
   - Marca entradas como sincronizadas após sucesso
5. **Relatório Final**: Exibe resultado da exportação

### 3. Tratamento de Erros

- Falhas individuais não interrompem o processo completo
- Logs detalhados para debug
- Relatório final inclui sucessos e falhas
- Rollback automático em caso de erro na gravação

## Uso no Aplicativo

### Interface do Usuário

1. **Botão Exportar**: Localizado na tela principal (HomeScreen)
2. **Confirmação**: Dialog pergunta se deseja exportar dados não sincronizados
3. **Feedback**: Alert detalhado com resultados da exportação

### Dados Exportados

- **Apenas não sincronizados**: Exporta somente entradas com `is_synchronized = 0` ou `NULL`
- **Organização por motivo**: Cada motivo gera arquivo separado
- **Uma exportação por dia**: Arquivos são nomeados por data
- **Sincronização automática**: Dados são marcados como sincronizados após exportação

## Testes

### Arquivo de Teste (`src/tests/ExportTest.js`)

Funções disponíveis para teste:

```javascript
// Inserir dados de teste
await insertTestData();

// Testar exportação completa
await testExport();

// Verificar dados não sincronizados
await checkUnsynchronizedData();

// Teste completo (inserção + exportação + verificação)
await runCompleteTest();

// Limpar dados de teste
await cleanTestData();
```

### Como Executar Testes

```javascript
import { runCompleteTest } from '../tests/ExportTest';

// Em um componente ou no console
runCompleteTest().then(results => {
  console.log('Teste concluído:', results);
});
```

## Configurações

### Localização dos Arquivos

- **Base**: `FileSystem.documentDirectory + 'inventario/'`
- **Motivos**: `FileSystem.documentDirectory + 'inventario/motivos/'`
- **Específico**: `FileSystem.documentDirectory + 'inventario/motivos/motivoXX/'`

### Formato de Data

- **Padrão**: YYYYMMDD (ex: 20250527)
- **Timezone**: Local do dispositivo

### Limites

- **Nenhum limite** de entradas por arquivo
- **Nenhum limite** de arquivos por motivo
- **Sobrescrita**: Arquivos do mesmo motivo e data são sobrescritos

## Requisitos do Sistema

### Dependências

- `expo-file-system`: Para operações de arquivo
- `react-native Alert`: Para feedback ao usuário
- Database SQLite com campo `is_synchronized`

### Permissões

- Acesso ao sistema de arquivos do dispositivo
- Criação de diretórios
- Escrita de arquivos

## Estrutura de Dados

### Tabela entries (campos relacionados)

```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_code TEXT NOT NULL,
  product_name TEXT,
  reason_id INTEGER,
  quantity REAL NOT NULL,
  unit_cost REAL DEFAULT 0.0,
  total_cost REAL DEFAULT 0.0,
  notes TEXT,
  is_synchronized INTEGER DEFAULT 0,  -- Campo para controle de sincronização
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reason_id) REFERENCES reasons (id)
);
```

### Estados de Sincronização

- `0` ou `NULL`: Não sincronizado (será exportado)
- `1`: Sincronizado (não será exportado novamente)

## Exemplo de Uso Completo

```javascript
// 1. Na HomeScreen, usuário clica em "Exportar"
const handleExport = async () => {
  try {
    await exportService.exportData();
    // Feedback automático via Alert
  } catch (error) {
    console.error('Erro na exportação:', error);
  }
};

// 2. Verificar arquivos gerados
const files = await exportService.listExportedFiles();
console.log('Arquivos exportados:', files);

// 3. Verificar dados restantes não sincronizados
const reasons = await expoDbManager.getReasons();
for (const reason of reasons) {
  const unsync = await expoDbManager.getUnsynchronizedEntriesByReason(reason.id);
  console.log(`Motivo ${reason.code}: ${unsync.length} pendentes`);
}
```

## Observações Importantes

1. **Backup**: O sistema não faz backup automático dos dados antes da exportação
2. **Sincronização**: Uma vez marcado como sincronizado, o dado não é exportado novamente
3. **Data**: Múltiplas exportações no mesmo dia sobrescrevem o arquivo anterior
4. **Motivos Vazios**: Motivos sem entradas pendentes não geram arquivos
5. **Encoding**: Arquivos são salvos em UTF-8 para suporte a caracteres especiais

## Melhorias Futuras

- [ ] Exportação por período específico
- [ ] Escolha de formato de arquivo (CSV, JSON)
- [ ] Compressão de arquivos
- [ ] Upload automático para cloud
- [ ] Histórico de exportações
- [ ] Re-exportação de dados já sincronizados
- [ ] Exportação incremental
- [ ] Validação de integridade dos arquivos
