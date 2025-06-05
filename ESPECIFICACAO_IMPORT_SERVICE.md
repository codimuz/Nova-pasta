# Especificação Técnica - ImportService.js

## Objetivo
Criar um serviço dedicado para operações de importação de dados, seguindo a mesma estrutura e padrões arquiteturais do [`ExportService.js`](src/services/ExportService.js:1) existente, extraindo e melhorando a lógica atual presente no [`ProductService.js`](src/services/ProductService.js:434).

## Análise da Lógica Atual

### Localização Atual
- **Arquivo**: `src/services/ProductService.js`
- **Função**: [`importProductsFromTxt()`](src/services/ProductService.js:434) (linhas 434-631)
- **Funcionalidades**: Importação de produtos via seleção de arquivo .txt

### Estrutura do Arquivo PRODUTO.TXT
- **Formato**: 40 caracteres por linha
- **Posições 0-12**: `product_code` (13 dígitos numéricos)
- **Posições 13-32**: `product_name` (20 caracteres, com trim)
- **Posições 33-39**: `regular_price` (7 caracteres, decimal)
- **Lógica `unit_type`**: Detectada via [`determineUnitType()`](src/services/ProductService.js:33)

## Estrutura do ImportService.js

### Imports e Dependências
```javascript
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import appConfig from '../../app.json';
```

### Classe Principal
```javascript
/**
 * Serviço de Importação de Dados
 * Responsável por importar dados de produtos e outras entidades a partir de arquivos
 * Segue os mesmos padrões arquiteturais do ExportService
 */
class ImportService {
  constructor() {
    this.supportedFormats = ['text/plain', 'text/txt'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
  }
```

## Métodos Principais

### 1. Detecção do Nome da Aplicação
```javascript
/**
 * Obtém o nome da aplicação do app.json (mesmo padrão do ExportService)
 * @returns {string} - Nome da aplicação
 */
getAppName() {
  return appConfig.expo?.name || 'app';
}
```

### 2. Validação de Arquivo
```javascript
/**
 * Valida se o arquivo selecionado está no formato correto
 * @param {Object} asset - Asset do arquivo selecionado
 * @returns {Object} - {valid: boolean, error?: string}
 */
validateSelectedFile(asset) {
  if (!asset.uri) {
    return { valid: false, error: 'URI do arquivo não encontrado.' };
  }

  if (!this.supportedFormats.includes(asset.mimeType) && 
      !asset.name.toLowerCase().endsWith('.txt')) {
    return { valid: false, error: 'Formato de arquivo não suportado. Use apenas arquivos .txt' };
  }

  if (asset.size && asset.size > this.maxFileSize) {
    return { valid: false, error: `Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB` };
  }

  return { valid: true };
}
```

### 3. Seleção de Arquivo
```javascript
/**
 * Permite ao usuário selecionar arquivo para importação
 * @returns {Promise<Object|null>} - Asset do arquivo ou null se cancelado
 */
async selectImportFile() {
  try {
    console.log('IMPORT_SERVICE: Iniciando seleção de arquivo para importação...');
    
    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
      copyToCacheDirectory: true,
      multiple: false,
    });

    // Verificar se a seleção foi cancelada
    if (pickerResult.canceled === true || !pickerResult.assets || pickerResult.assets.length === 0) {
      console.log('IMPORT_SERVICE: Seleção de arquivo cancelada');
      return null;
    }

    const asset = pickerResult.assets[0];
    const validation = this.validateSelectedFile(asset);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    console.log(`IMPORT_SERVICE: Arquivo selecionado: ${asset.name || 'arquivo.txt'}`);
    return asset;
    
  } catch (error) {
    console.error('IMPORT_SERVICE: Erro na seleção de arquivo:', error);
    throw new Error(`Falha na seleção do arquivo: ${error.message}`);
  }
}
```

### 4. Determinação do Tipo de Unidade
```javascript
/**
 * Determina o tipo de unidade baseado no nome do produto
 * Se o nome contiver "KG" (case-insensitive), retorna "KG", caso contrário retorna "UN"
 * (Extraído e melhorado da lógica do ProductService)
 * @param {string} productName - Nome do produto
 * @returns {string} - "KG" ou "UN"
 */
determineUnitType(productName) {
  if (!productName) return 'UN';
  
  // Fazer busca case-insensitive por "KG" em qualquer posição
  const upperName = productName.toUpperCase().trim();
  
  // Verificar se contém "KG" como palavra isolada ou parte de palavra
  const containsKG = upperName.includes('KG');
  
  console.log(`IMPORT_SERVICE: Produto "${productName}" -> unit_type: ${containsKG ? 'KG' : 'UN'}`);
  return containsKG ? 'KG' : 'UN';
}
```

