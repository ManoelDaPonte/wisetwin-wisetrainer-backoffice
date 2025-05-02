//components/formations/currentFormation/view/CurrentFormationOverview.jsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	BookOpen,
	Clock,
	Users,
	Calendar,
	Globe,
	Lock,
	Building,
	Pencil,
	FileText,
	Box,
	GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function FormationOverview({ formation }) {
	const router = useRouter();

	if (!formation) return null;

	const {
		id,
		name,
		description,
		category,
		difficulty,
		duration,
		isPublic,
		imageUrl,
		organization,
		createdAt,
		updatedAt,
		enrollments,
		builds3D,
		courses,
		documentation,
	} = formation;

	const formattedCreatedAt = new Date(createdAt).toLocaleDateString("fr-FR");
	const formattedUpdatedAt = new Date(updatedAt).toLocaleDateString("fr-FR");

	const handleEdit = () => {
		router.push(`/formations/${id}/edit`);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-2xl font-bold">
							{name}
						</CardTitle>
						<CardDescription className="text-base mt-1">
							{description || "Aucune description"}
						</CardDescription>
					</div>
					<Button variant="outline" size="sm" onClick={handleEdit}>
						<Pencil className="mr-2 h-4 w-4" />
						Modifier
					</Button>
				</div>

				{/* Le reste du code reste identique */}
				<div className="flex flex-wrap gap-2 mt-3">
					<Badge
						variant="outline"
						className="bg-wisetwin-blue/10 text-wisetwin-blue"
					>
						{category || "Non catégorisé"}
					</Badge>
					<Badge variant="outline">
						{difficulty || "Non défini"}
					</Badge>
					{isPublic ? (
						<Badge
							variant="default"
							className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
						>
							<Globe className="mr-1 h-3 w-3" />
							Public
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
						>
							<Lock className="mr-1 h-3 w-3" />
							Privé
						</Badge>
					)}
				</div>

				{/* Organisation si présente */}
				{organization && (
					<div className="flex items-center mt-3 text-sm">
						<Building className="mr-2 h-4 w-4 text-muted-foreground" />
						<span>
							Organisation: <strong>{organization.name}</strong>
						</span>
					</div>
				)}
			</CardHeader>
			{/* Le reste du composant reste identique */}
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						{imageUrl && (
							<div className="mb-4 rounded-md overflow-hidden border">
								<img
									src={imageUrl}
									alt={name}
									className="w-full h-48 object-cover"
								/>
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center">
								<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>{duration || "Durée non définie"}</span>
							</div>
							<div className="flex items-center">
								<Users className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>{enrollments?.length || 0} inscrits</span>
							</div>
							<div className="flex items-center">
								<Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>Créé le: {formattedCreatedAt}</span>
							</div>
							<div className="flex items-center">
								<Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>Mis à jour: {formattedUpdatedAt}</span>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">
							Contenu de la formation
						</h3>
						<div className="grid grid-cols-1 gap-3">
							<div className="flex items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
								<Box className="mr-3 h-5 w-5 text-wisetwin-blue" />
								<div className="flex-1">
									<h4 className="font-medium">Modules 3D</h4>
									<p className="text-sm text-muted-foreground">
										{builds3D?.length || 0} environnement(s)
										interactif(s)
									</p>
								</div>
							</div>
							<div className="flex items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
								<GraduationCap className="mr-3 h-5 w-5 text-wisetwin-blue" />
								<div className="flex-1">
									<h4 className="font-medium">
										Cours théoriques
									</h4>
									<p className="text-sm text-muted-foreground">
										{courses?.length || 0} cours
									</p>
								</div>
							</div>
							<div className="flex items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
								<FileText className="mr-3 h-5 w-5 text-wisetwin-blue" />
								<div className="flex-1">
									<h4 className="font-medium">
										Documentation
									</h4>
									<p className="text-sm text-muted-foreground">
										{documentation?.length || 0}{" "}
										ressource(s)
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
