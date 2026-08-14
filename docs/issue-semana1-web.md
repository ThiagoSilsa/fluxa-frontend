---
name: Feature Request
description: Solicite uma nova funcionalidade com foco em valor, escopo e validação
title: '[Feature] Semana 1 — Fundação do front-end web: login, layout protegido, i18n e baseController'
labels: ['feature']
type: 'Feature'
---

## 📋 Sobre este template

Preencha os campos abaixo com o máximo de clareza possível. Isso ajuda o time a entender o **valor**, o **escopo** e a **validação** da funcionalidade antes de qualquer implementação.

---

## 🎯 Definição da funcionalidade

### 👤 User Story

Como usuário do sistema (administração, segurança ou presidência),
quero acessar o front-end web com login e navegar em uma área protegida,
para começar a usar as funcionalidades de gestão com segurança e organização.

### 🌍 Contexto

O sistema SOMAR (controle de acesso de veículos) está na **Fase 0 do cronograma intensivo (2 meses)**. O repositório `fluxa-frontend` tem apenas o scaffold inicial (React + TypeScript + TanStack). Não existe autenticação, layout, internacionalização nem camada de comunicação HTTP — sem isso, nenhuma tela de gestão pode ser construída, e as próximas fases (cadastros, dashboards, solicitações) dependem desta base.

### 🎯 Objetivo

Estabelecer a base do front-end web — login, área protegida, i18n e camada HTTP única — para que as próximas telas sejam construídas sobre uma estrutura consistente, seguindo a arquitetura **feature-based** documentada em `planejamento-frontend/arquitetura.md`.

---

## 🔄 Situação atual e comportamento esperado

### 🕓 Situação atual

O repositório `fluxa-frontend` contém apenas o scaffold inicial do projeto (React + TypeScript + TanStack), **sem** tela de login, **sem** proteção de rotas, **sem** i18n e **sem** serviço HTTP base. Não é possível autenticar nem acessar nenhuma tela.

### ✅ Comportamento esperado

Após a entrega, o front-end web deve:

- Apresentar **tela de login** (email/senha) que autentica na API (`POST /auth/login` do back-end) e armazena o token;
- Ter **área protegida**: rota privada que redireciona para `/login` quando o usuário não está autenticado;
- Ter **layout base** (header/navegação) para abrigar as próximas telas;
- Ter **i18n configurado** (pt/en), com todos os textos visíveis usando chaves de tradução (sem hardcode);
- Ter **camada HTTP base** (`baseController`) com Bearer token, `Content-Type`, tratamento de erro (`ApiError`) e redirecionamento automático no **401** (sessão expirada);
- Usar **cliente tipado gerado via OpenAPI** (`openapi-typescript`) nos services.

### 📐 Critérios de aceitação

- [ ] Tela de login (email/senha) autentica na API e salva o token com segurança
- [ ] Rota privada redireciona usuário não autenticado para `/login`
- [ ] Ao receber **401**, o app redireciona para login (sessão expirada) automaticamente
- [ ] Layout base (header) presente e navegação mínima funcionando
- [ ] i18n configurado com namespace(s); nenhum texto visível hardcoded (pt e en)
- [ ] `baseController` implementado (Bearer, Content-Type, `ApiError`, suporte a json/blob)
- [ ] Primeira rota privada de exemplo renderiza protegida com `withRouteAccess`
- [ ] Cliente tipado via OpenAPI gerado e usado por pelo menos 1 service
- [ ] `npm run lint`, `npm run typecheck` e testes do que for implementado passando

---

## 🧭 Planejamento

As informações abaixo ajudam o time a priorizar e dimensionar o trabalho. Preencha apenas o que for aplicável.

### 🚦 Prioridade

- [x] Alta
- [ ] Média
- [ ] Baixa

### 🗂️ Área afetada

- [ ] Backend
- [x] Frontend Web
- [ ] Aplicativo Móvel
- [ ] Infraestrutura
- [ ] Documentação
- [ ] Outro

### 🔧 Considerações técnicas (opcional)

- Seguir a arquitetura **feature-based** de `planejamento-frontend/arquitetura.md` (`app/`, `features/`, `shared/`, `widgets/`, `routes/`);
- Stack: React 19 + TypeScript (strict) + TanStack Router + TanStack Query + React Hook Form + Zod + TailwindCSS/shadcn + i18next;
- O login depende do endpoint `POST /auth/login` do **back-end (Semana 1 — back-end)**; manter o contrato alinhado via OpenAPI;
- Proteção de rota com `AuthProvider` + `withRouteAccess`; serviços via `baseController` (sem React);
- Não há dependência de tela de negócio nesta semana — apenas a fundação.

### 🔗 Referências (opcional)

- `planejamento-frontend/arquitetura.md` (arquitetura feature-based do front-end)
- `planejamento/cronograma.md` (Semana 1 — cronograma intensivo)
- Contrato da API: OpenAPI do `fluxa-backend` (`POST /auth/login`, JWT)
