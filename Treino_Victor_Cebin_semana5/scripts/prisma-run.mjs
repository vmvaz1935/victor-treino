import { spawnSync } from "node:child_process";
import path from "node:path";

function getDefaultSchemaPath() {
  if (process.env.PRISMA_SCHEMA_PATH) return process.env.PRISMA_SCHEMA_PATH;

  const url = process.env.DATABASE_URL ?? "";
  const isPostgresUrl = url.startsWith("postgres://") || url.startsWith("postgresql://");

  if (process.env.VERCEL === "1" || isPostgresUrl) return "prisma/schema.postgres.prisma";
  return "prisma/schema.sqlite.prisma";
}

function getPrismaBin() {
  const binRel =
    process.platform === "win32" ? "node_modules/.bin/prisma.CMD" : "node_modules/.bin/prisma";
  return path.resolve(process.cwd(), binRel);
}

const schemaPath = getDefaultSchemaPath();
const prismaArgs = process.argv.slice(2);

if (prismaArgs.length === 0) {
  console.error(
    [
      "Uso:",
      "  node scripts/prisma-run.mjs <comando prisma...>",
      "",
      "Exemplos:",
      "  node scripts/prisma-run.mjs generate",
      "  node scripts/prisma-run.mjs db push",
      "  node scripts/prisma-run.mjs migrate dev",
      "",
      "Schema selecionado:",
      `  ${schemaPath}`,
    ].join("\n"),
  );
  process.exit(1);
}

// Adiciona --schema automaticamente se não foi passado manualmente.
if (!prismaArgs.includes("--schema")) {
  prismaArgs.push("--schema", schemaPath);
}

const prismaBin = getPrismaBin();

if (process.platform === "win32") {
  // `.CMD` não é executável direto via spawnSync sem shell no Windows.
  const cmd = [`"${prismaBin}"`, ...prismaArgs].join(" ");
  const result = spawnSync(cmd, { stdio: "inherit", shell: true });
  process.exit(result.status ?? 1);
} else {
  const result = spawnSync(prismaBin, prismaArgs, { stdio: "inherit" });
  process.exit(result.status ?? 1);
}


