Você é um Desenvolvedor Full Stack + Product Designer sênior. Gere um repositório completo (pronto para GitHub) que cria uma WEB APP INTERATIVA para visualizar e registrar o **treino do paciente João Dias Neto**, com a observação: **Prescrição Fisioterapeuta Vitor Vaz**. Além de implementar frontend + backend + banco + deploy no Vercel, você DEVE criar um design system moderno e consistente e aplicar o design em todas as páginas.

========================
0) ARQUIVOS DE ENTRADA
========================
Colocar no projeto em /data:

1) /data/Biblioteca_Exercicios.xlsx
   - Aba principal: “Biblioteca” (pode ignorar “Listas”)

2) /data/Treino_8semanas.xlsx
   - Abas: “Calendário”, “Parâmetros”, “Plano 8 Semanas”, “Sessões (referência)”

========================
1) OBJETIVO DO PRODUTO
========================
Um app web para:
1) Explorar a biblioteca de exercícios (busca + filtros)
2) Ver o programa de 8 semanas (macro/micro) com calendário semanal (Seg/Qua/Sex e deload)
3) Abrir uma sessão e registrar execução por exercício: carga (kg), reps feitas, RIR real, notas
4) Persistir dados (backend + banco)
5) Mostrar progresso (sessões por semana; volume semanal por grupo; últimas cargas por exercício)
6) Documentação completa para GitHub + deploy no Vercel

========================
2) STACK (OBRIGATÓRIO)
========================
- Next.js 14+ (App Router) + TypeScript
- UI: TailwindCSS + shadcn/ui (obrigatório) + lucide-react (ícones)
- Estado de dados: TanStack Query (React Query)
- Validação: Zod
- Backend: Route Handlers (/app/api/...)
- Banco: Postgres + Prisma ORM
  - Dev: Postgres via Docker (preferido) OU SQLite (se escolher, documente bem)
  - Produção: Vercel Postgres (documentar passo-a-passo)
- Importação/seed: script Node/TS lendo os .xlsx e populando o banco (xlsx/SheetJS)

========================
3) DESIGN (ADEQUAÇÃO DO PROMPT DE UI)
========================
Você também é especialista em design de interfaces web modernas e responsivas.

CONTEXTO DE DESIGN:
- Aplicação web para treino/hipertrofia (Workout Tracker)
- Estilo: moderno, limpo, profissional, com gradientes suaves
- Fonte: Inter (Google Fonts via next/font/google)
- Paleta principal (usar em tokens CSS e no tema do shadcn):
  - Primary: #00A6A6
  - Primary Dark: #006D77
  - Primary Light: #E0F7F7
  - Background: #F8FAFB
  - Text Dark: #111827
  - Text Muted: #6B7280
  - Success: #16A34A
  - Warning: #F59E0B
  - Danger: #EF4444
- Layout mobile-first, com breakpoints (sm/md/lg/xl)
- Componentes com:
  - Cards com sombras suaves
  - Botões com gradientes e estados hover/focus/disabled/loading
  - Microinterações e transições suaves (Tailwind + opcional framer-motion se realmente necessário)
  - Feedback visual (toast, badge, skeleton, empty states)
  - Acessibilidade (labels, ARIA, contraste, focus ring claro, navegação por teclado)

ENTREGÁVEIS DE DESIGN (no repositório):
1) /docs/DESIGN_SYSTEM.md explicando:
   - tokens (cores, tipografia, espaçamento, radius, shadow)
   - componentes base (Button, Card, Input, Table, Badge, Tabs, Dialog, Toast)
   - estados (loading, error, empty)
   - padrões de layout (grid, header, sidebar opcional)
2) Implementar tokens em:
   - app/globals.css com CSS variables (padrão shadcn)
   - tailwind.config (se precisar mapear tokens)
3) Garantir consistência visual em todas as páginas descritas abaixo.

REQUISITOS VISUAIS (aplicar em tudo):
- Bordas arredondadas: radius 16px (padrão) e 12px (inputs)
- Sombras: suaves (cards) e levemente mais forte em hover
- Gradientes:
  - Botões primários: linear-gradient(135deg, #00A6A6, #006D77)
  - Destaques de header: background com gradiente leve + blur sutil (sem exagerar)
- Espaçamento generoso (padding 16–24; gaps coerentes)
- Tabelas legíveis (zebra opcional, sticky header quando longo)
- Formulários com validação visual (erro, sucesso, helper text)
- Dark mode (opcional, mas se implementar, faça bem com tokens; se não, não implemente)

========================
4) REQUISITOS FUNCIONAIS
========================
4.1) Importação XLSX
- Criar `scripts/import-xlsx.ts` (ou `prisma/seed.ts`) que:
  - Lê “Biblioteca” => Exercise
  - Lê “Plano 8 Semanas” => PlanExercise (template)
  - Lê “Calendário” e “Parâmetros” => PlanWeekSettings
- Deve ser idempotente (rodar 2x não duplica)
- Comandos:
  - `pnpm import:data`
  - `pnpm db:push` ou `pnpm prisma:migrate` (documentar)

4.2) Prisma Models (mínimos; ajuste se necessário)
- Exercise:
  - id (int) = “ID” da planilha
  - name, group, movementPattern, equipment
  - primaryMuscles, secondaryMuscles
  - tempoSuggested, variationEasier, variationHarder
  - checklist, notes
- Plan:
  - id, name, createdAt
