# AGENTS.md

# 1. Projeto/Stack & Ambiente

- Tecnologias: React, TypeScript, TanStack Start, TanStack Router, TanStack Query, React Hook Form, Zod, TailwindCSS, shadcn/ui, i18next.
- Package Manager: npm (Sempre rode `npm run format` and `npm run test` antes de finalizar)
- **NUNCA modificar `src/styles/globals.css`** — variáveis CSS customizadas devem ser evitadas; prefira cores nativas do Tailwind (ex.: `amber-500`, `red-500`, `gray-400`).
- Demais orientações em arquivos específicos em `src/shared/docs`

---

# 2. Arquitetura && Convenções

O projeto segue arquitetura Feature-Based. Estrutura principal:

```txt
src/
├── app/                         # Configuração global da aplicação
│   ├── config/                  # Variáveis de ambiente e configurações globais
│   ├── guards/                  # Proteções de rota e autenticação
│   ├── integrations/            # Integrações com bibliotecas externas
│   ├── layouts/                 # Layouts raiz da aplicação
│   ├── providers/               # Context providers (Auth, Theme, Query, etc.)
│   └── router/                  # Configuração central do TanStack Router
│
├── features/                    # Funcionalidades/domínios da aplicação
│   └── nome-da-feature/
│       ├── components/          # Componentes visuais exclusivos da feature
│       ├── hooks/               # Hooks React da feature (query, mutation, handlers)
│       ├── i18n/                # Traduções da feature
│       ├── mappers/             # Transformação entre Form, Payload, Entity e ViewModel
│       ├── pages/               # Páginas da feature (orquestração)
│       ├── routes/              # Configuração de rotas da feature
│       ├── lib/                 # Regras de negócio da feature
│       ├── schemas/             # Schemas Zod da feature
│       ├── services/            # Comunicação HTTP da feature
│       └── types/               # Tipagens da feature
│
├── shared/                      # Código reutilizável por toda a aplicação
│   ├── assets/                  # Imagens, ícones e arquivos estáticos
│   ├── components/              # Componentes reutilizáveis globais
│   ├── controller/              # Camada HTTP base (fetch, headers, auth, etc.)
│   ├── docs/                    # Documentação técnica para equipe e IA
│   ├── enum/                    # Enums compartilhados
│   ├── hoc/                     # Higher Order Components
│   ├── hooks/                   # Hooks reutilizáveis entre features
│   ├── lib/                     # Regras de negócio compartilhadas da aplicação
│   ├── mappers/                 # Mappers compartilhados (somente se realmente genéricos)
│   ├── utils/                   # Funções puramente utilitárias e independentes do domínio da aplicação;
│   ├── schemas/                 # Schemas compartilhados
│   └── types/                   # Tipagens compartilhadas
│
├── widgets/                     # Composição de múltiplos componentes/features
│   └── nome-do-widget/
│       ├── components/          # Componentes internos do widget
│       ├── hooks/               # Hooks específicos do widget
│       ├── i18n/                # Traduções do widget
│       ├── docs/                # Documentação do widget
│       ├── lib/                 # Regras de negócio do widget
│       ├── services/            # Serviços exclusivos do widget (caso necessário)
│       └── types/               # Tipagens do widget
│
├── routes/                      # File-based routing do TanStack Router
│                                # Apenas definição das rotas da aplicação
│
├── i18n/                        # Configuração global de internacionalização
│                                # Registro de namespaces e idiomas
│
└── styles/                      # Estilos globais da aplicação
```

- Não pode haver dependencias entre features;
- Use o namming convention como unit.service.ts, unit.mapper.ts, unit.schema.ts;

---

# 3. Estilo && Regras

- Não deve ser criado estilos em globals.css
- Nome dos arquivos em kebab-case, lowercase, separado por pontos `unit-management.mapper.ts`
- Não chamar API diretamente em componentes
- Não colocar lógica de negócio em componentes visuais
- Não colocar react em services
- Não colocar feature dentro de shared
- Não duplicar componentes genéricos
- Não usar strings hardcoded
- Não quebrar arquitetura Feature-Based.
- Não mover responsabilidades entre camadas.
- Não adicionar dependências desnecessárias.
- Não possuir importações entre features.
- Sempre reutilizar padrões existentes.
- Sempre manter tipagem forte.
- Sempre utilizar TypeScript estrito.
- Sempre manter suporte a i18n.
- Sempre considerar permissões.
- Sempre registrar nova chave de tradução em shared/i18n/index.ts.
- Sempre documentar imports.
- Sempre extrair types e constantes do componentes.
- Cada componente deve ter responsabilidade única;

---

# 4. Segurança

- Não utilizar variaveis de ambiente ou tokens hardcoded;

---

# 5. Testes Obrigatórios

- **Toda `lib/` e `mapper/` criada deve possuir um arquivo de teste unitário correspondente** (ex.: `business-hours.lib.ts` → `business-hours.lib.test.ts`, `my.mapper.ts` → `my.mapper.test.ts`).
- Testes devem cobrir fluxo principal, edge cases (valores vazios, nulos, limites) e cenários de erro.

---

# 6. Checklist antes de finalizar

- [ ] Possui tipagem forte
- [ ] Possui i18n
- [ ] Possui permissões
- [ ] Seguiu arquitetura feature-based
- [ ] Não criou dependência entre features
- [ ] Toda lib/mapper possui teste unitário
- [ ] Adicionou testes quando necessário
- [ ] Atualizou documentação se necessário

---
