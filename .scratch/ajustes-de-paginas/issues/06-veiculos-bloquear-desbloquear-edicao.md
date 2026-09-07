# 06: Veículos — bloquear/desbloquear no modal de edição

**What to build:** No modal de **edição** do veículo, o gestor com `MANAGE_BLOCKS` vê ações de bloqueio: **Bloquear** (abre diálogo de confirmação com motivo e cria o bloqueio) e **Desbloquear** quando o veículo está bloqueado (revoga o bloqueio ativo da placa). O formulário de edição permanece aberto e o estado exibido é atualizado.

**Blocked by:** 01 (shared placa+motivo).

**Status:** ready-for-agent

- [ ] Botão "Bloquear" visível apenas com `MANAGE_BLOCKS`, somente no modo edição.
- [ ] Bloquear abre confirmação com motivo (placa do veículo pré-preenchida) e cria o bloqueio.
- [ ] Quando bloqueado, aparece "Desbloquear", que revoga o bloqueio ativo da placa.
- [ ] Após a ação, estado (botão/badge) atualiza sem fechar o formulário de edição.
- [ ] Textos via i18n (pt/en); sem importação entre features (usa o compartilhado do ticket 01).
