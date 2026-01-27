# Como Executar Migrações do Banco de Dados no Vercel

## Problema
Se você está vendo erro 404, provavelmente o banco de dados não tem as tabelas criadas.

## Solução: Executar Migrações Manualmente

### Opção 1: Via Neon Console (Mais Fácil)

1. Acesse: https://vercel.com/vitor-s-projects-cf640db2/victor-treino/stores
2. Clique no banco de dados "joao-dias"
3. Clique em **"Open in Neon"** ou **"Query"**
4. No console SQL, execute:

```sql
-- Primeiro, verifique se as tabelas já existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Se não existirem, você precisará executar o schema do Prisma
-- Ou usar o comando db push localmente
```

### Opção 2: Via Vercel CLI (Recomendado)

1. Instale o Vercel CLI (se ainda não tiver):
   ```bash
   npm i -g vercel
   ```

2. Faça login:
   ```bash
   vercel login
   ```

3. Baixe as variáveis de ambiente:
   ```bash
   cd C:\Users\mvito\Treino_Victor_Cebin_semana5
   vercel env pull .env.local
   ```

4. Execute as migrações:
   ```bash
   # Configure a DATABASE_URL do .env.local
   $env:DATABASE_URL = (Get-Content .env.local | Select-String "DATABASE_URL").ToString().Split("=")[1]
   
   # Execute db push (cria as tabelas)
   pnpm db:push
   ```

### Opção 3: Configurar Build Command no Vercel

1. Acesse: https://vercel.com/vitor-s-projects-cf640db2/victor-treino/settings/build-and-deployment
2. Em **Build Command**, altere para: `pnpm vercel-build`
3. Salve e faça um novo deploy

## Verificação

Após executar as migrações, acesse:
- https://victor-treino.vercel.app

A página deve carregar normalmente (mesmo que sem dados ainda).

## Próximos Passos

Após criar as tabelas, você pode importar os dados:
```bash
# Localmente, com DATABASE_URL do Vercel configurada
pnpm import:data
```
