# Invent - Sistema de Controle de Perdas

![GitHub](https://img.shields.io/github/license/codimuz/Nova-pasta)
![GitHub stars](https://img.shields.io/github/stars/codimuz/Nova-pasta)
![GitHub forks](https://img.shields.io/github/forks/codimuz/Nova-pasta)
![GitHub issues](https://img.shields.io/github/issues/codimuz/Nova-pasta)
![React Native](https://img.shields.io/badge/React%20Native-0.74.x-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-51.x-000020?logo=expo)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)

Sistema de inventário para controle de perdas e ajustes, desenvolvido em React Native com Expo Bare Workflow.

## 🚀 Tecnologias

- **React Native** - Framework principal
- **Expo** (Bare Workflow) - Plataforma de desenvolvimento
- **SQLite** - Banco de dados local
- **Material Design 3** - Sistema de design
- **React Native Paper** - Biblioteca de componentes

## 📁 Estrutura do Projeto

```
invent/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── common/         # Componentes básicos
│   │   └── forms/          # Formulários
│   ├── database/           # Configuração do banco de dados
│   │   ├── dao/           # Data Access Objects
│   │   ├── connection.js  # Configuração de conexão
│   │   ├── schema.js      # Schema das tabelas
│   │   └── db.js          # Interface principal
│   ├── screens/           # Telas do aplicativo
│   └── theme/             # Sistema de design
├── android/               # Configurações Android
├── ios/                   # Configurações iOS
└── docs/                  # Documentação
```

## 🗄️ Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

### Products
Catálogo de produtos do sistema.
- `product_code` (TEXT, PK) - Código único do produto
- `product_name` (TEXT) - Nome do produto
- `regular_price` (REAL) - Preço regular
- `club_price` (REAL) - Preço clube
- `unit_type` (TEXT) - Tipo de unidade (UN, KG, etc.)

### Reasons
Motivos para perdas e ajustes.
- `reason_id` (INTEGER, PK) - ID único
- `reason_name` (TEXT) - Nome do motivo
- `description` (TEXT) - Descrição detalhada
- `is_active` (INTEGER) - Status ativo/inativo

### Entries
Lançamentos de perdas/ajustes.
- `entry_id` (INTEGER, PK) - ID único
- `product_code` (TEXT, FK) - Referência ao produto
- `reason_id` (INTEGER, FK) - Referência ao motivo
- `quantity_lost` (REAL) - Quantidade perdida
- `unit_cost` (REAL) - Custo unitário
- `notes` (TEXT) - Observações
- `entry_date` (TEXT) - Data do lançamento

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 18+)
- Android Studio (para Android)
- Xcode (para iOS, apenas macOS)
- Java JDK 17

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/codimuz/Nova-pasta.git
cd Nova-pasta
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o ambiente Android:**
```bash
# Configure o Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

4. **Execute o projeto:**
```bash
# Para Android
npm run android

# Para iOS (apenas macOS)
npm run ios

# Iniciar Metro bundler
npm start
```

## 📱 Funcionalidades

### ✅ Implementadas
- Configuração completa do banco SQLite
- Sistema de design Material Design 3
- Estrutura de componentes reutilizáveis
- DAOs para Products, Reasons e Entries
- Tela principal com estatísticas
- Formulário de entrada de perdas

### 🚧 Em Desenvolvimento
- Sistema de navegação completo
- Telas de relatórios
- Importação/exportação de dados
- Sincronização com servidor

## 🎨 Sistema de Design

O projeto utiliza Material Design 3 com as seguintes cores principais:

- **Primary**: #6750A4 (Purple)
- **Secondary**: #625B71 (Gray Purple)
- **Tertiary**: #7D5260 (Brown Purple)
- **Error**: #BA1A1A (Red)
- **Surface**: #FFFBFE (Light Purple)

## 💾 Uso da Base de Dados

### Inicialização
```javascript
import { initializeDatabase, dao } from './src/database/db';

// No App.js
useEffect(() => {
  initializeDatabase();
}, []);
```

### Operações com Produtos
```javascript
// Buscar produto por código
const product = await dao.products.findByCode('123456');

// Inserir novo produto
const productId = await dao.products.insert({
  product_code: '123456',
  product_name: 'Produto Teste',
  regular_price: 10.50,
  club_price: 9.99,
  unit_type: 'UN'
});

// Buscar produtos por nome
const products = await dao.products.searchByName('teste');
```

### Operações com Entradas
```javascript
// Inserir nova entrada de perda
const entryId = await dao.entries.insert({
  product_code: '123456',
  reason_id: 1,
  quantity_lost: 5,
  unit_cost: 10.50,
  notes: 'Produto vencido'
});

// Buscar entradas por período
const entries = await dao.entries.getByDateRange(
  '2024-01-01',
  '2024-12-31'
);
```

### Operações com Motivos
```javascript
// Listar todos os motivos ativos
const reasons = await dao.reasons.getAll();

// Inserir novo motivo
const reasonId = await dao.reasons.insert({
  reason_name: 'Vencimento',
  description: 'Produtos com prazo de validade expirado',
  is_active: 1
});
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage
```

## 📚 Scripts Disponíveis

- `npm start` - Inicia o Metro bundler
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm test` - Executa os testes
- `npm run lint` - Executa o linter
- `npx expo prebuild` - Regenera arquivos nativos

## 🐛 Troubleshooting

### Problema com Metro Cache
```bash
npx expo start --clear
```

### Problema com dependências nativas
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

### Erro de versão do Node
Certifique-se de usar Node.js 18+:
```bash
node --version
```

## 📋 Roadmap

- [ ] Sistema de autenticação
- [ ] Sincronização com servidor
- [ ] Relatórios avançados
- [ ] Exportação para Excel
- [ ] Modo offline
- [ ] Notificações push

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [`LICENSE`](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através dos [issues do GitHub](https://github.com/codimuz/Nova-pasta/issues).

---

**Versão atual**: 1.0.0  
**Última atualização**: Janeiro 2025
