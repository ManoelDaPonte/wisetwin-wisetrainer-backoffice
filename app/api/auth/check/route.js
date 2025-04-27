// app/api/auth/check/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Récupérer les cookies de manière asynchrone
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Vérifier la validité du token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}