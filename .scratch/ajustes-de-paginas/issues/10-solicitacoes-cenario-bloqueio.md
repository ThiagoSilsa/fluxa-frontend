# 10: Solicitações — cenário "Bloqueio" no select

**What to build:** No select de cenário da "Nova solicitação", surge a opção **"Bloqueio"**: ao escolhê-la, o modal exibe o formulário de solicitação de bloqueio (placa + motivo) e o envio cria uma solicitação de bloqueio (`POST /block-requests`) — sem importar a feature de bloqueios (usa os campos compartilhados).

**Blocked by:** 01 (shared placa+motivo).

**Status:** ready-for-agent

- [ ] Opção "Bloqueio" aparece no select de cenário (i18n pt/en), condicionada à permissão de solicitar bloqueio.
- [ ] Selecionar "Bloqueio" troca o corpo do modal para placa + motivo (submit → solicitação de bloqueio).
- [ ] Envio com sucesso limpa/reseta e dá feedback.
- [ ] Nenhuma importação entre features; os cenários de acesso existentes permanecem intactos.
