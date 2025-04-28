import { useState, useEffect } from "react";
import {
	Check,
	Loader2,
	XCircle,
	Building,
	BookOpen,
	Tag,
	Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BuildAssociationsModal({
	build,
	isOpen,
	onClose,
	onSuccess,
}) {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [organizations, setOrganizations] = useState([]);
	const [courses, setCourses] = useState([]);
	const [selectedAssociations, setSelectedAssociations] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (isOpen && build) {
			fetchData();
		}
	}, [isOpen, build]);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			// Récupérer les organisations et les formations
			const [orgsResponse, coursesResponse] = await Promise.all([
				fetch("/api/organizations"),
				fetch("/api/courses"),
			]);

			if (!orgsResponse.ok || !coursesResponse.ok) {
				throw new Error("Erreur lors de la récupération des données");
			}

			const orgsData = await orgsResponse.json();
			const coursesData = await coursesResponse.json();

			setOrganizations(orgsData.organizations || []);
			setCourses(coursesData.courses || []);

			// Récupérer les associations existantes
			const associationsResponse = await fetch(
				`/api/builds/associations?buildId=${encodeURIComponent(
					build.internalId
				)}`
			);

			if (associationsResponse.ok) {
				const associationsData = await associationsResponse.json();

				// Structure: [{ organizationId, courseId }, ...]
				setSelectedAssociations(associationsData.associations || []);
			}
		} catch (err) {
			console.error("Erreur:", err);
			setError(
				"Erreur lors du chargement des données. Veuillez réessayer."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(false);

		try {
			// Première étape: récupérer les associations actuelles
			const currentResponse = await fetch(
				`/api/builds/associations?buildId=${encodeURIComponent(
					build.internalId
				)}`
			);

			if (!currentResponse.ok) {
				throw new Error(
					"Erreur lors de la récupération des associations actuelles"
				);
			}

			const currentData = await currentResponse.json();
			const currentAssociations = currentData.associations || [];

			// Déterminer quelles associations doivent être ajoutées et lesquelles doivent être supprimées
			const toAdd = selectedAssociations.filter(
				(selected) =>
					!currentAssociations.some(
						(current) =>
							current.organizationId ===
								selected.organizationId &&
							current.courseId === selected.courseId
					)
			);

			const toRemove = currentAssociations.filter(
				(current) =>
					!selectedAssociations.some(
						(selected) =>
							selected.organizationId ===
								current.organizationId &&
							selected.courseId === current.courseId
					)
			);

			// Exécuter les ajouts
			for (const assoc of toAdd) {
				await fetch("/api/builds/associate", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						buildId: build.internalId,
						organizationId: assoc.organizationId,
						courseId: assoc.courseId,
					}),
				});
			}

			// Exécuter les suppressions
			for (const assoc of toRemove) {
				await fetch("/api/builds/associate", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						buildId: build.internalId,
						organizationId: assoc.organizationId,
						courseId: assoc.courseId,
					}),
				});
			}

			setSuccess(true);

			// Notifier le composant parent du succès
			if (onSuccess) {
				setTimeout(() => {
					onSuccess();
				}, 1500);
			}
		} catch (err) {
			console.error("Erreur lors de la sauvegarde:", err);
			setError(
				"Erreur lors de la sauvegarde des associations. Veuillez réessayer."
			);
		} finally {
			setSaving(false);
		}
	};

	const toggleAssociation = (organizationId, courseId) => {
		setSelectedAssociations((prev) => {
			// Vérifier si cette association existe déjà
			const exists = prev.some(
				(assoc) =>
					assoc.organizationId === organizationId &&
					assoc.courseId === courseId
			);

			if (exists) {
				// Supprimer l'association
				return prev.filter(
					(assoc) =>
						!(
							assoc.organizationId === organizationId &&
							assoc.courseId === courseId
						)
				);
			} else {
				// Ajouter l'association
				return [...prev, { organizationId, courseId }];
			}
		});
	};

	const isAssociationSelected = (organizationId, courseId) => {
		return selectedAssociations.some(
			(assoc) =>
				assoc.organizationId === organizationId &&
				assoc.courseId === courseId
		);
	};

	// Filtrer les organisations et formations selon la recherche
	const filteredOrganizations = organizations.filter((org) =>
		org.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredCourses = courses.filter((course) =>
		course.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Associations du build</DialogTitle>
					<DialogDescription>
						Associez ce build à des organisations et des formations
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
						<Check className="h-4 w-4" />
						<AlertDescription>
							Associations mises à jour avec succès
						</AlertDescription>
					</Alert>
				)}

				{loading ? (
					<div className="flex flex-col items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
						<p>Chargement des données...</p>
					</div>
				) : (
					<>
						<div className="mb-4">
							<Label htmlFor="search">Rechercher</Label>
							<div className="relative">
								<Input
									id="search"
									placeholder="Rechercher une organisation ou une formation..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</div>
						</div>

						<Tabs defaultValue="organizations">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="organizations">
									<Building className="mr-2 h-4 w-4" />
									Organisations
								</TabsTrigger>
								<TabsTrigger value="courses">
									<BookOpen className="mr-2 h-4 w-4" />
									Formations
								</TabsTrigger>
							</TabsList>

							<TabsContent value="organizations" className="mt-4">
								<div className="text-sm text-muted-foreground mb-2">
									Sélectionnez les organisations auxquelles
									associer ce build:
								</div>
								<ScrollArea className="h-64 rounded-md border p-2">
									{filteredOrganizations.length === 0 ? (
										<div className="text-center py-8 text-muted-foreground">
											Aucune organisation trouvée
										</div>
									) : (
										<div className="space-y-4">
											{filteredOrganizations.map(
												(org) => (
													<div
														key={org.id}
														className="space-y-2"
													>
														<h4 className="font-medium">
															{org.name}
														</h4>
														<div className="ml-6 space-y-1">
															{courses.length >
															0 ? (
																courses.map(
																	(
																		course
																	) => (
																		<div
																			key={
																				course.id
																			}
																			className="flex items-center space-x-2"
																		>
																			<Checkbox
																				id={`org-${org.id}-course-${course.id}`}
																				checked={isAssociationSelected(
																					org.id,
																					course.id
																				)}
																				onCheckedChange={() =>
																					toggleAssociation(
																						org.id,
																						course.id
																					)
																				}
																			/>
																			<Label
																				htmlFor={`org-${org.id}-course-${course.id}`}
																				className="text-sm"
																			>
																				{
																					course.name
																				}
																			</Label>
																		</div>
																	)
																)
															) : (
																<p className="text-sm text-muted-foreground">
																	Aucune
																	formation
																	disponible
																</p>
															)}
														</div>
													</div>
												)
											)}
										</div>
									)}
								</ScrollArea>
							</TabsContent>

							<TabsContent value="courses" className="mt-4">
								<div className="text-sm text-muted-foreground mb-2">
									Sélectionnez les formations auxquelles
									associer ce build:
								</div>
								<ScrollArea className="h-64 rounded-md border p-2">
									{filteredCourses.length === 0 ? (
										<div className="text-center py-8 text-muted-foreground">
											Aucune formation trouvée
										</div>
									) : (
										<div className="space-y-4">
											{filteredCourses.map((course) => (
												<div
													key={course.id}
													className="space-y-2"
												>
													<h4 className="font-medium">
														{course.name}
													</h4>
													<div className="ml-6 space-y-1">
														{organizations.length >
														0 ? (
															organizations.map(
																(org) => (
																	<div
																		key={
																			org.id
																		}
																		className="flex items-center space-x-2"
																	>
																		<Checkbox
																			id={`course-${course.id}-org-${org.id}`}
																			checked={isAssociationSelected(
																				org.id,
																				course.id
																			)}
																			onCheckedChange={() =>
																				toggleAssociation(
																					org.id,
																					course.id
																				)
																			}
																		/>
																		<Label
																			htmlFor={`course-${course.id}-org-${org.id}`}
																			className="text-sm"
																		>
																			{
																				org.name
																			}
																		</Label>
																	</div>
																)
															)
														) : (
															<p className="text-sm text-muted-foreground">
																Aucune
																organisation
																disponible
															</p>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</ScrollArea>
							</TabsContent>
						</Tabs>
					</>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={saving}
					>
						Annuler
					</Button>
					<Button onClick={handleSave} disabled={loading || saving}>
						{saving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Enregistrement...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Enregistrer
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
