//components/formations/FormationsGrid.jsx
"use client";

import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	BookOpen,
	Clock,
	Users,
	GraduationCap,
	Globe,
	Lock,
	Building,
	FileText,
	Box,
} from "lucide-react";

export default function FormationsGrid({ formations = [] }) {
	const router = useRouter();

	if (formations.length === 0) {
		return (
			<div className="text-center py-12 border rounded-md">
				<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground mb-4">
					Aucune formation trouvée.
				</p>
				<p className="text-sm text-muted-foreground">
					Utilisez le bouton "Nouvelle formation" pour commencer.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{formations.map((formation) => (
				<Card
					key={formation.id}
					className="hover-lift transition-all overflow-hidden cursor-pointer"
					onClick={() =>
						router.push(`/formations/${formation.id}`)
					}
				>
					<CardHeader className="pb-2">
						<div className="flex justify-between items-start mb-1">
							<CardTitle className="text-lg">
								{formation.name}
							</CardTitle>
							{/* Badge de visibilité (public/privé) */}
							<Badge
								variant={
									formation.isPublic ? "default" : "outline"
								}
								className={
									formation.isPublic
										? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
										: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
								}
							>
								{formation.isPublic ? (
									<Globe className="mr-1 h-3 w-3" />
								) : (
									<Lock className="mr-1 h-3 w-3" />
								)}
								{formation.isPublic ? "Public" : "Privé"}
							</Badge>
						</div>

						<CardDescription className="line-clamp-2">
							{formation.description || "Aucune description"}
						</CardDescription>

						{/* Affichage de l'organisation si présente */}
						{formation.organization ? (
							<div className="flex items-center mt-2 text-xs text-muted-foreground">
								<Building className="mr-1 h-3 w-3" />
								<span>
									Organisation: {formation.organization.name}
								</span>
							</div>
						) : formation.organizationId ? (
							<div className="flex items-center mt-2 text-xs text-muted-foreground">
								<Building className="mr-1 h-3 w-3" />
								<span>
									Organisation ID: {formation.organizationId}
								</span>
							</div>
						) : null}
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2 mb-4">
							<Badge
								variant="outline"
								className="bg-wisetwin-blue/10"
							>
								{formation.category || "Non catégorisé"}
							</Badge>
							<Badge variant="outline">
								{formation.difficulty || "Non défini"}
							</Badge>
						</div>

						<div className="flex flex-col space-y-2">
							<div className="flex items-center text-sm text-muted-foreground">
								<Clock className="mr-2 h-4 w-4" />
								<span>
									{formation.duration || "Durée non définie"}
								</span>
							</div>
							<div className="flex items-center text-sm text-muted-foreground">
								<Users className="mr-2 h-4 w-4" />
								<span>
									{formation.enrollments?.length || 0}{" "}
									inscrits
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter className="border-t bg-muted/50 p-3">
						<div className="grid grid-cols-3 w-full gap-2 text-xs text-muted-foreground">
							<div className="flex items-center">
								<Box className="mr-1 h-3 w-3" />
								<span>
									{formation.builds3D?.length || 0} 3D
								</span>
							</div>
							<div className="flex items-center">
								<GraduationCap className="mr-1 h-3 w-3" />
								<span>
									{formation.courses?.length || 0} Cours
								</span>
							</div>
							<div className="flex items-center">
								<FileText className="mr-1 h-3 w-3" />
								<span>
									{formation.documentation?.length || 0} Docs
								</span>
							</div>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
