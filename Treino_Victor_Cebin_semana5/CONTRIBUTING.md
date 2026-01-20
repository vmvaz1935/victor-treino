# Contribuindo

Obrigado por contribuir!

## Como rodar localmente
1) Instale dependências:

```bash
pnpm i
```

2) Configure `DATABASE_URL` (SQLite dev):

```powershell
$env:DATABASE_URL="file:./dev.db"
```

3) Sincronize DB e importe dados:

```bash
pnpm db:push
pnpm import:data
pnpm dev
```

## Padrões
- TypeScript strict (evitar `any`)
- Componentes reutilizáveis em `components/`
- API em `app/api/*` com validação Zod
- Formatação:
  - `pnpm format`
  - `pnpm lint`
  - `pnpm typecheck`

## Pull Requests
- Descreva o que mudou e por quê
- Inclua passos para testar

# Contribuindo

Obrigado por querer melhorar o projeto!

## Setup
1) Instale dependências:

```bash
pnpm i
```

2) Configure `DATABASE_URL` (SQLite em dev):
- Ex.: `file:./prisma/dev.db`

3) Suba o schema:

```bash
pnpm db:push
```

4) Importe as planilhas em `data/`:

```bash
pnpm import:data
```

5) Rode:

```bash
pnpm dev
```

## Padrões
- TypeScript estrito (sem `any`)
- Zod nos endpoints
- UI em PT-BR
- Preferir componentes shadcn/ui

## Verificações
```bash
pnpm lint
pnpm typecheck
```


