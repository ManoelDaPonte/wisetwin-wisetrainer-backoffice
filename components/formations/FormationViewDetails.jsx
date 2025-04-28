// components/formations/FormationViewDetails.jsx
import {
	FileCode,
	Clock,
	Calendar,
	Tag,
	BarChart3,
	Image as ImageIcon,
	Code,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Configuration des couleurs selon la difficulté
const difficultyColors = {
	Débutant:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	Intermédiaire:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	Avancé: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

// Couleurs pour les catégories
const categoryColors = {
	Sécurité: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	Management:
		"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
	Communication:
		"bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
	Médical: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	Technique:
		"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function FormationViewDetails({ formation }) {
	// Formatage de la date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Déterminer s'il y a un mapping d'objets
	const hasObjectMapping =
		formation.objectMapping &&
		Object.keys(formation.objectMapping).length > 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{formation.name}</h1>
				<p className="text-muted-foreground mt-1">
					{formation.description}
				</p>
			</div>

			<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-md">
							Informations générales
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Tag className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Identifiant:
								</span>
								<span className="text-sm">
									{formation.formationId}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Catégorie:
								</span>
								<Badge
									variant="outline"
									className={
										categoryColors[formation.category] || ""
									}
								>
									{formation.category}
								</Badge>
							</div>
							<div className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Difficulté:
								</span>
								<Badge
									variant="outline"
									className={
										difficultyColors[
											formation.difficulty
										] || ""
									}
								>
									{formation.difficulty}
								</Badge>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Durée:
								</span>
								<span className="text-sm">
									{formation.duration}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<FileCode className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Modules:
								</span>
								<span className="text-sm">
									{formation.contents?.length || 0}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-md">Dates</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Création:
								</span>
								<span className="text-sm">
									{formatDate(formation.createdAt)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">
									Dernière mise à jour:
								</span>
								<span className="text-sm">
									{formatDate(formation.updatedAt)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{formation.imageUrl && (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-md">Image</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center gap-2">
								<ImageIcon className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm truncate">
									{formation.imageUrl}
								</span>
							</div>
							<div className="border rounded-md overflow-hidden bg-gray-50 dark:bg-gray-900 p-2 flex items-center justify-center">
								<img
									src={formation.imageUrl}
									alt={formation.name}
									className="max-h-32 object-contain"
									onError={(e) => {
										e.target.src = "/placeholder.svg";
										e.target.alt = "Image non trouvée";
									}}
								/>
							</div>
						</CardContent>
					</Card>
				)}

				{hasObjectMapping && (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-md">
								Mapping d'objets
							</CardTitle>
							<CardDescription>
								Correspondance entre objets 3D et modules
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Code className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">
										Nombre d'objets mappés:
									</span>
									<span className="text-sm">
										{
											Object.keys(formation.objectMapping)
												.length
										}
									</span>
								</div>
								<div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-36">
									<pre className="text-xs">
										{JSON.stringify(
											formation.objectMapping,
											null,
											2
										)}
									</pre>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{formation.buildId && (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-md">
								Build Unity
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<FileCode className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">ID:</span>
								<span className="text-sm truncate">
									{formation.buildId}
								</span>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
