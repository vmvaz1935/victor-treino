import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
export { ApiError } from "@/lib/api-error";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true as const, data }, init);
}

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false as const, error: { message, details } },
    { status },
  );
}

export function handleRouteError(err: unknown) {
  if (err instanceof ApiError) return jsonError(err.status, err.message, err.details);
  if (err instanceof z.ZodError) return jsonError(400, "Dados inválidos.", err.flatten());
  
  // Tratamento específico para erros do Prisma
  if (err && typeof err === "object" && "code" in err) {
    const prismaError = err as { code?: string; message?: string };
    
    // Erro de tabela não encontrada ou schema não sincronizado
    if (prismaError.code === "P2021" || prismaError.code === "P2025") {
      console.error("Erro do Prisma (tabela não encontrada):", prismaError.message);
      return jsonError(
        503,
        "Banco de dados não configurado. Execute as migrações do banco de dados.",
        { code: prismaError.code },
      );
    }
    
    // Erro de conexão com o banco
    if (prismaError.code === "P1001" || prismaError.code === "P1017") {
      console.error("Erro de conexão com o banco:", prismaError.message);
      return jsonError(503, "Erro de conexão com o banco de dados.", { code: prismaError.code });
    }
  }
  
  console.error("Erro não tratado:", err);
  return jsonError(500, "Erro interno.");
}


