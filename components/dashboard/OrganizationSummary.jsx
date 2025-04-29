// components/dashboard/OrganizationSummary.jsx
import { useRouter } from "next/navigation";
import {
	Building,
	Users,
	BookOpen,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function OrganizationSummary({ data }) {
	const router = useRouter();

	// Organisation par défaut si aucune donnée n'est fournie
	const defaultOrganizations = [
		{
			id: "1",
			name: "Entreprise ABC",
			description: "Grande entreprise industrielle",
			isActive: true,
			membersCount: 32,
			trainingsCount: 8,
			createdAt: "2023-03-12T00:00:00Z",
		},
		{
			id: "2",
			name: "StartUp XYZ",
			description: "Startup technologique en croissance",
			isActive: true,
			membersCount: 15,
			trainingsCount: 5,
			createdAt: "2023-02-05T00:00:00Z",
		},
		{
			id: "3",
			name: "Association DEF",
			description: "Association professionnelle sectorielle",
			isActive: false,
			membersCount: 54,
			trainingsCount: 12,
			createdAt: "2023-01-23T00:00:00Z",
		},
	];

	// Utiliser les données fournies ou les données par défaut
	const organizations = data?.length > 0 ? data : defaultOrganizations;

	// Fonction pour formater les dates
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Organisations</CardTitle>
					<CardDescription>Récentes organisations</CardDescription>
				</div>
				<Building className="h-5 w-5 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{organizations.length === 0 ? (
						<div className="text-center py-3 text-muted-foreground">
							Aucune organisation trouvée
						</div>
					) : (
						organizations.map((org) => (
							<div
								key={org.id}
								className="flex flex-col border-b pb-3 last:border-0 last:pb-0"
							>
								<div className="flex justify-between items-center">
									<h3 className="font-medium">{org.name}</h3>
									<Badge
										variant="outline"
										className={
											org.isActive
												? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
												: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
										}
									>
										{org.isActive ? (
											<CheckCircle className="mr-1 h-3 w-3" />
										) : (
											<AlertTriangle className="mr-1 h-3 w-3" />
										)}
										{org.isActive ? "Active" : "Inactive"}
									</Badge>
								</div>

								<p className="text-sm text-muted-foreground mt-1 line-clamp-1">
									{org.description || "Aucune description"}
								</p>

								<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<Users className="h-3 w-3" />
										<span>
											{org.membersCount || 0} membres
										</span>
									</div>
									<div className="flex items-center gap-1">
										<BookOpen className="h-3 w-3" />
										<span>
											{org.trainingsCount || 0} formations
										</span>
									</div>
									<div className="ml-auto">
										{formatDate(org.createdAt)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => (window.location.href = "/organizations")}
				>
					Voir toutes les organisations
				</Button>
			</CardFooter>
		</Card>
	);
}
