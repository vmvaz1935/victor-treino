import { ApiError } from "@/lib/api-error";

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message: string; details?: unknown } };

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const json = (await res.json()) as Ok<T> | Err;
  if (!res.ok || !json.ok) {
    throw new ApiError(res.status || 500, json.ok ? "Erro" : json.error.message, json);
  }
  return json.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Ok<T> | Err;
  if (!res.ok || !json.ok) {
    throw new ApiError(res.status || 500, json.ok ? "Erro" : json.error.message, json);
  }
  return json.data;
}


