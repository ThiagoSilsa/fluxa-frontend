# 09: Solicitações — pickers compartilhados + input único de veículo

**What to build:** Nos cenários "Novo motorista" e "Vincular", o campo livre "Placa" é removido — fica **um único input de veículo** (busca por placa ou modelo, do qual a placa deriva). O fluxo usa os pickers compartilhados (veículo e usuário) e funciona para o porteiro, que agora busca veículos/usuários sem permissões de gestão.

**Blocked by:** 01 (shared pickers) + Backend `solicitacoes-porteiro` 01 (endpoints de seleção).

**Status:** ready-for-agent

- [ ] "Novo motorista": sem campo livre "Placa"; um input de veículo (placa/modelo) seleciona o veículo e a placa deriva da seleção.
- [ ] "Vincular": picker de veículo + picker de usuário (sem campo livre "Placa").
- [ ] "Novo veículo" mantém o picker de usuário (busca compartilhada) e, quando aplicável, o campo de placa do veículo a criar.
- [ ] Pickers usam os novos endpoints de seleção (funcionam para o porteiro).
- [ ] i18n pt/en e validações (veículo/usuário obrigatórios por cenário) preservadas.
