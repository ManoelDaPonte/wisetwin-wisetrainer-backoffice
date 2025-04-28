// app/builds/view/[container]/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Loader2,
	AlertTriangle,
	Package,
	Eye,
	Download,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormationAssociations from "@/components/builds/FormationAssociations";

export default function BuildDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [build, setBuild] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("details");

	const { container, id } = params;

	useEffect(() => {
		if (!container || !id) return;

		fetchBuildDetails();
	}, [container, id]);

	const fetchBuildDetails = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/builds/${container}/${id}`);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des détails du build"
				);
			}

			const data = await response.json();
			setBuild(data.build);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		router.push("/builds");
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour aux builds
					</Button>
				</div>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : error ? (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : build ? (
					<>
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 p-4 bg-primary/10 rounded-lg">
								<Package className="h-12 w-12 text-primary" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">
									{build.name}
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="outline">
										Version {build.version}
									</Badge>
									<Badge variant="outline">
										{build.containerName}
									</Badge>
									<Badge
										variant="outline"
										className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									>
										Publié
									</Badge>
								</div>
								<p className="text-muted-foreground mt-2">
									{build.description ||
										"Aucune description fournie"}
								</p>
							</div>
						</div>

						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => window.open(build.url, "_blank")}
							>
								<Download className="mr-2 h-4 w-4" />
								Télécharger
							</Button>
							<Button>
								<Eye className="mr-2 h-4 w-4" />
								Prévisualiser
							</Button>
						</div>

						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList>
								<TabsTrigger value="details">
									Détails
								</TabsTrigger>
								<TabsTrigger value="formations">
									Formations
								</TabsTrigger>
								<TabsTrigger value="files">
									Fichiers
								</TabsTrigger>
							</TabsList>

							<TabsContent value="details" className="mt-6">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<Card>
										<CardHeader>
											<CardTitle>
												Informations générales
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													ID:
												</span>
												<span className="font-medium">
													{build.internalId}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Taille:
												</span>
												<span className="font-medium">
													{build.totalSize}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Uploadé le:
												</span>
												<span className="font-medium">
													{build.uploadDate}
												</span>
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>URL d'accès</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="p-2 bg-muted/30 rounded border overflow-hidden">
												<p className="text-sm break-all">
													{build.url}
												</p>
											</div>
										</CardContent>
										<CardFooter>
											<Button
												variant="outline"
												className="w-full"
												onClick={() => {
													navigator.clipboard.writeText(
														build.url
													);
												}}
											>
												Copier l'URL
											</Button>
										</CardFooter>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="formations" className="mt-6">
								<FormationAssociations build={build} />
							</TabsContent>

							<TabsContent value="files" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Fichiers du build</CardTitle>
										<CardDescription>
											Liste des fichiers inclus dans ce
											build Unity
										</CardDescription>
									</CardHeader>
									<CardContent>
										{build.files &&
										build.files.length > 0 ? (
											<div className="border rounded-md divide-y max-h-96 overflow-y-auto">
												{build.files.map(
													(file, index) => (
														<div
															key={index}
															className="flex justify-between items-center p-3"
														>
															<div className="truncate max-w-[70%]">
																{file.name}
															</div>
															<div className="flex items-center gap-4">
																<span className="text-xs text-muted-foreground">
																	{file.size}
																</span>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		window.open(
																			file.url,
																			"_blank"
																		)
																	}
																>
																	<Download className="h-4 w-4" />
																</Button>
															</div>
														</div>
													)
												)}
											</div>
										) : (
											<div className="text-center p-8 text-muted-foreground">
												Aucune information sur les
												fichiers disponible
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</>
				) : (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>Build non trouvé</AlertDescription>
					</Alert>
				)}
			</div>
		</AdminLayout>
	);
}
