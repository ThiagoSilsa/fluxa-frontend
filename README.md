<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20desenvolvimento-FFB020?style=flat-square" alt="Status">
</p>

# Fluxa — Frontend Web

Aplicação **web (SPA)** do sistema **Fluxa** para **controle de acesso de veículos**: tela de portaria (entrada/saída), ocupação, solicitações e bloqueios, além das telas de gerenciamento (usuários, cargos, veículos, departamentos, portarias, dispositivos e importações).

> Este repositório contém **apenas o frontend** do Fluxa. As convenções de arquitetura e de contribuição estão no [`AGENTS.md`](./AGENTS.md).

---

## 🧰 Stack e tecnologias

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TanStack](https://img.shields.io/badge/TanStack-30A9DE?style=for-the-badge&logo=tanstack&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26A69A?style=for-the-badge&logo=i18next&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

| Tecnologia | Finalidade |
|---|---|
| **React 19** + **TypeScript** | Interface e linguagem (modo estrito) |
| **TanStack Start** (Vite) | Meta-framework de aplicação sobre Vite (modo SPA) |
| **TanStack Router** | Roteamento file-based com árvore de rotas gerada |
| **TanStack Query** | Cache/estado de dados no servidor (hooks de query/mutation) |
| **Tailwind CSS v4** | Estilização utilitária |
| **shadcn/ui + Radix UI** | Componentes de interface acessíveis |
| **React Hook Form + Zod** | Formulários e validação (schemas) |
| **i18next / react-i18next** | Internacionalização (pt / en) com detecção de idioma |
| **Recharts** | Gráficos e dashboards |
| **lucide-react** | Ícones |
| **sonner** | Notificações (toasts) |
| **next-themes** | Tema claro/escuro |
| **Vitest** | Testes unitários |

---

## ✨ O que este projeto faz

Organizado em **rotas públicas** (login) e **rotas privadas** (autenticadas, protegidas por guardas e permissões):

- **Início** — home do usuário autenticado;
- **Portaria** — registro de entrada/saída de veículos;
- **Ocupação** — visão da ocupação/vagas;
- **Solicitações** e **Bloqueios** — fluxos de acesso de veículos/motoristas não cadastrados;
- **Gerenciamento** — usuários, cargos, tipos de veículo, veículos, departamentos, portarias, dispositivos e importações.

Cada item de navegação é exibido conforme a permissão do usuário (espelho do domínio de permissões).

---

## 📁 Estrutura do projeto

```
src/
├── app/                         # Configuração global da aplicação
│   ├── config/                  # Variáveis de ambiente (EnvConfig)
│   ├── guards/                  # Proteções de rota e autenticação
│   ├── integrations/            # Integrações externas
│   ├── layouts/                 # Layouts raiz
│   ├── providers/               # Providers (auth, linguagem, tema, query)
│   └── router/                  # Configuração do TanStack Router
├── features/                    # Funcionalidades/domínios (feature-based)
│   └── <feature>/
│       ├── components/  hooks/  i18n/  lib/  mappers/
│       ├── pages/       routes/ schemas/  services/  types/
│       └── config/      utils/
├── shared/                      # Código reutilizável
│   ├── components/  controller/  enum/  hoc/  hooks/
│   ├── i18n/         lib/  schemas/  services/  types/  utils/
├── widgets/                     # Composições (ex.: main-layout)
├── routes/                      # File-based routing do TanStack Router
│   ├── __root.tsx / _public/    # Rotas públicas
│   └── _private/                # Rotas autenticadas
├── styles/globals.css           # Estilos globais
├── routeTree.gen.ts             # Árvore de rotas gerada (tsr generate)
└── router.tsx
```

> Arquitetura **feature-based**: cada feature é autocontida e **não pode importar outra feature**. Convenções detalhadas no [`AGENTS.md`](./AGENTS.md).

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- **Node.js** LTS e **npm**

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Variáveis disponíveis:

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API consumida pela aplicação |
| `VITE_USE_MOCK` | `true` para usar dados mockados (sem API) |

### 3. Inicie em modo desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento sobe em `http://localhost:3001`.

---

## 🧪 Scripts úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 3001) |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier + ESLint `--fix` |
| `npm run check` | Verificação do Prettier (`prettier --check`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Testes unitários (Vitest) |
| `npm run generate-routes` | Regenera a árvore de rotas do TanStack Router |

---

## 🌍 Internacionalização

O projeto suporta **português (`pt`) e inglês (`en`)** via i18next, com detecção automática de idioma e seletor na interface. As traduções são organizadas por namespace em `shared/i18n/` e por feature (`<feature>/i18n/`); toda nova chave deve ser registrada em `shared/i18n/index.ts`.

---

## 📚 Documentação do projeto

- **Convenções de código e arquitetura** (feature-based, nomenclatura, testes obrigatórios, checklist de contribuição): [`AGENTS.md`](./AGENTS.md)
- **Idiomas**: `src/shared/i18n/locales/` (`pt.json`, `en.json`)
- **Configuração visual**: `tailwind.config.js` e `components.json` (shadcn/ui)

---

## 📄 Licença

Distribuído sob a licença **MIT** — veja o arquivo [`LICENSE`](./LICENSE).
