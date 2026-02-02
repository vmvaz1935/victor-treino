# Guia de Deploy - Vercel

## Configuração Inicial

### 1. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

- `DATABASE_URL`: URL do banco PostgreSQL (do Vercel Postgres ou Neon)
- `VERCEL=1`: Define ambiente de produção

### 2. Build Command

O Vercel está configurado para usar automaticamente o script `vercel-build` que:
1. Gera o Prisma Client
2. Sincroniza o schema do banco (`db push`)
3. Executa o build do Next.js

### 3. Criar Banco de Dados

1. Acesse: https://vercel.com/vitor-s-projects-cf640db2/victor-treino/stores
2. Crie um banco PostgreSQL (se ainda não existir)
3. Copie a `DATABASE_URL` e adicione como variável de ambiente

### 4. Primeira Migração

Na primeira vez, você pode precisar executar as migrações manualmente:

**Opção A: Via Neon Console**
1. Acesse o banco no Vercel Dashboard
2. Clique em "Open in Neon"
3. Execute o SQL do schema manualmente

**Opção B: Via CLI Local**
```bash
# Baixar variáveis de ambiente
vercel env pull .env.local

# Executar db push
pnpm db:push
```

## Deploy Automático

Após configurar, cada push para `main` fará deploy automaticamente.

O script `vercel-build` executa as migrações automaticamente durante o build.

## Troubleshooting

### Erro 404
- Verifique se o banco de dados foi criado
- Verifique se as tabelas existem (execute `db push` manualmente se necessário)
- Verifique os logs do build no Vercel Dashboard

### Erro de Build
- Verifique se `DATABASE_URL` está configurada
- Verifique se o Node.js >= 20 está configurado
- Verifique os logs do build

### Erro de Conexão com Banco
- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco está acessível
- Verifique se as credenciais estão corretas
