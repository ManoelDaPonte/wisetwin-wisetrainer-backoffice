"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	const router = useRouter();

	// Rediriger vers /auth après le chargement de la page
	useEffect(() => {
		// Redirection avec un court délai pour permettre aux animations de se charger
		const redirectTimer = setTimeout(() => {
			router.push("/auth");
		}, 2000);

		// Nettoyer le timer si le composant est démonté
		return () => clearTimeout(redirectTimer);
	}, [router]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-wisetwin-blue/10">
			<div className="container flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
				<h1 className="text-4xl font-bold tracking-tight text-wisetwin-darkblue sm:text-5xl md:text-6xl">
					<span className="block">WiseTwin</span>
					<span className="block text-wisetwin-blue">
						Plateforme d'Administration
					</span>
				</h1>
				<p className="mx-auto mt-3 max-w-md text-base text-muted-foreground sm:text-lg md:mt-5 md:max-w-xl md:text-xl">
					Redirection automatique en cours...
				</p>
				<div className="mt-4 flex flex-col sm:flex-row gap-4">
					<Button
						className="w-full sm:w-auto bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light"
						onClick={() => router.push("/auth")}
					>
						Accéder à la page de connexion
					</Button>
				</div>

				<div className="mt-8 animate-pulse">
					<div className="h-2 w-32 bg-wisetwin-blue rounded-full"></div>
				</div>
			</div>
		</div>
	);
}
