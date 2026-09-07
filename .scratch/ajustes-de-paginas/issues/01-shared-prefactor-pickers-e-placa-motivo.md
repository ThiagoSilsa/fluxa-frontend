# 01: Shared (prefactor) — pickers de veículo/usuário e campos "placa + motivo"

**What to build:** Extrair para `shared/components` as peças reutilizadas por mais de uma feature — os seletores de veículo (busca por placa/modelo) e de usuário (busca por nome/e-mail) com chip de seleção, e os campos de formulário "placa + motivo". A feature `blocks` passa a consumir o compartilhado com o mesmo comportamento (expand–contract). Nenhuma feature importa outra.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Componentes compartilhados de picker (veículo/usuário) e de campos "placa + motivo" existem em `shared/components`, sem lógica de feature (labels/i18n/mutations fornecidos por quem usa).
- [ ] A feature `blocks` usa o compartilhado sem regressão (criar/revogar/solicitar continuam iguais).
- [ ] Nenhuma importação entre features introduzida.
- [ ] i18n dos campos compartilhados registrado adequadamente (sem quebrar a regra de namespace).
