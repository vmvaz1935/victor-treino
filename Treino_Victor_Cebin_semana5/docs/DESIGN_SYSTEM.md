# Design System — Treino João Dias Neto

Este documento descreve os **tokens**, **componentes base** e **padrões de layout** usados no app do **treino do paciente João Dias Neto** (Prescrição: **Fisioterapeuta Vitor Vaz**).

## Tokens

### Cores (CSS variables)
- **Primária**: `#00A6A6` (`--primary`)
- **Primária dark**: `#006D77` (usada em gradiente e `--secondary-foreground`)
- **Primária light**: `#E0F7F7` (`--secondary` / `--accent`)
- **Background**: `#F8FAFB` (`--background`)
- **Texto**: `#111827` (`--foreground`)
- **Texto muted**: `#6B7280` (`--muted-foreground`)
- **Success**: `#16A34A` (`--success`)
- **Warning**: `#F59E0B` (`--warning`)
- **Danger**: `#EF4444` (`--destructive`)

Implementação: [`app/globals.css`](../app/globals.css)

### Tipografia
- **Fonte base**: Inter (via `next/font/google`) com variável `--font-inter`.

Implementação: [`app/layout.tsx`](../app/layout.tsx)

### Radius e sombras
- **Radius padrão (cards)**: 16px
- **Radius inputs**: 12px
- **Sombra card**: `.shadow-card` e `.shadow-card-hover`

Implementação: [`app/globals.css`](../app/globals.css)

### Gradientes
- **Botão primário**: `linear-gradient(135deg, #00A6A6, #006D77)` via util `.bg-gradient-primary`.

Implementação: [`app/globals.css`](../app/globals.css)

## Componentes base (shadcn/ui)
Componentes instalados em [`components/ui`](../components/ui):
- **Button**: CTA e ações (primária com `.bg-gradient-primary` + estados)
- **Card**: containers principais
- **Input / Textarea / Label / Select**: formulários
- **Table**: sets e listagens
- **Badge**: chips/labels de status
- **Tabs / Accordion**: organização do plano e seções
- **Dialog / Popover**: detalhes (ex.: técnica do exercício)
- **Skeleton**: loading states
- **Sonner**: toasts (`Toaster` no layout raiz)

## Estados (UX)
- **Loading**: skeletons e placeholders consistentes
- **Empty**: mensagens claras e CTA óbvio (ex.: “Sem logs ainda”)
- **Erro**: toast + texto de apoio quando aplicável

## Padrões de layout
- **Mobile-first** (sm/md/lg/xl) com espaçamento generoso
- **Header** fixo/semifixo (quando aplicável) com ações principais visíveis
- **Cards** como unidade visual principal para sessões/exercícios
- **Acessibilidade**: labels explícitos, foco visível, navegação por teclado


