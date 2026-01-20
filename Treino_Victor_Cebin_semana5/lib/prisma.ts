import { PrismaClient } from "@prisma/client";
import path from "node:path";

declare global {
  var __prisma: PrismaClient | undefined;
}

function resolveSqliteUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  // Prisma sqlite suporta `file:./relative.db` e `file:C:/abs/path.db`
  if (!url.startsWith("file:")) return url;

  // Normaliza apenas o caso relativo (o que mais quebra em Windows/Next dev).
  // Exemplos: file:./prisma/dev.db, file:../dev.db
  const rest = url.slice("file:".length);
  const isRelative = rest.startsWith("./") || rest.startsWith("../");
  if (!isRelative) return url;

  // Por convenção do Prisma, `file:./...` costuma ser relativo ao diretório do schema (`prisma/`).
  // Para ficar resiliente, se o usuário já incluiu `./prisma/`, resolve a partir da raiz;
  // caso contrário, resolve a partir de `<root>/prisma`.
  const baseDir = rest.startsWith("./prisma/") || rest.startsWith(".\\prisma\\")
    ? process.cwd()
    : path.join(process.cwd(), "prisma");
  const absPath = path.resolve(baseDir, rest);
  // Prisma espera separador `/` dentro da URL
  return `file:${absPath.replace(/\\/g, "/")}`;
}

function createPrismaClient() {
  const url = resolveSqliteUrl(process.env.DATABASE_URL);
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // Só faz override quando há DATABASE_URL. Em build (sem env), não passamos `datasources`.
    ...(url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
  });
}

let client: PrismaClient | undefined = globalThis.__prisma;

// Proxy lazy: evita crash no build quando `DATABASE_URL` ainda não está definido no Vercel.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    if (!client) {
      client = createPrismaClient();
      if (process.env.NODE_ENV !== "production") globalThis.__prisma = client;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (client as any)[prop];
  },
});