### 5. Formatação do Código do Produto
```javascript
/**
 * Formata o código do produto para ter exatamente 13 caracteres
 * @param {string} code - Código do produto
 * @returns {string} - Código formatado com zeros à esquerda
 */
formatProductCode(code) {
  if (!code) return null;
  return String(code).padStart(13, '0');
}
```

### 6. Leitura e Processamento do Arquivo
```javascript
/**
 * Lê e processa o conteúdo do arquivo de produtos
 * @param {Object} asset - Asset do arquivo selecionado
 * @returns {Promise<Object>} - Estatísticas da importação
 */
async processProductFile(asset) {
  const stats = {
    inserted: 0,
    updated: 0,
    errors: [], // Array de {lineNumber, lineContent, error}
    fileName: asset.name || 'arquivo.txt'
  };
  const processedProductCodesInFile = new Set(); // Para evitar duplicatas do arquivo

  try {
    // Leitura do conteúdo do arquivo
    const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const lines = fileContent.split(/\r\n|\n|\r/); // Lida com diferentes quebras de linha
    console.log(`IMPORT_SERVICE: Arquivo lido com ${lines.length} linhas`);

    const productsCollection = database.get('products');

    // Processamento das linhas dentro de uma transação do WatermelonDB
    await database.write(async () => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Pular linhas vazias
        if (!line.trim()) {
          continue;
        }

        try {
          const processResult = await this.processProductLine(
            line, 
            lineNumber, 
            processedProductCodesInFile, 
            productsCollection
          );
          
          if (processResult.success) {
            if (processResult.action === 'inserted') {
              stats.inserted++;
            } else if (processResult.action === 'updated') {
              stats.updated++;
            }
          } else {
            stats.errors.push({
              lineNumber,
              lineContent: line,
              error: processResult.error
            });
          }

        } catch (lineError) {
          console.error(`IMPORT_SERVICE: Erro ao processar linha ${lineNumber}:`, lineError);
          stats.errors.push({
            lineNumber,
            lineContent: line,
            error: `Erro interno ao processar linha: ${lineError.message}`
          });
        }
      }
    });

    return stats;

  } catch (error) {
    console.error('IMPORT_SERVICE: Erro durante processamento do arquivo:', error);
    stats.errors.push({
      lineNumber: 0,
      lineContent: '',
      error: `Erro geral no processamento: ${error.message}`
    });
    return stats;
  }
}
```

