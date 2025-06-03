# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]
### Alterado
- 📤 **Sistema de Exportação**
  - Consolidação automática de lançamentos por código de produto
  - Formatação inteligente de quantidades baseada no tipo de unidade:
    - KG: mantém frações decimais (ex: 1.750)
    - UN: arredonda para baixo e formata como X.000
  - Validações aprimoradas para dados exportados
  - Nomes de arquivos únicos com timestamp completo
  - Interface aprimorada com detalhamento de erros e avisos
- 🆔 **Gestão de Produtos**
  - Padronização do formato de códigos de produto em todas as operações
  - Busca inteligente que funciona com ou sem zeros à esquerda

### Corrigido
- Preenchimento automático de zeros à esquerda nos códigos de produto (13 dígitos)
- Busca de produtos falhando quando código continha zeros à esquerda
- Evita sobrescrita de arquivos exportados no mesmo dia
- Validação rigorosa do formato de códigos de produto

### Planejado
- Sistema de backup automático
- Sincronização em nuvem
- Relatórios avançados
- Modo escuro

## [1.0.0] - 2025-01-26
### Adicionado
- 🎉 **Release inicial do aplicativo de gerenciamento de inventário**
- 📱 Interface React Native com Material Design 3
- 🗄️ Sistema de banco de dados SQLite integrado
- 📋 Formulários para entrada e edição de dados
- 📊 Cards de estatísticas na tela inicial
- 🏷️ Sistema de categorização com dropdown de motivos
- 🎨 Sistema de temas personalizável
- 📱 Compatibilidade com Android e iOS
- ✅ Testes unitários configurados
- 📚 Documentação técnica completa

### Componentes Incluídos
- `HomeScreen`: Tela principal com estatísticas
- `EntryForm`: Formulário de entrada de dados
- `MotiveDropdown`: Dropdown para seleção de motivos
- `AppTopBar`: Barra superior do aplicativo
- `StatsCard`: Cards de estatísticas
- `Card` e `TextInput`: Componentes base customizados

### Funcionalidades de Banco de Dados
- Conexão SQLite robusta com fallbacks
- DAOs para Entry, Product e Reason
- Schema de banco de dados estruturado
- Sistema de migração automática

### Configurações
- Configuração Expo para desenvolvimento
- Build para Android e iOS
- Metro bundler configurado
- Jest para testes
- Babel com plugins necessários

### Documentação
- Guia de configuração do ambiente
- Plano de implementação detalhado
- Diagrama de arquitetura
- Workflow de desenvolvimento
- Status de implementação

---

## Como Contribuir

### Tipos de Mudanças
- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes
- **Descontinuado** para funcionalidades que serão removidas
- **Removido** para funcionalidades removidas
- **Corrigido** para correções de bugs
- **Segurança** para vulnerabilidades

### Formato de Entrada
```markdown
## [X.Y.Z] - YYYY-MM-DD
### Adicionado
- Nova funcionalidade A
- Nova funcionalidade B

### Corrigido  
- Correção do bug X
- Melhoria na performance Y

### Alterado
- Mudança no comportamento Z