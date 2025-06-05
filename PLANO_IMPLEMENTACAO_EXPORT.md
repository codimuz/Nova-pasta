# Plano de Implementação - Modificações no ExportService

## Objetivo
Implementar as seguintes modificações no ExportService:
1. Atualizar `createReasonDirectory()` para usar `Documents/<nome_do_app>/motivos/motivoXX/`
2. Implementar detecção automática do nome da aplicação
3. Utilizar expo-document-picker para seleção dinâmica de diretório pelo usuário
4. Remover especificação de diretório fixo na escolha do usuário

## Análise do Estado Atual

