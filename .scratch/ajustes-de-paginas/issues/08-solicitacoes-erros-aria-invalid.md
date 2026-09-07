# 08: Solicitações — erros traduzidos + aria-invalid

**What to build:** Os erros de campo da página de solicitações deixam de exibir a chave crua (ex.: `form.errors.contact-required`) e passam a mostrar o texto traduzido; os inputs de busca dos seletores (veículo/usuário) também sinalizam `aria-invalid` quando o campo está com erro.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Chaves de erro resolvem para o texto traduzido (nível `form.errors.*`, convenção do repo) em todos os campos do modal de solicitação.
- [ ] Inputs de busca dos seletores propagam `aria-invalid`/`aria-describedby` quando o campo tem erro.
- [ ] Mensagens pt/en corretas; sem chave crua visível.
- [ ] Sem regressão nos demais fluxos que usam o mesmo padrão de erro.
