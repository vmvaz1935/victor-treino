# Script para configurar variáveis de ambiente no Vercel
# Execute após criar o banco de dados PostgreSQL no dashboard

Write-Host "Configurando variáveis de ambiente no Vercel..." -ForegroundColor Green

# Solicitar DATABASE_URL
$databaseUrl = Read-Host "Cole a DATABASE_URL do banco PostgreSQL criado no Vercel"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "DATABASE_URL não fornecida. Abortando." -ForegroundColor Red
    exit 1
}

# Adicionar DATABASE_URL
Write-Host "Adicionando DATABASE_URL..." -ForegroundColor Yellow
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Adicionar VERCEL=1
Write-Host "Adicionando VERCEL=1..." -ForegroundColor Yellow
echo "1" | vercel env add VERCEL production
echo "1" | vercel env add VERCEL preview
echo "1" | vercel env add VERCEL development

Write-Host "`nVariáveis de ambiente configuradas!" -ForegroundColor Green
Write-Host "Execute as migrações do banco de dados:" -ForegroundColor Yellow
Write-Host "  vercel env pull .env.local" -ForegroundColor Cyan
Write-Host "  pnpm db:migrate:deploy" -ForegroundColor Cyan
Write-Host "`nDepois, faça um novo deploy:" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor Cyan