### 7. Processamento de Linha Individual
```javascript
/**
 * Processa uma linha individual do arquivo de produtos
 * @param {string} line - Linha do arquivo
 * @param {number} lineNumber - Número da linha
 * @param {Set} processedCodes - Set de códigos já processados
 * @param {Object} productsCollection - Coleção de produtos do WatermelonDB
 * @returns {Promise<Object>} - Resultado do processamento
 */
async processProductLine(line, lineNumber, processedCodes, productsCollection) {
  // Validação de comprimento da linha
  if (line.length !== 40) {
    return {
      success: false,
      error: `Linha não tem 40 caracteres (possui ${line.length}).`
    };
  }

  // Extração de campos
  const productCodeStr = line.substring(0, 13);
  let productNameStr = line.substring(13, 33).trim();

  // Sanitização do nome do produto - remover sufixo "000"
  if (productNameStr.endsWith('000')) {
    productNameStr = productNameStr.substring(0, productNameStr.length - 3).trim();
  }
  const regularPriceStr = line.substring(33, 40); // 7 caracteres

  // Validações de conteúdo
  // Validar código do produto (13 dígitos numéricos)
  if (!/^\d{13}$/.test(productCodeStr)) {
    return {
      success: false,
      error: `Código de produto inválido: '${productCodeStr}'. Deve ter 13 dígitos numéricos.`
    };
  }

  // Validar nome do produto (não pode ser vazio após trim)
  if (!productNameStr) {
    return {
      success: false,
      error: 'Nome do produto não pode ser vazio.'
    };
  }

  // Validar preço regular (converter para decimal, suportando vírgula)
  const regularPriceNum = parseFloat(regularPriceStr.replace(',', '.'));
  if (isNaN(regularPriceNum) || regularPriceNum <= 0) {
    return {
      success: false,
      error: `Preço regular inválido ou não positivo: '${regularPriceStr}'.`
    };
  }

  // Verificar duplicatas dentro do mesmo arquivo
  if (processedCodes.has(productCodeStr)) {
    return {
      success: false,
      error: `Código de produto duplicado neste arquivo: '${productCodeStr}'.`
    };
  }
  processedCodes.add(productCodeStr);

  // Determinar tipo de unidade baseado no nome
  const unitType = this.determineUnitType(productNameStr);

  // Verificar se produto já existe no banco
  const existingProducts = await productsCollection
    .query(
      Q.where('product_code', this.formatProductCode(productCodeStr)),
      Q.where('deleted_at', null) // Apenas produtos não excluídos
    )
    .fetch();

  if (existingProducts.length > 0) {
    // Produto existe - fazer UPDATE
    const productToUpdate = existingProducts[0];
    await productToUpdate.update(product => {
      product.productName = productNameStr;
      product.regularPrice = regularPriceNum;
      product.unitType = unitType;
      // updatedAt será gerenciado automaticamente pelo WatermelonDB
    });
    
    console.log(`IMPORT_SERVICE: Produto atualizado - ${productCodeStr}: ${productNameStr} (${unitType})`);
    return { success: true, action: 'updated' };
  } else {
    // Produto não existe - fazer CREATE
    await productsCollection.create(product => {
      product.productCode = productCodeStr;
      product.productName = productNameStr;
      product.regularPrice = regularPriceNum;
      product.clubPrice = 0; // Valor padrão
      product.unitType = unitType;
      // createdAt e updatedAt serão gerenciados automaticamente pelo WatermelonDB
    });
    
    console.log(`IMPORT_SERVICE: Produto criado - ${productCodeStr}: ${productNameStr} (${unitType})`);
    return { success: true, action: 'inserted' };
  }
}
```

### 8. Importação Principal de Produtos
```javascript
/**
 * Função principal para importação de produtos
 * @returns {Promise<Object>} - Estatísticas da importação
 */
async importProducts() {
  try {
    console.log('IMPORT_SERVICE: Iniciando importação de produtos...');

    // Seleção do arquivo
    const asset = await this.selectImportFile();
    if (!asset) {
      return {
        success: false,
        message: 'Importação cancelada pelo usuário.',
        stats: { inserted: 0, updated: 0, errors: [] }
      };
    }

    // Processamento do arquivo
    const stats = await this.processProductFile(asset);

    // Log das estatísticas finais
    console.log('IMPORT_SERVICE: Importação concluída');
    console.log('IMPORT_SERVICE: Estatísticas da Importação:', {
      inserted: stats.inserted,
      updated: stats.updated,
      errorsCount: stats.errors.length,
      totalProcessed: stats.inserted + stats.updated + stats.errors.length
    });

    // Exibir resultados
    this.showImportResults(stats);

    return {
      success: true,
      message: 'Importação concluída com sucesso.',
      stats
    };

  } catch (error) {
    console.error('IMPORT_SERVICE: Erro na importação:', error);
    
    Alert.alert(
      'Erro na Importação',
      `Ocorreu um erro durante a importação: ${error.message}`,
      [{ text: 'OK' }]
    );

    return {
      success: false,
      message: `Erro na importação: ${error.message}`,
      stats: { inserted: 0, updated: 0, errors: [] }
    };
  }
}
```

### 9. Exibição de Resultados
```javascript
/**
 * Exibir resultados da importação (similar ao padrão do ExportService)
 */
showImportResults(stats) {
  const { inserted, updated, errors, fileName } = stats;
  
  if (inserted === 0 && updated === 0 && errors.length === 0) {
    Alert.alert(
      'Importação Concluída',
      'Nenhum produto foi processado.',
      [{ text: 'OK' }]
    );
    return;
  }

  let message = `Importação do arquivo "${fileName}" concluída!\n\n`;
  
  if (inserted > 0) {
    message += `• Produtos criados: ${inserted}\n`;
  }
  
  if (updated > 0) {
    message += `• Produtos atualizados: ${updated}\n`;
  }
  
  if (errors.length > 0) {
    message += `• Erros encontrados: ${errors.length}\n`;
    
    // Mostrar primeiros 3 erros como exemplo
    if (errors.length > 0) {
      message += `\nPrimeiros erros:\n`;
      const firstErrors = errors.slice(0, 3);
      firstErrors.forEach(error => {
        message += `• Linha ${error.lineNumber}: ${error.error}\n`;
      });
      
      if (errors.length > 3) {
        message += `• ... e mais ${errors.length - 3} erro(s)\n`;
      }
    }
  }

  const totalProcessed = inserted + updated + errors.length;
  message += `\nTotal de linhas processadas: ${totalProcessed}`;

  Alert.alert(
    inserted > 0 || updated > 0 ? 'Importação Realizada' : 'Importação com Problemas',
    message,
    [{ text: 'OK' }]
  );
}
```

