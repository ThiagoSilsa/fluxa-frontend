# Domain Docs (fluxa-frontend)

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — **does not exist yet** in this repo. `/domain-modeling` (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates it lazily when terms or decisions actually get resolved.
- **ADRs**: this repo keeps them in **`docs/arquitetura/adr/`** (mirroring `fluxa-backend`), files named `NNNN-<slug-em-kebab-case>.md`, written in **Portuguese** with a mandatory plain-text header — the same format as the backend's `AGENTS.md` §8. None exist yet; they are created as decisions crystallize.
- **Technical docs (frontend conventions)**: per this repo's `AGENTS.md`, technical docs for the team and AI live under `src/shared/docs/`, with per-feature/widget `docs/` folders (UI/component/architecture notes).

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront.

## File structure

Single-context repo (no monorepo signals — no `pnpm-workspace.yaml`, no `workspaces`, no `packages/*`):

```
/
├── AGENTS.md
├── CONTEXT.md                      ← created lazily by /domain-modeling
├── docs/
│   └── arquitetura/adr/            ← ADRs (NNNN-<slug-em-kebab-case>.md, espelha fluxa-backend)
└── src/
    └── shared/docs/                ← docs técnicas (UI/componentes/arquitetura)
```

There is no `CONTEXT-MAP.md` and no per-context `src/<context>/docs/adr/` layout.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (…), but worth reopening because…_