- PlanWeekSettings:
  - id, planId, weekNumber
  - blockFocus, setsDefault, repsTargetText, rirTargetText, restText, tempoText, notes
- PlanExercise:
  - id, planId, weekNumber
  - day (enum: SEG | QUA | SEX)
  - sessionCode (A|B|C|D|DELOAD)
  - sessionNumber (opcional)
  - exerciseId (FK)
  - sets, repsTarget, rirTarget, rest, tempo
- UserSession (anon):
  - id (uuid), createdAt
- WorkoutLog:
  - id, userSessionId, planId
  - weekNumber, day, sessionCode
  - completedAt (nullable)
- WorkoutSetLog:
  - id, workoutLogId
  - exerciseId, setNumber
  - weightKg (decimal), repsDone (int), rirActual (int nullable), notes (text)
  - updatedAt

4.3) Identidade sem login
- Na primeira visita, gerar UUID e guardar em cookie (httpOnly preferido) e/ou localStorage.
- APIs usam esse UUID como userSessionId.

4.4) Endpoints (Route Handlers + Zod em tudo)
- GET /api/plan
- GET /api/plan/week/[weekNumber]
- GET /api/exercises?search=&group=&equipment=&pattern=
- GET /api/exercises/[id]
- POST /api/workouts/start
- GET /api/workouts/[workoutLogId]
- POST /api/workouts/[workoutLogId]/set (upsert)
- POST /api/workouts/[workoutLogId]/complete
- GET /api/stats

========================
5) FRONTEND (PÁGINAS E UX)
========================
Tudo em PT-BR, responsivo, acessível.

Rotas:
- / (Dashboard)
  - Definir data de início do mesociclo
  - Semana atual calculada pela data
  - Cards: “Sessões concluídas”, “Semana atual”, “Próxima sessão”
  - Lista “Últimos treinos” (com status)
- /plan
  - Accordion das 8 semanas (foco + parâmetros)
- /plan/week/[weekNumber]
  - Grade Seg/Qua/Sex
  - Deload (semanas 4 e 8): só Seg e Sex; Qua mostra “—”
  - CTA para abrir sessão
- /workout/[weekNumber]/[day]/[sessionCode]
  - Lista de exercícios (Card por exercício)
  - Prescrição: sets/reps/RIR/rest/tempo
  - Botão “Ver técnica” abre Drawer/Dialog com ficha do exercício (dados do Exercise)
  - Tabela de sets com inputs (peso, reps, RIR, notas)
  - Autosave com debounce + indicador “Salvo”
  - “Finalizar sessão” (marca completedAt) + confirmação
- /exercises
  - Busca + filtros (grupo, equipamento, padrão) com chips/badges
  - Lista em cards/rows com preview (músculos principais)
- /exercises/[id]
  - Ficha completa (checklist em bullets; variações; cadência)
- /stats
  - Gráficos (recharts):
    - Volume semanal por grupo (sets * repsDone; se reps vazio, usar alvo)
    - Sessões concluídas por semana
    - Histórico de carga por exercício (últimas 5)

UX obrigatória:
- Toast para ações (salvo/erro/finalizado)
- Skeleton em carregamentos
- Empty states bem desenhados (ex.: “Sem logs ainda”)
- Form validation (Zod) com mensagens claras
- Focus ring visível e consistente

========================
6) QUALIDADE E ENGENHARIA
========================
- ESLint + Prettier
- Sem “any”; tipagem forte
- Separar DB layer (lib/prisma.ts), services e handlers
- React Query com cache keys consistentes
- Tratamento de erros (status codes + mensagens)

========================
7) DOCUMENTAÇÃO GITHUB (OBRIGATÓRIO)
========================
Gerar:
- README.md completo:
  - Visão geral, features, stack
  - Rodar local (passo-a-passo)
  - Importação XLSX (onde colocar, comandos)
  - DB (Docker/Postgres), migrations/seed
  - Endpoints principais
  - Estrutura de pastas
  - Deploy no Vercel (passo-a-passo + Vercel Postgres)
  - .env.example
  - Troubleshooting (Prisma/Vercel/Postgres)
- LICENSE (MIT)
- CONTRIBUTING.md (simples)
- CHANGELOG.md (inicial)
- docs/DESIGN_SYSTEM.md (obrigatório)

========================
8) DEPLOY NO VERCEL (OBRIGATÓRIO)
========================
- Preparar para deploy “1-click”
- Documentar:
  - Criar Vercel Postgres, setar DATABASE_URL
  - Prisma generate no build
  - Migrations (como rodar)
  - Variáveis de ambiente
- Incluir vercel.json apenas se necessário

========================
9) CRITÉRIOS DE ACEITAÇÃO
========================
Local:
1) pnpm i
2) subir DB (Docker) ou configurar SQLite (se escolhido)
3) pnpm import:data
4) pnpm dev
E no app:
- Ver biblioteca + detalhes
- Ver plano 8 semanas
- Abrir sessão, registrar sets, persistir e recarregar
- Ver stats básicos
- UI consistente com design system, responsiva e acessível

ENTREGA FINAL
- Crie TODOS os arquivos do projeto (schema, scripts, rotas, páginas, componentes, docs).
- Forneça também um resumo final:
  - comandos principais
  - checklist de deploy Vercel
  - onde colocar as planilhas (.xlsx)
  - explicação breve do design system (tokens e componentes-chave)