### 10. Sanitização Retroativa (Funcionalidade Adicional)
```javascript
/**
 * Sanitiza produtos existentes corrigindo unit_type baseado no product_name
 * @returns {Promise<Object>} - Estatísticas da sanitização
 */
async sanitizeExistingProducts() {
  try {
    console.log('IMPORT_SERVICE: Iniciando sanitização de produtos existentes...');
    
    const stats = {
      total: 0,
      corrected: 0,
      errors: []
    };

    const productsCollection = database.get('products');
    
    await database.write(async () => {
      // Buscar todos os produtos não excluídos
      const allProducts = await productsCollection
        .query(Q.where('deleted_at', null))
        .fetch();

      stats.total = allProducts.length;
      console.log(`IMPORT_SERVICE: Encontrados ${stats.total} produtos para sanitização`);

      for (const product of allProducts) {
        try {
          const correctUnitType = this.determineUnitType(product.productName);
          
          // Verificar se precisa de correção
          if (!product.unitType || product.unitType !== correctUnitType) {
            await product.update(prod => {
              prod.unitType = correctUnitType;
            });
            stats.corrected++;
            console.log(`IMPORT_SERVICE: Corrigido ${product.productCode}: ${product.productName} -> ${correctUnitType}`);
          }
        } catch (error) {
          console.error(`IMPORT_SERVICE: Erro ao sanitizar produto ${product.productCode}:`, error);
          stats.errors.push({
            productCode: product.productCode,
            error: error.message
          });
        }
      }
    });

    console.log('IMPORT_SERVICE: Sanitização concluída:', stats);
    
    // Exibir resultados
    this.showSanitizationResults(stats);
    
    return stats;

  } catch (error) {
    console.error('IMPORT_SERVICE: Erro na sanitização:', error);
    Alert.alert(
      'Erro na Sanitização',
      `Erro durante a sanitização: ${error.message}`,
      [{ text: 'OK' }]
    );
    throw error;
  }
}
```

### 11. Exibição de Resultados da Sanitização
```javascript
/**
 * Exibir resultados da sanitização
 */
showSanitizationResults(stats) {
  const { total, corrected, errors } = stats;
  
  let message = `Sanitização de produtos concluída!\n\n`;
  message += `• Total de produtos verificados: ${total}\n`;
  message += `• Produtos corrigidos: ${corrected}\n`;
  
  if (errors.length > 0) {
    message += `• Erros encontrados: ${errors.length}\n`;
  }
  
  if (corrected === 0) {
    message += `\nTodos os produtos já estavam com unit_type correto.`;
  } else {
    message += `\n${corrected} produtos tiveram o unit_type corrigido baseado no nome do produto.`;
  }

  Alert.alert(
    'Sanitização Concluída',
    message,
    [{ text: 'OK' }]
  );
}
```

### 12. Métodos de Utilidade
```javascript
/**
 * Limpa cache do ProductService após importação (se necessário)
 */
clearProductCache() {
  try {
    // Importar ProductService e limpar cache se disponível
    const { productService } = require('./ProductService');
    if (productService && typeof productService.clearCache === 'function') {
      productService.clearCache();
      console.log('IMPORT_SERVICE: Cache do ProductService limpo');
    }
  } catch (error) {
    console.warn('IMPORT_SERVICE: Não foi possível limpar cache:', error.message);
  }
}

/**
 * Obtém estatísticas rápidas dos produtos (para relatórios)
 * @returns {Promise<Object>} - Estatísticas dos produtos
 */
async getProductStatistics() {
  try {
    const productsCollection = database.get('products');
    const products = await productsCollection
      .query(Q.where('deleted_at', null))
      .fetch();

    const stats = {
      total: products.length,
      byUnitType: {},
      lastUpdated: new Date().toISOString()
    };

    // Agrupar por tipo de unidade
    products.forEach(product => {
      const unitType = product.unitType || 'UNDEFINED';
      stats.byUnitType[unitType] = (stats.byUnitType[unitType] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('IMPORT_SERVICE: Erro ao obter estatísticas:', error);
    throw new Error(`Falha ao obter estatísticas: ${error.message}`);
  }
}
```

