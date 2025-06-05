# Plano de Implementação: Remoção da Validação de UnitType

## Contexto
Atualmente, a validação de quantidade na tela de lançamento está vinculada ao `unit_type` do produto. A proposta é permitir que o usuário registre quantidades como KG ou UN independentemente do tipo definido no produto, usando um toggle no campo de quantidade.

## Modificações Necessárias

### 1. Componente QuantityInput
✅ Já implementado com as seguintes características:
- TextInput.Icon para alternar entre KG/UN
- Formatação em tempo real:
  - KG: formato 00.00 (ex: 00.50, 09.99)
  - UN: inteiros sem zeros à esquerda (ex: 25, 10)
- Validações específicas por tipo com mensagens de erro

### 2. Integração no BreakScreen.js

#### Modificações Pendentes:
1. Importar o componente QuantityInput:
```javascript
import QuantityInput from '../components/forms/QuantityInput';
```

2. Substituir o TextInput atual pelo QuantityInput:
```javascript
<QuantityInput
  label="Quantidade *"
  mode="outlined"
  value={quantity}
  onChangeText={setQuantity}
  style={styles.input}
  initialUnitType={selectedProduct?.unitType || 'UN'}
/>
```

3. Atualizar o estado de quantidade:
```javascript
const [quantity, setQuantity] = useState({ value: '', unit: 'UN' });
```

4. Modificar o handleSave para usar o novo formato:
```javascript
// Remove a sanitização atual de quantidade
const { value: quantityValue, unit: chosenUnitType } = quantity;
const numericQuantity = parseFloat(quantityValue);

// Criar entrada com o tipo escolhido
const newEntry = await entriesCollection.create(entry => {
  entry.productCodeValue = selectedProduct.productCode;
  entry.productName = selectedProduct.productName;
  entry.quantity = numericQuantity;
  entry.chosen_unit_type = chosenUnitType; // Novo campo
  entry.reasonCodeValue = selectedReason.code;
  entry.entryDate = Date.now();
  entry.isSynchronized = false;
});
```

### 3. Processamento de Dados
✅ EntryService.js já está configurado para lidar com o chosen_unit_type
✅ ExportService.js modificado para formatar quantidades corretamente:
- Math.floor() para valores UN
- toFixed(3) para ambos os tipos
- Formatação final como "50.900" ou "25.000"

## Fluxo de Dados

1. **Frontend**:
   - Usuário digita "0.5" ou ".5" em modo KG → Exibe como "00.50"
   - Usuário digita "25" em modo UN → Exibe como "25"
   - Valores são enviados ao backend exatamente como exibidos

2. **Backend**:
   - Recebe "00.50" (KG) → Armazena como 0.5
   - Recebe "25" (UN) → Armazena como 25
   - Mantém o chosen_unit_type ("KG" ou "UN")

3. **Exportação**:
   - Recupera 0.5 (KG) → Exporta como "0.500"
   - Recupera 25 (UN) → Exporta como "25.000"

## Próximos Passos

1. Trocar para o modo Code
2. Implementar as modificações no BreakScreen.js
3. Testar o fluxo completo:
   - Entrada de dados
   - Salvamento no banco
   - Exportação para arquivo