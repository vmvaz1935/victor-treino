# Treino — João Dias Neto

Web app para **visualizar** e **registrar** o **treino do paciente João Dias Neto** (Prescrição: **Fisioterapeuta Vitor Vaz**) a partir de **duas planilhas XLSX**, com persistência em banco via Prisma.

## Funcionalidades
- **Biblioteca de exercícios**: busca + filtros + ficha completa
- **Plano de 8 semanas**: accordion + semana (Seg/Qua/Sex) com regras de deload
- **Sessão de treino**: registrar sets (peso, reps, RIR, notas) com **autosave**
- **Stats**: gráficos (Recharts) de sessões/volume e histórico de carga
- **Sem login**: identidade anônima por cookie `mm_user_session`

## Stack
- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn/ui + lucide-react
- TanStack Query (React Query)
- Zod
- Postgres (prod) + Prisma ORM
- Dev: **SQLite**
- Importação: `xlsx` (SheetJS)

## Pré-requisitos
- Node.js 20+ (recomendado)
- pnpm (`npm i -g pnpm@9`)

## Configuração local (dev)
1) Instale dependências:

```bash
pnpm i
```

2) Crie `.env` com `DATABASE_URL` (SQLite):
- Você pode copiar de `.env.example` (seu SO/editor deve mostrar o arquivo normalmente).
- Exemplo (PowerShell):

```powershell
$env:DATABASE_URL="file:./dev.db"
```

3) Sincronize o banco (SQLite):

```bash
pnpm db:push
```

4) Coloque **as duas planilhas `.xlsx`** em `data/`:
- O importador identifica automaticamente qual é a “Biblioteca” e qual é o “Treino” pelo nome das abas.

5) Importe os dados:

```bash
pnpm import:data
```

6) Rode o app:

```bash
pnpm dev
```

Abra `http://localhost:3000`.

## Comandos principais
- **DB (dev SQLite)**:
  - `pnpm db:push`
  - `pnpm db:studio`
- **Importação XLSX**:
  - `pnpm import:data`
- **Qualidade**:
  - `pnpm lint`
  - `pnpm typecheck`

## Estrutura de pastas (resumo)
- `app/(site)` — páginas do frontend
- `app/api` — Route Handlers (backend)
- `prisma/` — schemas (sqlite/postgres) e `dev.db`
- `scripts/import-xlsx.ts` — importação idempotente
- `data/` — coloque os `.xlsx` aqui
- `docs/DESIGN_SYSTEM.md` — tokens e componentes

## Endpoints principais
- `GET /api/plan`
- `GET /api/plan/week/[weekNumber]`
- `GET /api/exercises` (+ filtros via querystring)
- `GET /api/exercises/[id]`
- `POST /api/workouts/start`
- `GET /api/workouts/[workoutLogId]`
- `POST /api/workouts/[workoutLogId]/set` (upsert)
- `POST /api/workouts/[workoutLogId]/complete`
- `GET /api/stats`

## Deploy no Vercel (checklist)
1) Suba o repo no GitHub e importe no Vercel.
   - Repo: `https://github.com/vmvaz1935/joao-dias`
2) No Vercel, crie **Vercel Postgres** e conecte ao projeto.
3) Configure a env var **`DATABASE_URL`** com a string do Postgres.
4) Prepare o banco **no Postgres** (uma vez), localmente:
   - Defina `DATABASE_URL` com a string do Postgres (Vercel).
   - Rode:

```bash
pnpm db:push
pnpm import:data
```

5) Deploy.

### Nota sobre Prisma (SQLite dev vs Postgres prod)
- Este repo mantém **dois schemas**:
  - `prisma/schema.sqlite.prisma` (dev)
  - `prisma/schema.postgres.prisma` (prod)
- Os scripts `pnpm db:*` escolhem automaticamente o schema:
  - Se `VERCEL=1` ou `DATABASE_URL` começar com `postgres://`/`postgresql://` → Postgres
  - Caso contrário → SQLite

## Troubleshooting
- **Importação falha**: confirme as abas “Biblioteca”, “Calendário”, “Parâmetros”, “Plano 8 Semanas”.
- **DB não sincroniza**: rode `pnpm db:push` com `DATABASE_URL` definido.
- **Windows/PowerShell**: evite `&&` (use comandos separados).
- **Prisma**: o projeto usa Prisma **6.x** por compatibilidade com `datasource url` no schema.
