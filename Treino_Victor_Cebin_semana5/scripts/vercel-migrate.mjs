#!/usr/bin/env node
/**
 * Script para executar migrações no Vercel
 * 
 * Uso:
 *   node scripts/vercel-migrate.mjs
 * 
 * Este script executa as migrações do Prisma no banco de dados PostgreSQL
 * configurado no Vercel. Requer que DATABASE_URL esteja configurada.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const schemaPath = "prisma/schema.postgres.prisma";
const prismaBin = path.resolve(
  process.cwd(),
  process.platform === "win32" ? "node_modules/.bin/prisma.CMD" : "node_modules/.bin/prisma"
);

console.log("Executando migrações do Prisma...");
console.log(`Schema: ${schemaPath}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "✓ Configurada" : "✗ Não configurada"}\n`);

const args = ["migrate", "deploy", "--schema", schemaPath];

if (process.platform === "win32") {
  const cmd = [`"${prismaBin}"`, ...args].join(" ");
  const result = spawnSync(cmd, { stdio: "inherit", shell: true });
  process.exit(result.status ?? 1);
} else {
  const result = spawnSync(prismaBin, args, { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
