// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Récupérer les identifiants administrateurs depuis les variables d'environnement
    const adminCredentials = process.env.ADMIN_CREDENTIALS?.split(',') || [];
    const isValidAdmin = adminCredentials.some(cred => {
      const [adminEmail, adminPassword] = cred.split(':');
      return adminEmail === email && adminPassword === password;
    });

    if (!isValidAdmin) {
      return NextResponse.json({ success: false, message: 'Identifiants invalides' }, { status: 401 });
    }

    // Créer un token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h') // Le token expire après 8 heures
      .sign(secret);

    const cookieStore = await cookies();

    // Définir le cookie
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 heures en secondes
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}