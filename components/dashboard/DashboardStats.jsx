// components/dashboard/DashboardStats.jsx
import {
	BookOpen,
	FileUp,
	Building,
	Users,
	Layers,
	BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
	{
		title: "Formations",
		icon: <BookOpen className="text-wisetwin-blue" />,
		value: 0,
		description: "Total",
		color: "bg-blue-50 dark:bg-blue-900/20",
	},
	{
		title: "Builds Unity",
		icon: <FileUp className="text-green-600" />,
		value: 0,
		description: "Total",
		color: "bg-green-50 dark:bg-green-900/20",
	},
	{
		title: "Organisations",
		icon: <Building className="text-purple-600" />,
		value: 0,
		description: "Total",
		color: "bg-purple-50 dark:bg-purple-900/20",
	},
	{
		title: "Utilisateurs",
		icon: <Users className="text-amber-600" />,
		value: 0,
		description: "Membres actifs",
		color: "bg-amber-50 dark:bg-amber-900/20",
	},
	{
		title: "Modules",
		icon: <Layers className="text-cyan-600" />,
		value: 0,
		description: "Total",
		color: "bg-cyan-50 dark:bg-cyan-900/20",
	},
	{
		title: "Associations",
		icon: <BarChart3 className="text-pink-600" />,
		value: 0,
		description: "Formation-Build",
		color: "bg-pink-50 dark:bg-pink-900/20",
	},
];

export default function DashboardStats({ data }) {
	// Fonction pour formater les grands nombres (ajouter des K, M, etc.)
	const formatNumber = (num) => {
		if (num === undefined || num === null) return "0";

		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + "M";
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "K";
		}
		return num.toString();
	};

	// Mettre à jour les valeurs si les données sont disponibles
	const statsWithData = stats.map((stat) => {
		if (!data) return stat;

		let value = 0;

		switch (stat.title) {
			case "Formations":
				value = data.formationsCount || 0;
				break;
			case "Builds Unity":
				value = data.buildsCount || 0;
				break;
			case "Organisations":
				value = data.organizationsCount || 0;
				break;
			case "Utilisateurs":
				value = data.usersCount || 0;
				break;
			case "Modules":
				value = data.modulesCount || 0;
				break;
			case "Associations":
				value = data.associationsCount || 0;
				break;
		}

		return {
			...stat,
			value: formatNumber(value),
		};
	});

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{statsWithData.map((stat, index) => (
				<Card
					key={index}
					className={`overflow-hidden hover-lift transition-all border ${stat.color}`}
				>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-lg font-medium">
									{stat.title}
								</p>
								<p className="text-3xl font-bold mt-1">
									{stat.value}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									{stat.description}
								</p>
							</div>
							<div className="rounded-lg bg-background p-3 shadow-sm">
								{stat.icon}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
