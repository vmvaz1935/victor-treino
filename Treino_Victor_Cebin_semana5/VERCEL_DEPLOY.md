# Guia de Deploy no Vercel

## Pré-requisitos

1. Conta no Vercel (https://vercel.com)
2. Repositório Git configurado (GitHub, GitLab ou Bitbucket)

## Passos para Deploy

### 1. Conectar o Repositório no Vercel

1. Acesse https://vercel.com/new
2. Conecte seu repositório Git
3. Selecione o repositório do projeto

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, adicione as seguintes variáveis de ambiente:

- `DATABASE_URL`: URL do banco de dados PostgreSQL (fornecido pelo Vercel Postgres)
- `VERCEL=1`: Define que está em ambiente de produção

### 3. Configurar Build Settings

O Vercel detecta automaticamente projetos Next.js, mas certifique-se de:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (ou `npm run build`)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `pnpm install` (ou `npm install`)

### 4. Configurar Vercel Postgres (Recomendado)

1. No painel do projeto Vercel, vá em **Storage**
2. Clique em **Create Database** → **Postgres**
3. Após criar, copie a `DATABASE_URL` e adicione como variável de ambiente
4. O Prisma detectará automaticamente o PostgreSQL em produção

### 5. Executar Migrações do Banco de Dados

Após o primeiro deploy, você precisará executar as migrações:

```bash
# Via Vercel CLI (recomendado)
vercel env pull .env.local
pnpm db:migrate:deploy

# Ou via script no Vercel Dashboard
# Adicione um script de build que execute as migrações
```

### 6. Configurar Script de Build (Opcional)

Se precisar executar migrações automaticamente no build, adicione no `package.json`:

```json
{
  "scripts": {
    "vercel-build": "pnpm db:migrate:deploy && pnpm build"
  }
}
```

E configure no Vercel:
- **Build Command**: `pnpm vercel-build`

## Estrutura de Arquivos Ignorados

O `.gitignore` já está configurado para ignorar:
- `node_modules/`
- `.next/`
- `.vercel/`
- `prisma/dev.db` (banco local)
- Arquivos de ambiente `.env*`

## Comandos Úteis

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy de produção
vercel --prod

# Ver logs
vercel logs

# Abrir dashboard
vercel dashboard
```

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Certifique-se de que o Node.js versão >= 20 está configurado

### Erro de Banco de Dados
- Verifique se a `DATABASE_URL` está configurada corretamente
- Certifique-se de que as migrações foram executadas
- Verifique se o schema do Prisma está correto para PostgreSQL

### Erro de Variáveis de Ambiente
- Verifique se todas as variáveis necessárias estão configuradas no Vercel
- Use `vercel env pull` para baixar as variáveis localmente
