# 02: Página NotFound (catch-all 404)

**What to build:** Toda URL inexistente passa a exibir uma página 404 amigável (em vez de tela em branco/erro), com apresentação coerente com a sessão (pública/privada), textos i18n pt/en e ação para voltar ao início.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Rota catch-all renderiza a página 404 para URLs desconhecidas.
- [ ] Layout/estado condizente com sessão autenticada vs pública.
- [ ] Textos via i18n (pt/en) e CTA "voltar ao início" funcional.
- [ ] Sem regressão nas rotas existentes (nenhuma rota válida cai no 404).
