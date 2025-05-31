# Guia de Versionamento do Projeto

Este projeto segue o padrão de **Versionamento Semântico (SemVer)** no formato `MAJOR.MINOR.PATCH`.

## Estrutura de Versionamento

### Formato: `X.Y.Z`

- **MAJOR (X)**: Mudanças incompatíveis com versões anteriores
- **MINOR (Y)**: Novas funcionalidades compatíveis com versões anteriores
- **PATCH (Z)**: Correções de bugs compatíveis com versões anteriores

## Como Versionar

### 1. Atualizando a Versão

```bash
# Para correção de bugs (1.0.0 -> 1.0.1)
npm version patch

# Para nova funcionalidade (1.0.0 -> 1.1.0)
npm version minor

# Para mudança incompatível (1.0.0 -> 2.0.0)
npm version major
```

### 2. Criando Tags

```bash
# Criar tag anotada
git tag -a v1.1.0 -m "Release v1.1.0 - Descrição das mudanças"

# Enviar tag para o repositório
git push origin v1.1.0

# Enviar todas as tags
git push origin --tags
```

### 3. Workflow Completo de Release

```bash
# 1. Certifique-se que está na branch master/main
git checkout master
git pull origin master

# 2. Atualize a versão (automaticamente atualiza package.json e cria commit)
npm version minor -m "Bump version to %s"

# 3. Crie uma tag anotada
git tag -a v$(node -p "require('./package.json').version") -m "Release v$(node -p "require('./package.json').version")"

# 4. Faça push do commit e da tag
git push origin master
git push origin --tags
```

## Histórico de Versões

### v1.0.0 (Atual)
- 🎉 Release inicial
- ✅ Aplicativo React Native com gerenciamento de inventário
- ✅ Integração com SQLite
- ✅ Interface Material Design 3
- ✅ Componentes personalizados
- ✅ Sistema de temas
- ✅ Testes configurados

## Branches e Versionamento

- **master/main**: Versões estáveis e releases
- **develop**: Desenvolvimento ativo
- **feature/***: Novas funcionalidades
- **hotfix/***: Correções urgentes

## Releases no GitHub

1. Acesse: https://github.com/marcosmicz/invent/releases
2. Clique em "Create a new release"
3. Selecione a tag criada
4. Adicione título e descrição das mudanças
5. Publique o release

## Convenção de Commit

Para facilitar o versionamento automático, use commits semânticos:

```
feat: nova funcionalidade (MINOR)
fix: correção de bug (PATCH)
BREAKING CHANGE: mudança incompatível (MAJOR)
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

## Exemplo de Changelog

```markdown
## [1.1.0] - 2025-01-XX
### Added
- Nova tela de relatórios
- Filtros avançados na listagem

### Fixed
- Correção no salvamento de dados
- Melhoria na performance da lista

### Changed
- Atualização do tema padrão