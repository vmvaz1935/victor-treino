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
  console.error(err);
  return jsonError(500, "Erro interno.");
}


