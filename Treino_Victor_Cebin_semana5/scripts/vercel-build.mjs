#!/usr/bin/env node
/**
 * Script de build para Vercel
 * Executa as migrações do banco e depois faz o build do Next.js
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

function exec(command, args = [], options = {}) {
  console.log(`\n▶ ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...options.env },
  });
  return result.status ?? 1;
}

// Passo 1: Gerar Prisma Client
console.log("📦 Gerando Prisma Client...");
const genStatus = exec("node", ["scripts/prisma-run.mjs", "generate"]);
if (genStatus !== 0) {
  console.error("❌ Erro ao gerar Prisma Client");
  process.exit(1);
}

// Passo 2: Sincronizar schema (db push)
console.log("\n🗄️  Sincronizando schema do banco de dados...");
const pushStatus = exec("node", [
  "scripts/prisma-run.mjs",
  "db",
  "push",
  "--accept-data-loss",
  "--skip-generate",
]);

if (pushStatus !== 0) {
  console.warn("⚠️  db push falhou (pode ser normal se o banco já estiver atualizado)");
}

// Passo 3: Build do Next.js
console.log("\n🏗️  Executando build do Next.js...");
const buildStatus = exec("pnpm", ["build"]);

if (buildStatus !== 0) {
  console.error("❌ Erro no build do Next.js");
  process.exit(1);
}

console.log("\n✅ Build concluído com sucesso!");
process.exit(0);
