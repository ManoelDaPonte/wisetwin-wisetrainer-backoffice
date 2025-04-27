"use client";

import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileUp, Edit, Trash2, Eye } from "lucide-react";

export default function FormationsPage() {
	// Données fictives des formations
	const [formations, setFormations] = useState([
		{
			id: "LOTO_Acces_Zone_Robot",
			name: "Accès à la zone robotisée sans énergie",
			category: "Sécurité",
			difficulty: "Intermédiaire",
			updatedAt: "2025-03-15T14:30:00Z",
			organization: null,
		},
		{
			id: "WiseTrainer_ZoneLogistique-Cariste",
			name: "Sécurité des opérations de chargement",
			category: "Sécurité",
			difficulty: "Intermédiaire",
			updatedAt: "2025-04-02T09:15:00Z",
			organization: null,
		},
		{
			id: "WiseTrainer_Securite_Electrique",
			name: "Sécurité électrique en milieu industriel",
			category: "Sécurité",
			difficulty: "Avancé",
			updatedAt: "2025-04-10T11:45:00Z",
			organization: null,
		},
		{
			id: "WiseTrainer_Org_Formation1",
			name: "Formation spécifique OrganisationA",
			category: "Procédures",
			difficulty: "Débutant",
			updatedAt: "2025-04-12T16:20:00Z",
			organization: "OrganisationA",
		},
	]);

	// État pour le terme de recherche
	const [searchTerm, setSearchTerm] = useState("");

	// Fonction pour filtrer les formations
	const filteredFormations = formations.filter(
		(formation) =>
			formation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			formation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			formation.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Fonction pour formater la date
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	// Fonction de suppression fictive
	const handleDelete = (id) => {
		if (
			confirm(`Êtes-vous sûr de vouloir supprimer la formation : ${id} ?`)
		) {
			setFormations(
				formations.filter((formation) => formation.id !== id)
			);
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">
						Gestion des Formations
					</h1>
					<p className="text-muted-foreground mt-1">
						Gérer les formations disponibles sur la plateforme
					</p>
				</div>
				<Button className="bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light">
					<Plus className="mr-2 h-4 w-4" /> Nouvelle Formation
				</Button>
			</div>

			<Card className="mb-6">
				<CardContent className="p-6">
					<div className="flex flex-col sm:flex-row gap-4 justify-between">
						<div className="relative w-full sm:w-72">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<input
								type="text"
								placeholder="Rechercher..."
								className="w-full pl-10 pr-4 py-2 border rounded-md border-border focus:outline-none focus:ring-2 focus:ring-wisetwin-blue focus:border-transparent"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="flex gap-2">
							<Button variant="outline">
								<FileUp className="mr-2 h-4 w-4" /> Importer
							</Button>
							<Button variant="outline">Filtrer</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Liste des Formations</CardTitle>
					<CardDescription>
						{filteredFormations.length} formation(s) disponible(s)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border">
									<th className="text-left py-3 px-4 font-medium">
										Nom
									</th>
									<th className="text-left py-3 px-4 font-medium">
										ID
									</th>
									<th className="text-left py-3 px-4 font-medium">
										Catégorie
									</th>
									<th className="text-left py-3 px-4 font-medium">
										Difficulté
									</th>
									<th className="text-left py-3 px-4 font-medium">
										Dernière MàJ
									</th>
									<th className="text-left py-3 px-4 font-medium">
										Organisation
									</th>
									<th className="text-right py-3 px-4 font-medium">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredFormations.length > 0 ? (
									filteredFormations.map((formation) => (
										<tr
											key={formation.id}
											className="border-b border-border hover:bg-accent/20"
										>
											<td className="py-3 px-4">
												{formation.name}
											</td>
											<td className="py-3 px-4 font-mono text-sm">
												{formation.id}
											</td>
											<td className="py-3 px-4">
												{formation.category}
											</td>
											<td className="py-3 px-4">
												<span
													className={`px-2 py-1 rounded-full text-xs ${
														formation.difficulty ===
														"Débutant"
															? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
															: formation.difficulty ===
															  "Intermédiaire"
															? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
															: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
													}`}
												>
													{formation.difficulty}
												</span>
											</td>
											<td className="py-3 px-4">
												{formatDate(
													formation.updatedAt
												)}
											</td>
											<td className="py-3 px-4">
												{formation.organization ? (
													<span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">
														{formation.organization}
													</span>
												) : (
													<span className="text-muted-foreground">
														WiseTwin
													</span>
												)}
											</td>
											<td className="py-3 px-4 text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
													>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleDelete(
																formation.id
															)
														}
														className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan="7"
											className="py-8 text-center text-muted-foreground"
										>
											Aucune formation trouvée
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
