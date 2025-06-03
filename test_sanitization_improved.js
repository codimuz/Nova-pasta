/**
 * Script de teste melhorado para validar a sanitização do sufixo "000" nos nomes dos produtos
 * Este script simula o comportamento da função de sanitização implementada
 */

// Simulação da lógica de sanitização corrigida
function sanitizeProductName(rawName) {
  let productNameStr = rawName.trim();
  
  // Sanitização do nome do produto - remover sufixo "000"
  // Verifica se termina com "000" mas não faz parte de um número maior (ex: 1000, 2000)
  if (productNameStr.endsWith('000') && 
      (productNameStr.length === 3 || !/\d/.test(productNameStr.charAt(productNameStr.length - 4)))) {
    productNameStr = productNameStr.substring(0, productNameStr.length - 3).trim();
  }
  
  return productNameStr;
}

// Casos de teste
const testCases = [
  {
    input: 'PRESUNTO HACIENDA000',
    expected: 'PRESUNTO HACIENDA',
    description: 'Produto com sufixo 000'
  },
  {
    input: 'QUEIJO MINAS    000',
    expected: 'QUEIJO MINAS',
    description: 'Produto com espaços antes do sufixo 000'
  },
  {
    input: 'PRODUTO SEM SUFIXO ',
    expected: 'PRODUTO SEM SUFIXO',
    description: 'Produto sem sufixo 000'
  },
  {
    input: 'TESTE COM 1000  000',
    expected: 'TESTE COM 1000',
    description: 'Produto com números e sufixo 000'
  },
  {
    input: 'PRODUTO 2000       ',
    expected: 'PRODUTO 2000',
    description: 'Produto terminado com 2000 (não deve ser alterado)'
  },
  {
    input: '   LEITE INTEGRAL000',
    expected: 'LEITE INTEGRAL',
    description: 'Produto com espaços no início e sufixo 000'
  },
  {
    input: 'ARROZ 5000',
    expected: 'ARROZ 5000',
    description: 'Produto terminado com 5000 (não deve ser alterado)'
  },
  {
    input: 'FEIJAO TIPO1000',
    expected: 'FEIJAO TIPO1000',
    description: 'Produto com 1000 no meio do nome (não deve ser alterado)'
  },
  {
    input: 'PRODUTO A 000',
    expected: 'PRODUTO A',
    description: 'Produto com espaço e depois 000'
  },
  {
    input: '000',
    expected: '',
    description: 'Apenas 000 (deve ser removido completamente)'
  }
];

console.log('=== TESTE DE SANITIZAÇÃO DE NOMES DE PRODUTOS (VERSÃO MELHORADA) ===\n');

testCases.forEach((testCase, index) => {
  const result = sanitizeProductName(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`Teste ${index + 1}: ${testCase.description}`);
  console.log(`  Entrada: "${testCase.input}"`);
  console.log(`  Esperado: "${testCase.expected}"`);
  console.log(`  Resultado: "${result}"`);
  console.log(`  Status: ${passed ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log('');
});

console.log('=== RESUMO ===');
const passedTests = testCases.filter(testCase => sanitizeProductName(testCase.input) === testCase.expected);
console.log(`Total de testes: ${testCases.length}`);
console.log(`Testes que passaram: ${passedTests.length}`);
console.log(`Testes que falharam: ${testCases.length - passedTests.length}`);

if (passedTests.length === testCases.length) {
  console.log('\n🎉 Todos os testes passaram! A sanitização está funcionando corretamente.');
} else {
  console.log('\n⚠️  Alguns testes falharam. Verifique a implementação.');
  
  // Mostrar quais testes falharam
  console.log('\n❌ Testes que falharam:');
  testCases.forEach((testCase, index) => {
    const result = sanitizeProductName(testCase.input);
    if (result !== testCase.expected) {
      console.log(`  - Teste ${index + 1}: ${testCase.description}`);
    }
  });
}
