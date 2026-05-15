import { NextResponse } from "next/server";

// Gunakan environment variable untuk password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cavo2024";

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    // Buat session token sederhana (bisa paket JWT nanti)
    const token = Buffer.from(
      JSON.stringify({
        authenticated: true,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
      }),
    ).toString("base64");

    return NextResponse.json({
      success: true,
      token: token,
    });
  }

  return NextResponse.json(
    { success: false, error: "Password salah" },
    { status: 401 },
  );
}

// Verifikasi token (bisa dipanggil dari frontend)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    if (decoded.authenticated && decoded.exp > Date.now()) {
      return NextResponse.json({ authenticated: true });
    }
  } catch (e) {
    // Invalid token
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
