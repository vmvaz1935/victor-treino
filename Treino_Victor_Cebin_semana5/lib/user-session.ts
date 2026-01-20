import { cookies } from "next/headers";

export const USER_SESSION_COOKIE = "mm_user_session";

export async function getUserSessionIdFromCookies(): Promise<string> {
  // O middleware garante que esse cookie sempre exista.
  const store = await cookies();
  const id = store.get(USER_SESSION_COOKIE)?.value;
  if (!id) {
    // Fallback defensivo (não deveria acontecer).
    throw new Error("userSessionId ausente (cookie não encontrado).");
  }
  return id;
}