## Estrutura Final da Classe

```javascript
class ImportService {
  constructor() {
    this.supportedFormats = ['text/plain', 'text/txt'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
  }

  // Métodos principais
  getAppName()
  validateSelectedFile(asset)
  selectImportFile()
  determineUnitType(productName)
  formatProductCode(code)
  processProductFile(asset)
  processProductLine(line, lineNumber, processedCodes, productsCollection)
  importProducts()
  showImportResults(stats)
  
  // Funcionalidades adicionais
  sanitizeExistingProducts()
  showSanitizationResults(stats)
  clearProductCache()
  getProductStatistics()
}

// Exportar instância singleton (mesmo padrão do ExportService)
export const importService = new ImportService();
export default importService;
```

## Padrões Arquiteturais Mantidos

### 1. **Estrutura de Classe**
- ✅ Classe singleton exportada como `importService`
- ✅ Constructor com configurações iniciais
- ✅ Métodos bem definidos e documentados

### 2. **Tratamento de Erros**
- ✅ Try-catch em todos os métodos críticos
- ✅ Logs detalhados para debugging
- ✅ Alerts informativos para o usuário

### 3. **Integração com WatermelonDB**
- ✅ Uso de `database.write()` para transações
- ✅ Queries otimizadas com indexação
- ✅ Relacionamentos e validações adequadas

### 4. **UX Consistente**
- ✅ Feedback visual via `Alert.alert()`
- ✅ Mensagens claras e informativas
- ✅ Opção de cancelamento

### 5. **Configurabilidade**
- ✅ Detecção automática do nome da aplicação
- ✅ Configurações centralizadas no constructor
- ✅ Validações configuráveis

## Integração com Outros Serviços

### ProductService
- Limpa cache após importação
- Mantém compatibilidade com métodos existentes

### ExportService
- Utiliza a mesma estrutura de projeto
- Compartilha padrões de nomenclatura

### EntryService
- Pode ser usado em futuras integrações
- Estrutura preparada para expansão

## Casos de Uso

### 1. **Importação Padrão**
```javascript
import { importService } from '../services/ImportService';

// Em um componente ou tela
const handleImport = async () => {
  const result = await importService.importProducts();
  // resultado com estatísticas completas
};
```

### 2. **Sanitização Manual**
```javascript
// Para corrigir produtos existentes
const handleSanitize = async () => {
  const stats = await importService.sanitizeExistingProducts();
  // estatísticas de quantos foram corrigidos
};
```

### 3. **Relatórios**
```javascript
// Para obter estatísticas dos produtos
const getStats = async () => {
  const stats = await importService.getProductStatistics();
  // estatísticas por unit_type, total, etc.
};
```

## Testes Recomendados

### 1. **Formato de Arquivo**
- [ ] Arquivo com 40 caracteres por linha
- [ ] Arquivo com linhas de tamanho incorreto
- [ ] Arquivo vazio ou com linhas vazias

### 2. **Validações de Dados**
- [ ] Códigos de produto com formato incorreto
- [ ] Preços inválidos ou negativos
- [ ] Nomes de produto vazios

### 3. **Lógica unit_type**
- [ ] Produtos com "KG" em diferentes posições
- [ ] Produtos sem "KG" (devem ser "UN")
- [ ] Cases diferentes: "kg", "Kg", "KG"

### 4. **Duplicatas**
- [ ] Códigos duplicados no mesmo arquivo
- [ ] Produtos já existentes no banco (update)
- [ ] Produtos novos (insert)

### 5. **Performance**
- [ ] Arquivos grandes (milhares de linhas)
- [ ] Transações otimizadas
- [ ] Memória e processamento

## Benefícios da Separação

### 1. **Separação de Responsabilidades**
- `ProductService`: Operações CRUD de produtos
- `ImportService`: Importação de dados
- `ExportService`: Exportação de dados

### 2. **Manutenibilidade**
- Código mais organizado
- Fácil localização de funcionalidades
- Testes unitários específicos

### 3. **Reutilização**
- Métodos podem ser usados independentemente
- Integração simples com outros componentes
- Expansão futura facilitada

### 4. **Consistência**
- Mesmo padrão do ExportService
- Padronização de erro handling
- UX uniforme

Este ImportService mantém total compatibilidade com o código existente enquanto oferece uma estrutura mais organizada e funcionalidades expandidas para importação de dados.