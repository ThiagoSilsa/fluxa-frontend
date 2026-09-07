# Spec — Ajustes de páginas e UX (frontend)

Status: ready-for-agent

## Problem Statement

Diversas telas precisam de correções de UX/consistência e de pequenas capacidades novas: URL desconhecida sem página própria; selects sem estado vazio/placeholder; tabela de veículos ordenando por colunas não suportadas; página de importações fora do padrão visual das demais; página de solicitações mostrando chaves de tradução cruas, com `aria-invalid` ausente e dois inputs redundantes para o mesmo veículo; sem cenário de solicitar bloqueio; porteiro sem visão das próprias solicitações; e o card de ocupação global sem a relação ocupados/capacidade.

## Solution

Aplicar um conjunto de ajustes de página/componentes, alinhando tudo ao padrão visual existente (`PageLayout` + `Header`, componentes shadcn/ui) e extraindo para `shared/components` as peças reutilizadas por mais de uma feature (pickers de veículo/usuário e campos "placa + motivo"), respeitando a regra de **nenhuma importação entre features**.

## User Stories

1. Como usuário, quero ver uma página 404 amigável quando a URL não existe, para voltar facilmente à navegação.
2. Como gestor, quero um placeholder claro no cargo do usuário quando nada foi selecionado, para saber que a escolha está pendente.
3. Como gestor, quero que o modal de veículo avise quando não há departamento disponível e desabilite o campo, para não tentar selecionar algo inexistente.
4. Como gestor, quero ordenar a lista de veículos apenas pelas colunas que realmente ordenam, para não clicar em cabeçalhos que não funcionam.
5. Como gestor, quero bloquear/desbloquear um veículo direto do modal de edição, para agir sem sair da tela de veículos.
6. Como gestor, quero que a página de importações siga o mesmo layout das outras (cabeçalho, descrição e subpáginas), para navegação consistente.
7. Como porteiro, quero ver erros traduzidos (não chaves) e campos de busca sinalizados como inválidos, para corrigir a solicitação com clareza.
8. Como porteiro, quero escolher o veículo por um único input de busca (que cobre a placa), sem digitar a placa duas vezes.
9. Como porteiro, quero uma opção "Bloqueio" entre os cenários de solicitação, para pedir um bloqueio pelo mesmo fluxo.
10. Como porteiro, quero ver as minhas solicitações (acesso e bloqueio) e cancelá-las.
11. Como gestor/portaria, quero ver a ocupação global como "ocupados / capacidade", para entender a lotação de imediato.

## Implementation Decisions

- **Prefactor compartilhado (wide, expand–contract)**: extrair para `shared/components` os pickers de veículo e de usuário (busca + seleção + chip) e os campos de formulário "placa + motivo". A feature `blocks` passa a consumir o compartilhado sem mudança de comportamento; nenhuma feature importa outra.
- **NotFound**: rota catch-all que renderiza página 404 (apresentação conforme sessão pública/privada), i18n pt/en e ação "voltar ao início".
- **Usuários**: select de cargo passa a exibir placeholder "Nenhum selecionado" quando nada selecionado; o item explícito "Sem cargo" permanece apenas na edição.
- **Veículos (gestão)**:
  - Modal criar/editar: quando não há departamento disponível → select desabilitado + mensagem "Nenhum departamento disponível".
  - Garantir que somente `plate`, `isActive`, `createdAt` sejam ordenáveis/ clicáveis na tela de veículos.
  - Modal de **edição** (visível com `MANAGE_BLOCKS`): botão **Bloquear** → diálogo de confirmação com motivo (cria bloqueio); botão **Desbloquear** quando bloqueado (revoga o bloqueio ativo da placa). Não fecha o formulário; atualiza o estado exibido.
- **Importações**: adotar `PageLayout` + `Header` (título/descrição) + botões de subpágina em `Button` toggle (padrão portaria/blocks).
- **Solicitações**:
  - Corrigir chaves de erro para o nível `form.errors.*` (convenção) e propagar `aria-invalid` aos inputs de busca dos pickers.
  - Remover o campo livre "Placa" em **Novo motorista** e **Vincular** (a placa deriva do veículo selecionado); busca do veículo por **placa ou modelo**; **Vincular** mantém picker de usuário + picker de veículo.
  - Novo cenário **"Bloqueio"** no select → formulário placa + motivo → `POST /block-requests` (sem importar a feature de bloqueios; usa os campos compartilhados).
  - Visão **"Minhas solicitações"** para o porteiro (acesso e bloqueio) com ação de cancelar — depende das listagens escalonadas do backend.
- **Ocupação**: o card "Ocupação global" exibe `ocupados / capacidade` (X/Y) mantendo a barra de percentual.
- Depende dos tickets de backend da spec `solicitacoes-porteiro` (seleção para porteiro e listagens escalonadas).
- Seguir convenções do repo: arquitetura feature-based, i18n com namespace registrado, sem importações entre features, sem alterar `src/styles/globals.css`, testes de lib/mapper.

## Testing Decisions

- Testar comportamento visível: estados vazios (sem departamento, sem seleção), ordenação apenas nas 3 colunas, fluxo bloquear/desbloquear, mensagens de erro traduzidas e `aria-invalid`, submissão do cenário "Bloqueio" e da "minha solicitação" (mocks dos serviços), layout de importações, card X/Y da ocupação.
- Prior art: testes de lib/mapper (obrigatórios) e padrões de componentes existentes; testes de página/hook quando houver infra.
- Regressão visual/funcional mínima nas features tocadas (veículos, usuários, importações, solicitações, ocupação, bloqueios).

## Out of Scope

- Sem mudanças de backend nesta spec (ver spec `solicitacoes-porteiro`).
- Sem nova página de bloqueios unificada (features de acesso e bloqueio permanecem separadas em nível de domínio; só o cenário "Bloqueio" entra na solicitação).
- Sem alteração de `globals.css` nem de identidade visual global.

## Further Notes

- Requer os tickets backend `solicitacoes-porteiro` 01 (seleção) e 02/03 (listagens escalonadas).
- Prefactor (ticket 01) destrava os tickets 06, 09 e simplifica o 10.
