import { NextResponse, type NextRequest } from "next/server";

const USER_SESSION_COOKIE = "mm_user_session";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const existing = req.cookies.get(USER_SESSION_COOKIE)?.value;

  if (!existing) {
    const id = crypto.randomUUID();
    res.cookies.set({
      name: USER_SESSION_COOKIE,
      value: id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 ano
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)"],
};


