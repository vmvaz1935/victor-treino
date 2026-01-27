import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

// Executa db push primeiro (ignora erros)
console.log("Executando db push...");
const dbPushResult = spawnSync(
  "node",
  ["scripts/prisma-run.mjs", "db", "push", "--accept-data-loss"],
  {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

// Continua mesmo se db push falhar
if (dbPushResult.status !== 0) {
  console.warn("db push falhou, mas continuando com o build...");
}

// Executa next build
console.log("Executando next build...");
const buildResult = spawnSync("pnpm", ["build"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(buildResult.status ?? 1);
