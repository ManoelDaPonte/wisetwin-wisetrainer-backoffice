// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Liste des chemins qui n'ont pas besoin d'authentification
const publicPaths = ["/login", "/api/auth/login"];

export async function middleware(request) {
	const { pathname } = request.nextUrl;

	// Vérifier si le chemin est public
	if (publicPaths.some((path) => pathname.startsWith(path))) {
		return NextResponse.next();
	}

	// Vérifier si l'utilisateur est authentifié
	const token = request.cookies.get("admin_token")?.value;

	if (!token) {
		// Rediriger vers la page de connexion si pas de token
		return NextResponse.redirect(new URL("/login", request.url));
	}

	try {
		// Vérifier la validité du token
		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		await jwtVerify(token, secret);

		return NextResponse.next();
	} catch (error) {
		// Token invalide, rediriger vers la page de connexion
		console.error("Erreur d'authentification:", error);
		return NextResponse.redirect(new URL("/login", request.url));
	}
}

// Configurer sur quels chemins le middleware doit s'exécuter
export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
	],
};
