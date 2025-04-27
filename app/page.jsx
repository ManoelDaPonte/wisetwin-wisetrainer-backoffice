"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	const { isAuthenticated, loading, logout } = useAuth();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="spinner" />
				<span className="ml-2">Chargement...</span>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* En-tête */}
			<header className="border-b">
				<div className="container flex h-16 items-center justify-between">
					<h1 className="text-xl font-semibold">
						Tableau de bord d'administration
					</h1>
					<Button variant="ghost" onClick={logout}>
						Déconnexion
					</Button>
				</div>
			</header>

			{/* Contenu principal */}
			<main className="container flex-1 py-6">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Carte - Gestion des formations */}
					<div className="rounded-lg border bg-card p-6 hover-lift shadow-sm transition-all">
						<h3 className="mb-2 text-lg font-medium">
							Gestion des formations
						</h3>
						<p className="text-sm text-muted-foreground">
							Créez, modifiez et gérez les formations Unity et
							leurs métadonnées.
						</p>
						<Button className="mt-4" variant="outline">
							Accéder
						</Button>
					</div>

					{/* Carte - Upload des builds */}
					<div className="rounded-lg border bg-card p-6 hover-lift shadow-sm transition-all">
						<h3 className="mb-2 text-lg font-medium">
							Upload des builds
						</h3>
						<p className="text-sm text-muted-foreground">
							Téléversez et gérez les builds Unity WebGL sur Azure
							Blob Storage.
						</p>
						<Button className="mt-4" variant="outline">
							Accéder
						</Button>
					</div>

					{/* Carte - Gestion des organisations */}
					<div className="rounded-lg border bg-card p-6 hover-lift shadow-sm transition-all">
						<h3 className="mb-2 text-lg font-medium">
							Gestion des organisations
						</h3>
						<p className="text-sm text-muted-foreground">
							Administrez les organisations et leurs accès aux
							formations.
						</p>
						<Button className="mt-4" variant="outline">
							Accéder
						</Button>
					</div>
				</div>
			</main>

			{/* Pied de page */}
			<footer className="border-t py-4">
				<div className="container text-center text-sm text-muted-foreground">
					Administration - © {new Date().getFullYear()} Votre
					Entreprise
				</div>
			</footer>
		</div>
	);
}
