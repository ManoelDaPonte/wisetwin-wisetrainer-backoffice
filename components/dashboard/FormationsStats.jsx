// components/dashboard/FormationsStats.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, FileText, BarChart3, Layers, Loader2 } from "lucide-react";
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

export default function FormationsStats() {
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				// Remplacer par un appel à l'API /api/dashboard/formations-stats quand elle sera implémentée
				const response = await fetch("/api/formations");

				if (!response.ok) {
					throw new Error(
						"Erreur lors du chargement des statistiques"
					);
				}

				const data = await response.json();
				const formations = data.formations || [];

				// Calculer les statistiques à partir des formations
				const totalFormations = formations.length;

				// Compter les catégories
				const categoriesMap = {};
				let totalModules = 0;

				formations.forEach((formation) => {
					categoriesMap[formation.category] =
						(categoriesMap[formation.category] || 0) + 1;
					totalModules += formation.contentsCount || 0;
				});

				// Transformer la map en tableau pour pouvoir le trier
				const categories = Object.entries(categoriesMap)
					.map(([name, count]) => ({
						name,
						count,
						percentage:
							totalFormations > 0
								? Math.round((count / totalFormations) * 100)
								: 0,
					}))
					.sort((a, b) => b.count - a.count);

				// Calculer les statistiques d'activité récente (dernières 24h, 7j, 30j)
				const now = new Date();
				const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				const last7d = new Date(
					now.getTime() - 7 * 24 * 60 * 60 * 1000
				);
				const last30d = new Date(
					now.getTime() - 30 * 24 * 60 * 60 * 1000
				);

				const activity = {
					last24h: formations.filter(
						(f) => new Date(f.updatedAt) > last24h
					).length,
					last7d: formations.filter(
						(f) => new Date(f.updatedAt) > last7d
					).length,
					last30d: formations.filter(
						(f) => new Date(f.updatedAt) > last30d
					).length,
				};

				setStats({
					totalFormations,
					totalModules,
					categories,
					activity,
				});
			} catch (err) {
				console.error(
					"Erreur lors du chargement des statistiques:",
					err
				);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Statistiques des formations</CardTitle>
					<CardDescription>
						Chargement des statistiques en cours...
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center py-6">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Statistiques des formations</CardTitle>
					<CardDescription>Une erreur est survenue</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-red-500">{error}</p>
				</CardContent>
			</Card>
		);
	}

	if (!stats) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Statistiques des formations</CardTitle>
					<CardDescription>Aucune donnée disponible</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Total Formations
						</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.totalFormations}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.activity.last30d > 0 &&
								`+${stats.activity.last30d} derniers 30 jours`}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Total Modules
						</CardTitle>
						<Layers className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.totalModules}
						</div>
						<p className="text-xs text-muted-foreground">
							Moyenne de{" "}
							{stats.totalFormations > 0
								? (
										stats.totalModules /
										stats.totalFormations
								  ).toFixed(1)
								: 0}{" "}
							modules par formation
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Activité récente
						</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.activity.last7d}
						</div>
						<p className="text-xs text-muted-foreground">
							formations modifiées ces 7 derniers jours
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Catégorie principale
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.categories.length > 0
								? stats.categories[0].name
								: "Aucune"}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.categories.length > 0 &&
								`${stats.categories[0].count} formations (${stats.categories[0].percentage}%)`}
						</p>
					</CardContent>
				</Card>
			</div>

			{stats.categories.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Répartition par catégorie</CardTitle>
						<CardDescription>
							Distribution des formations par catégorie
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{stats.categories.map((category) => (
							<div key={category.name} className="space-y-1">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<p className="text-sm font-medium">
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
					</CardContent>
					<CardFooter>
						<Button
							asChild
							variant="outline"
							size="sm"
							className="w-full"
						>
							<Link href="/formations">
								Voir toutes les formations
							</Link>
						</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	);
}
