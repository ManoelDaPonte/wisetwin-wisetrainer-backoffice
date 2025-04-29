// app/api/dashboard/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllBuilds } from "@/lib/azure";

export async function GET(request) {
	try {
		// Récupérer les données nécessaires pour le tableau de bord

		// 1. Calculer les statistiques globales
		const [
			formationsCount,
			organizationsCount,
			moduleContentsCount,
			usersCount,
			associationsData,
		] = await Promise.all([
			// Nombre total de formations
			prisma.formation.count(),

			// Nombre total d'organisations
			prisma.organization.count(),

			// Nombre total de modules de formations
			prisma.formationContent.count(),

			// Nombre total d'utilisateurs (membres d'organisations)
			prisma.organizationMember.count(),

			// Formations avec builds associés (pour le nombre d'associations)
			prisma.formation.findMany({
				where: {
					buildId: {
						not: null,
					},
				},
				select: {
					id: true,
					buildId: true,
				},
			}),
		]);

		// 2. Récupérer les builds
		let builds = [];
		let buildsCount = 0;
		try {
			builds = await getAllBuilds();
			buildsCount = builds.length;
		} catch (error) {
			console.error("Erreur lors de la récupération des builds:", error);
			// Continuer sans builds si une erreur survient
		}

		// 3. Récupérer les statistiques des formations
		const formationsStats = await getFormationsStats();

		// 4. Récupérer les organisations récentes
		const recentOrganizations = await prisma.organization.findMany({
			include: {
				_count: {
					select: {
						members: true,
						trainings: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 3,
		});

		// Transformer les organisations pour inclure les compteurs
		const organizations = recentOrganizations.map((org) => ({
			...org,
			membersCount: org._count.members,
			trainingsCount: org._count.trainings,
			_count: undefined,
		}));

		// 5. Récupérer l'activité récente
		const recentActivity = await getRecentActivity();

		// 6. Préparer les builds pour l'affichage
		const recentBuilds = builds.slice(0, 3).map((build) => ({
			id: build.id,
			name: build.name,
			containerName: build.containerName,
			version: build.version,
			status: build.status || "published",
			uploadDate: getRelativeTime(build.lastModified),
			size: build.totalSize || "N/A",
			associations: build.associatedOrganizations || 0,
		}));

		// 7. Construire et retourner la réponse
		return NextResponse.json({
			// Statistiques globales
			formationsCount,
			buildsCount,
			organizationsCount,
			usersCount,
			modulesCount: moduleContentsCount,
			associationsCount: associationsData.length,

			// Statistiques détaillées
			formationsStats,
			organizations,
			builds: recentBuilds,
			recentActivity,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des données du tableau de bord:",
			error
		);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération des données: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}

// Fonction pour récupérer les statistiques des formations
async function getFormationsStats() {
	try {
		// Récupérer les formations avec leur date de création/mise à jour
		const formations = await prisma.formation.findMany({
			select: {
				id: true,
				category: true,
				updatedAt: true,
			},
		});

		// Calculer la répartition par catégorie
		const categoriesMap = {};

		formations.forEach((formation) => {
			const category = formation.category || "Autre";
			categoriesMap[category] = (categoriesMap[category] || 0) + 1;
		});

		// Transformer la map en tableau et calculer les pourcentages
		const categories = Object.entries(categoriesMap)
			.map(([name, count]) => ({
				name,
				count,
				percentage: Math.round((count / formations.length) * 100) || 0,
			}))
			.sort((a, b) => b.count - a.count);

		// Calculer les statistiques d'activité récente
		const now = new Date();
		const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const activity = {
			last24h: formations.filter((f) => new Date(f.updatedAt) > last24h)
				.length,
			last7d: formations.filter((f) => new Date(f.updatedAt) > last7d)
				.length,
			last30d: formations.filter((f) => new Date(f.updatedAt) > last30d)
				.length,
		};

		return { categories, activity };
	} catch (error) {
		console.error(
			"Erreur lors du calcul des statistiques des formations:",
			error
		);
		// Retourner des données par défaut en cas d'erreur
		return {
			categories: [],
			activity: { last24h: 0, last7d: 0, last30d: 0 },
		};
	}
}

// Fonction pour récupérer l'activité récente
async function getRecentActivity() {
	try {
		// Activité pour les formations
		const recentFormations = await prisma.formation.findMany({
			select: {
				id: true,
				name: true,
				updatedAt: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 3,
		});

		// Activité pour les organisations
		const recentOrganizations = await prisma.organization.findMany({
			select: {
				id: true,
				name: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 2,
		});

		// Activité pour les membres d'organisations
		const recentMembers = await prisma.organizationMember.findMany({
			select: {
				id: true,
				user: {
					select: {
						email: true,
					},
				},
				organization: {
					select: {
						name: true,
					},
				},
				joinedAt: true,
			},
			orderBy: {
				joinedAt: "desc",
			},
			take: 2,
		});

		// Combinaison et tri des activités
		const combinedActivity = [
			...recentFormations.map((f) => ({
				type: "formation",
				action: "Formation mise à jour",
				target: f.name,
				time: f.updatedAt,
			})),
			...recentOrganizations.map((o) => ({
				type: "organization",
				action: "Organisation créée",
				target: o.name,
				time: o.createdAt,
			})),
			...recentMembers.map((m) => ({
				type: "user",
				action: "Membre ajouté",
				target: `${m.user.email} à ${m.organization.name}`,
				time: m.joinedAt,
			})),
		]
			.sort((a, b) => new Date(b.time) - new Date(a.time))
			.slice(0, 5);

		return combinedActivity;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'activité récente:",
			error
		);
		// Retourner un tableau vide en cas d'erreur
		return [];
	}
}

// Fonction pour formater les dates en temps relatif
function getRelativeTime(dateString) {
	if (!dateString) return "Date inconnue";

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now - date;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffMin < 1) {
		return "À l'instant";
	} else if (diffMin < 60) {
		return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
	} else if (diffHour < 24) {
		return `Il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`;
	} else if (diffDay < 7) {
		return `Il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
	} else {
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
		});
	}
}
