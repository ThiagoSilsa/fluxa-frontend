# 11: Solicitações — "Minhas solicitações" do porteiro

**What to build:** O porteiro passa a visualizar **as próprias** solicitações — de acesso e de bloqueio — com status e ação de cancelar, no fluxo da página de solicitações (o gestor continua vendo todas e decidindo).

**Blocked by:** Backend `solicitacoes-porteiro` 02 e 03 (listagens escalonadas) + 10 (cenário bloqueio) quando incluir bloqueio.

**Status:** ready-for-agent

- [ ] Porteiro vê lista das próprias solicitações de acesso (somente as dele).
- [ ] Porteiro vê as próprias solicitações de bloqueio (quando aplicável).
- [ ] Ação de cancelar disponível e funcional nas próprias solicitações.
- [ ] Gestor mantém a visão de todas as solicitações + decisões.
- [ ] Estados de carregamento/vazio/erro consistentes.
