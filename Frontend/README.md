# Estoque — Front-end (Angular)

Interface do sistema de estoque e produtos. A visão geral do projeto, a arquitetura e a API estão no [README da raiz](../README.md).

## Stack

Angular 21 (standalone, signals, OnPush, formulários reativos), Tailwind CSS 4 e Montserrat. Identidade visual: verde `#009579` e preto.

## Como executar

```bash
npm install
npm start        # http://localhost:4200
```

A API precisa estar no ar. Em desenvolvimento o front consome `http://localhost:5046/api` (`src/environments/environment.development.ts`); em produção usa `/api`. Usuário inicial: `admin@estoque.com` / `Admin@12345`.

## Scripts

| Comando          | O que faz                                |
| ---------------- | ---------------------------------------- |
| `npm start`      | Servidor de desenvolvimento              |
| `npm run build`  | Build de produção                        |
| `npm test`       | Testes unitários (Vitest, via `ng test`) |
| `npx eslint src` | Lint (TypeScript e templates, com a11y)  |

## Estrutura

```
src/app/
├── core/       API (serviços HTTP), autenticação (guards, interceptor), modelos
├── layout/     Shell (sidebar + header) e menu do usuário
├── shared/     Componentes, pipes e utilitários reutilizáveis
└── features/   Telas por domínio: login, products, movements, reservations, categories, users
```

Componentes compartilhados: `app-alert`, `app-page-header`, `app-search-field`, `app-form-actions`, `app-chart` (Chart.js), `app-modal`, `app-confirm-dialog`, `app-pagination`, `app-badge`, `app-toast` e o botão `appButton` (variantes `primary`, `add`, `secondary`, `ghost`, `danger`). Pipes: `quantity` e `unitLabel`.

## Convenções

- Modificadores de acesso explícitos, tipos de retorno explícitos, interfaces com prefixo `I` e campos privados com `_` (impostos pelo ESLint).
- Tokens de cor em `src/styles.css` (`brand-*`, `text-muted`, `danger*`, `line`); evite cores cruas nos templates.
- Permissões por perfil (Administrador, Operador, Consultor) refletem as políticas da API; a API continua sendo a fonte da verdade.
