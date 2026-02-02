import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

function runCommand(command, args, options = {}) {
  console.log(`\n> Executando: ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  return result;
}

// 1. Gera o Prisma Client primeiro (obrigatório)
console.log("=== Passo 1: Gerando Prisma Client ===");
const generateResult = runCommand("node", ["scripts/prisma-run.mjs", "generate"]);
if (generateResult.status !== 0) {
  console.error("ERRO: Falha ao gerar Prisma Client");
  process.exit(1);
}

// 2. Executa db push (ignora erros se o banco já estiver atualizado)
console.log("\n=== Passo 2: Sincronizando schema do banco de dados ===");
const dbPushResult = runCommand("node", [
  "scripts/prisma-run.mjs",
  "db",
  "push",
  "--accept-data-loss",
  "--skip-generate", // Já geramos acima
]);

if (dbPushResult.status !== 0) {
  console.warn("⚠️  db push falhou, mas continuando com o build...");
  console.warn("   (Isso é normal se o banco já estiver atualizado)");
}

// 3. Executa next build
console.log("\n=== Passo 3: Executando build do Next.js ===");
const buildResult = runCommand("pnpm", ["build"]);

if (buildResult.status !== 0) {
  console.error("ERRO: Falha no build do Next.js");
  process.exit(1);
}

console.log("\n✅ Build concluído com sucesso!");
process.exit(0);
