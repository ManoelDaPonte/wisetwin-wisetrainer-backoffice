"use client";

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Users, Server, FileText } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
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

	// Pour stocker le nom fictif de l'utilisateur connecté (à remplacer par Auth0)
	const userName = "Admin WiseTwin";

	return (
		<div className="p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">
					Bienvenue, {userName}!
				</h1>
				<p className="text-muted-foreground">
					Gérez la plateforme de formation WiseTwin depuis ce tableau
					de bord d'administration.
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
				<h2 className="text-xl font-bold mb-4">Activité récente</h2>
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
		</div>
	);
}
