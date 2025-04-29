// components/dashboard/FormationsStats.jsx
"use client";

import Link from "next/navigation";
import { Clock, BarChart3, Tag } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const defaultStats = {
	categories: [
		{ name: "Sécurité", count: 8, percentage: 35 },
		{ name: "Technique", count: 6, percentage: 26 },
		{ name: "Management", count: 4, percentage: 17 },
		{ name: "Communication", count: 3, percentage: 13 },
		{ name: "Médical", count: 2, percentage: 9 },
	],
	activity: {
		last24h: 3,
		last7d: 8,
		last30d: 15,
	},
};

export default function FormationsStats({ data }) {
	// Utiliser les données fournies ou les données par défaut
	const stats = data || defaultStats;

	// Fonction pour obtenir la couleur en fonction de la catégorie
	const getCategoryColor = (category) => {
		const colors = {
			Sécurité: "text-red-600",
			Technique: "text-orange-600",
			Management: "text-purple-600",
			Communication: "text-cyan-600",
			Médical: "text-blue-600",
			Autre: "text-gray-600",
		};

		return colors[category] || "text-gray-600";
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-muted-foreground" />
					Répartition des formations
				</CardTitle>
				<CardDescription>
					Distribution par catégorie et activité récente
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Statistiques par catégorie */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium text-muted-foreground">
						Par catégorie
					</h3>

					{stats.categories.map((category) => (
						<div key={category.name} className="space-y-1">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<p
										className={`text-sm font-medium ${getCategoryColor(
											category.name
										)}`}
									>
										{category.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{category.count} formation
										{category.count > 1 ? "s" : ""}
									</p>
								</div>
								<p className="text-right text-sm font-medium">
									{category.percentage}%
								</p>
							</div>
							<Progress
								value={category.percentage}
								className="h-2"
							/>
						</div>
					))}
				</div>

				{/* Statistiques d'activité récente */}
				<div className="space-y-3 pt-2 border-t">
					<h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
						<Clock className="h-4 w-4" />
						Activité récente
					</h3>

					<div className="grid grid-cols-3 gap-2">
						<div className="rounded-md border p-2 text-center">
							<p className="text-lg font-semibold">
								{stats.activity.last24h}
							</p>
							<p className="text-xs text-muted-foreground">
								Dernières 24h
							</p>
						</div>
						<div className="rounded-md border p-2 text-center">
							<p className="text-lg font-semibold">
								{stats.activity.last7d}
							</p>
							<p className="text-xs text-muted-foreground">
								7 derniers jours
							</p>
						</div>
						<div className="rounded-md border p-2 text-center">
							<p className="text-lg font-semibold">
								{stats.activity.last30d}
							</p>
							<p className="text-xs text-muted-foreground">
								30 derniers jours
							</p>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() => (window.location.href = "/formations")}
				>
					<Tag className="mr-2 h-4 w-4" />
					Voir toutes les formations
				</Button>
			</CardFooter>
		</Card>
	);
}
