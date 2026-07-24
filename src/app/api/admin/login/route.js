import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const res = NextResponse.json({ success: true });

    // 🔐 improved cookie (still simple, but cleaner for production)
    res.cookies.set("admin-auth", "logged-in", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  }

  return NextResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  );
}