//components/formations/view/FormationCourses.jsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	GraduationCap,
	PlusCircle,
	ChevronRight,
	Clock,
	MessageSquareText,
	Edit,
	Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function FormationCourses({ formation, isPreview = false }) {
	const router = useRouter();
	const courses = formation?.courses || [];

	const handleAddCourse = () => {
		// Rediriger vers la page d'ajout ou ouvrir un modal
		router.push(`/formations/${formation.id}/content/courses/add`);
	};

	const handleEditCourse = (courseId) => {
		router.push(`/formations/${formation.id}/content/courses/${courseId}/edit`);
	};

	const handleViewCourse = (courseId) => {
		router.push(`/formations/${formation.id}/content/courses/${courseId}`);
	};

	// Pour l'aperçu, afficher uniquement les 2 premiers cours
	const displayedCourses = isPreview ? courses.slice(0, 2) : courses;

	// Fonction pour convertir l'état en badge
	const getStatusBadge = (status) => {
		switch (status) {
			case "published":
				return (
					<Badge
						variant="outline"
						className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
					>
						Publié
					</Badge>
				);
			case "draft":
				return (
					<Badge
						variant="outline"
						className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
					>
						Brouillon
					</Badge>
				);
			case "archived":
				return (
					<Badge
						variant="outline"
						className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
					>
						Archivé
					</Badge>
				);
			default:
				return (
					<Badge variant="outline">{status || "Non défini"}</Badge>
				);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-center">
					<div className="flex items-center">
						<GraduationCap className="mr-2 h-5 w-5 text-wisetwin-blue" />
						<CardTitle>Cours théoriques</CardTitle>
					</div>
					<Button onClick={handleAddCourse} size="sm">
						<PlusCircle className="mr-2 h-4 w-4" />
						Ajouter un cours
					</Button>
				</div>
				<CardDescription>
					Contenus théoriques pour l'apprentissage
				</CardDescription>
			</CardHeader>
			<CardContent>
				{displayedCourses.length === 0 ? (
					<div className="text-center py-8 border rounded-md">
						<GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-2">
							Aucun cours disponible
						</p>
						<p className="text-sm text-muted-foreground">
							Cliquez sur "Ajouter un cours" pour commencer
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{displayedCourses.map((course) => (
							<div
								key={course.id}
								className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-md hover:bg-muted/20 transition-colors"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-medium">
											{course.title}
										</h3>
										{getStatusBadge(course.status)}
									</div>
									<p className="text-sm text-muted-foreground mt-1">
										{course.description ||
											"Aucune description"}
									</p>
									<div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
										<div className="flex items-center">
											<Clock className="mr-1 h-3 w-3" />
											<span>
												{course.duration ||
													"Durée non définie"}
											</span>
										</div>
										<div className="flex items-center">
											<MessageSquareText className="mr-1 h-3 w-3" />
											<span>
												{course.lessons?.length || 0}{" "}
												leçon(s)
											</span>
										</div>
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handleEditCourse(course.id)
										}
									>
										<Edit className="mr-2 h-4 w-4" />
										Modifier
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handleViewCourse(course.id)
										}
									>
										<Eye className="mr-2 h-4 w-4" />
										Voir
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
			{isPreview && courses.length > 2 && (
				<CardFooter className="border-t">
					<Button
						variant="ghost"
						size="sm"
						className="ml-auto"
						onClick={() =>
							router.push(`/formations/${formation.id}/content/courses`)
						}
					>
						Voir tous les cours ({courses.length})
						<ChevronRight className="ml-1 h-4 w-4" />
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
