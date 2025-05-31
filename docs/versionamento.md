# Tutorial de Versionamento - Projeto Invent

## Introdução

O projeto **invent** utiliza um sistema automatizado de versionamento baseado no **Semantic Versioning (SemVer)** com scripts npm personalizados.

## Sistema de Versionamento

### Tipos de Versão (SemVer)
- **PATCH** (1.0.0 → 1.0.1): Correções de bugs
- **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades (compatível)
- **MAJOR** (1.0.0 → 2.0.0): Mudanças que quebram compatibilidade

## Comandos Disponíveis

### Scripts de Versionamento Simples
```bash
npm run version:patch   # Incrementa versão de correção (1.0.0 → 1.0.1)
npm run version:minor   # Incrementa versão menor (1.0.0 → 1.1.0)
npm run version:major   # Incrementa versão maior (1.0.0 → 2.0.0)
```

### Scripts de Release Completo (Recomendado)
```bash
npm run release:patch   # Release de correção
npm run release:minor   # Release de funcionalidade
npm run release:major   # Release com breaking changes
```

## Como Usar

### Para Correções de Bug
```bash
# Exemplo: Corrigiu um bug na validação
npm run release:patch
```

### Para Novas Funcionalidades
```bash
# Exemplo: Adicionou nova feature de login
npm run release:minor
```

### Para Mudanças que Quebram Compatibilidade
```bash
# Exemplo: Mudou API de forma incompatível
npm run release:major
```

## O que Acontece Automaticamente

Os comandos `release:*` executam:
1. Atualizam a versão no `package.json`
2. Fazem commit das mudanças
3. Criam tag Git com a nova versão
4. Fazem push para o repositório remoto

## Gerenciamento de Versões

### Histórico de Versões
```bash
# Ver todas as tags de versão
git tag

# Ver histórico de commits
git log --oneline

# Ver versões publicadas (se aplicável)
npm view invent versions
```

### Acessando Versões Anteriores
```bash
# Voltar para versão específica
git checkout v1.0.0

# Ver diferenças entre versões
git diff v1.0.3 v1.0.4
```

## ⚠️ Cuidados Importantes

### 1. Versões Anteriores Não São Perdidas
- Todas as versões ficam salvas no Git como tags
- O `package.json` sempre mostra apenas a versão atual
- Histórico completo permanece acessível

### 2. Não É Possível "Voltar" Versões Facilmente
```bash
# ❌ Não existe comando para decrementar automaticamente
# ✅ Se necessário, edite manualmente o package.json e faça novo release
```

### 3. Conflitos de Tags
Se precisar refazer uma versão:
```bash
# Remover tag local
git tag -d v1.2.0

# Remover tag do repositório remoto  
git push origin :v1.2.0
```

## Boas Práticas

### 1. Use Sempre os Scripts de Release
```bash
# ✅ Recomendado
npm run release:patch

# ❌ Evite fazer manualmente
npm version patch
git push
git push --tags
```

### 2. Escolha o Tipo Correto
- **PATCH**: Apenas correções, sem novas features
- **MINOR**: Novas funcionalidades compatíveis
- **MAJOR**: Mudanças que quebram compatibilidade existente

### 3. Sempre Documente
Antes de fazer release, documente as mudanças no CHANGELOG.md ou commit message.

## Exemplos Práticos

```bash
# Cenário 1: Corrigiu bug na validação de email
npm run release:patch   # 1.0.0 → 1.0.1

# Cenário 2: Adicionou feature de notificações
npm run release:minor   # 1.0.1 → 1.1.0

# Cenário 3: Mudou estrutura da API
npm run release:major   # 1.1.0 → 2.0.0
```

## Verificação Pós-Release

Após executar um release, verifique:
```bash
# Confirme a nova versão
cat package.json | grep version

# Verifique se a tag foi criada
git tag | tail -1

# Confirme push no repositório remoto
git log --oneline -1
