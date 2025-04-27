"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Layers,
	Users,
	Server,
	FileText,
	Settings,
	LogOut,
	LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
	// État pour stocker les infos de l'utilisateur (simulé pour le moment)
	const [user, setUser] = useState({
		name: "Admin WiseTwin",
		email: "admin@wisetwin.com",
		avatarUrl: "/images/png/placeholder.png",
	});

	// Fonction pour gérer la déconnexion
	const handleLogout = () => {
		// Rediriger vers la route de déconnexion Auth0
		window.location.href = "/auth/logout";
	};

	// Données des cartes du dashboard
	const dashboardCards = [
		{
			title: "Formations",
			description: "Gérer les builds Unity et leurs métadonnées",
			icon: <Layers className="w-12 h-12 text-wisetwin-blue" />,
			link: "/dashboard/formations",
			count: 12,
		},
		{
			title: "Organisations",
			description: "Administrer les organisations et leurs accès",
			icon: <Users className="w-12 h-12 text-wisetwin-blue" />,
			link: "/dashboard/organisations",
			count: 5,
		},
		{
			title: "Stockage",
			description: "Gérer les builds sur Azure Blob Storage",
			icon: <Server className="w-12 h-12 text-wisetwin-blue" />,
			link: "/dashboard/storage",
			count: 34,
		},
		{
			title: "Statistiques",
			description: "Visualiser les données d'utilisation",
			icon: <FileText className="w-12 h-12 text-wisetwin-blue" />,
			link: "/dashboard/stats",
			count: null,
		},
	];

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<aside className="w-64 border-r border-border bg-card text-card-foreground hidden lg:block">
				<div className="flex flex-col h-full">
					<div className="px-6 py-4 border-b border-border">
						<div className="flex items-center gap-2">
							<div className="bg-wisetwin-darkblue text-white p-1 rounded">
								<LayoutDashboard className="w-6 h-6" />
							</div>
							<h1 className="text-xl font-bold">Admin Panel</h1>
						</div>
					</div>

					<nav className="flex-1 p-4">
						<ul className="space-y-1">
							<li>
								<Link
									href="/dashboard"
									className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground"
								>
									<LayoutDashboard className="w-5 h-5" />
									Dashboard
								</Link>
							</li>
							{dashboardCards.map((card, index) => (
								<li key={index}>
									<Link
										href={card.link}
										className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
									>
										{React.cloneElement(card.icon, {
											className: "w-5 h-5",
										})}
										{card.title}
									</Link>
								</li>
							))}
							<li>
								<Link
									href="/dashboard/settings"
									className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
								>
									<Settings className="w-5 h-5" />
									Paramètres
								</Link>
							</li>
						</ul>
					</nav>

					<div className="p-4 border-t border-border">
						<div className="flex items-center gap-2 mb-4">
							<div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
								<Image
									src={user.avatarUrl}
									alt={user.name}
									width={32}
									height={32}
									className="object-cover"
								/>
							</div>
							<div className="text-sm truncate">
								<div className="font-medium">{user.name}</div>
								<div className="text-muted-foreground text-xs">
									{user.email}
								</div>
							</div>
						</div>
						<Button
							variant="outline"
							className="w-full flex items-center gap-2 text-destructive"
							onClick={handleLogout}
						>
							<LogOut className="w-4 h-4" />
							Déconnexion
						</Button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex-1">
				{/* Header */}
				<header className="h-16 border-b border-border flex items-center justify-between p-4 bg-card text-card-foreground lg:justify-end">
					{/* Mobile menu and title - only visible on small screens */}
					<div className="flex items-center gap-4 lg:hidden">
						<h1 className="text-xl font-bold">Admin Panel</h1>
					</div>

					{/* User profile and logout */}
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
								<Image
									src={user.avatarUrl}
									alt={user.name}
									width={32}
									height={32}
									className="object-cover"
								/>
							</div>
							<div className="text-sm truncate hidden sm:block">
								<div className="font-medium">{user.name}</div>
								<div className="text-muted-foreground text-xs">
									{user.email}
								</div>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="flex items-center gap-2 text-destructive"
							onClick={handleLogout}
						>
							<LogOut className="w-4 h-4" />
							<span className="hidden sm:inline">
								Déconnexion
							</span>
						</Button>
					</div>
				</header>

				{/* Main dashboard content */}
				<main className="p-6">
					<div className="mb-8">
						<h1 className="text-3xl font-bold mb-2">
							Bienvenue, {user.name}!
						</h1>
						<p className="text-muted-foreground">
							Gérez la plateforme de formation WiseTwin depuis ce
							tableau de bord d'administration.
						</p>
					</div>

					{/* Dashboard cards */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{dashboardCards.map((card, index) => (
							<Link href={card.link} key={index}>
								<Card className="hover:shadow-md transition-shadow hover-scale">
									<CardHeader className="pb-2">
										<CardTitle className="text-lg">
											{card.title}
										</CardTitle>
										<CardDescription>
											{card.description}
										</CardDescription>
									</CardHeader>
									<CardContent className="flex justify-between items-center">
										{card.icon}
										{card.count !== null && (
											<div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
												{card.count}
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						))}
					</div>

					{/* Recent activity section */}
					<div className="mt-8">
						<h2 className="text-xl font-bold mb-4">
							Activité récente
						</h2>
						<Card>
							<CardContent className="p-6">
								<div className="text-center py-8 text-muted-foreground">
									<p>Aucune activité récente à afficher</p>
									<Button variant="outline" className="mt-4">
										Actualiser
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</main>
			</div>
		</div>
	);
}
