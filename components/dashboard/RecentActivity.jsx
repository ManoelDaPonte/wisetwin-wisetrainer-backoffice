import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const recentActivities = [
	{
		action: "Formation mise à jour",
		target: "Sécurité en environnement industriel",
		time: "Il y a 2 heures",
	},
	{ action: "Nouveau build", target: "Gestion de crise v2.1", time: "Hier" },
	{
		action: "Organisation ajoutée",
		target: "Entreprise ABC",
		time: "23/04/2025",
	},
];

export default function RecentActivity() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Activité récente</CardTitle>
				<CardDescription>
					Les dernières actions effectuées
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="space-y-4">
					{recentActivities.map((activity, index) => (
						<li
							key={index}
							className="flex items-start border-b pb-4 last:border-b-0 last:pb-0"
						>
							<div className="mr-3 mt-0.5 rounded-full bg-primary/10 p-2">
								<FileText size={16} className="text-primary" />
							</div>
							<div>
								<p className="font-medium">{activity.action}</p>
								<p className="text-sm text-muted-foreground">
									{activity.target}
								</p>
								<p className="text-xs text-muted-foreground">
									{activity.time}
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
