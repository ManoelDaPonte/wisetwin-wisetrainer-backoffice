// components/dashboard/RecentActivity.jsx
import { FileText, Building, Upload, Link2, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Fonction pour obtenir l'icône appropriée en fonction du type d'activité
const getActivityIcon = (type) => {
	switch (type) {
		case "formation":
			return <FileText size={16} className="text-primary" />;
		case "organization":
			return <Building size={16} className="text-purple-600" />;
		case "build":
			return <Upload size={16} className="text-green-600" />;
		case "association":
			return <Link2 size={16} className="text-amber-600" />;
		case "user":
			return <User size={16} className="text-blue-600" />;
		default:
			return <FileText size={16} className="text-primary" />;
	}
};

// Fonction pour formatter le temps relatif
const getRelativeTime = (dateString) => {
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
			year: "numeric",
		});
	}
};

// Données statiques de repli
const defaultActivities = [
	{
		type: "formation",
		action: "Formation mise à jour",
		target: "Sécurité en environnement industriel",
		time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
	},
	{
		type: "build",
		action: "Nouveau build",
		target: "Gestion de crise v2.1",
		time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		type: "organization",
		action: "Organisation ajoutée",
		target: "Entreprise ABC",
		time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		type: "association",
		action: "Association créée",
		target: "Formation Sécurité - Build v1.3",
		time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		type: "user",
		action: "Membre ajouté",
		target: "john.doe@example.com",
		time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
	},
];

export default function RecentActivity({ data }) {
	// Utiliser les données fournies ou les données par défaut si aucune n'est disponible
	const activities = data?.length > 0 ? data : defaultActivities;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5 text-muted-foreground" />
					Activité récente
				</CardTitle>
				<CardDescription>
					Les dernières actions effectuées sur la plateforme
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="space-y-4">
					{activities.map((activity, index) => (
						<li
							key={index}
							className="flex items-start border-b pb-4 last:border-b-0 last:pb-0"
						>
							<div className="mr-3 mt-0.5 rounded-full bg-primary/10 p-2">
								{getActivityIcon(activity.type)}
							</div>
							<div className="flex-grow">
								<div className="flex items-center justify-between">
									<p className="font-medium">
										{activity.action}
									</p>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{getRelativeTime(activity.time)}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{activity.target}
								</p>
							</div>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter>
				<Button variant="outline" className="w-full">
					Voir toutes les activités
				</Button>
			</CardFooter>
		</Card>
	);
}
