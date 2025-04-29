// app/organizations/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Loader2,
	AlertTriangle,
	Edit,
	Users,
	BookOpen,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/hooks/useOrganizations";
import OrganizationMembersList from "@/components/organizations/OrganizationMembersList";
import OrganizationTrainingsList from "@/components/organizations/OrganizationTrainingsList";

export default function OrganizationDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { organization, isLoading, error } = useOrganization(params.id);
	const [activeTab, setActiveTab] = useState("details");

	const handleBack = () => {
		router.push("/organizations");
	};

	const handleEdit = () => {
		router.push(`/organizations/edit/${params.id}`);
	};

	const handleManageMembers = () => {
		router.push(`/organizations/${params.id}/members`);
	};

	const handleManageTrainings = () => {
		router.push(`/organizations/${params.id}/trainings`);
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour aux organisations
					</Button>

					{organization && (
						<Button onClick={handleEdit}>
							<Edit className="mr-2 h-4 w-4" />
							Modifier
						</Button>
					)}
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
				) : organization ? (
					<div className="space-y-6">
						<div>
							<h1 className="text-2xl font-bold">
								{organization.name}
							</h1>
							<p className="text-muted-foreground mt-1">
								{organization.description ||
									"Aucune description"}
							</p>
							<div className="flex items-center mt-2 gap-2">
								<Badge
									variant="outline"
									className={
										organization.isActive
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
											: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
									}
								>
									{organization.isActive
										? "Active"
										: "Inactive"}
								</Badge>
								{organization.azureContainer && (
									<Badge
										variant="outline"
										className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
									>
										Container: {organization.azureContainer}
									</Badge>
								)}
							</div>
						</div>

						<div className="flex flex-wrap gap-4">
							<Card className="w-full md:w-auto md:flex-1">
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">
										Membres
									</CardTitle>
									<CardDescription>
										Gestion des membres de l'organisation
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Users className="h-5 w-5 text-primary" />
											<span className="text-lg font-medium">
												{organization.membersCount || 0}{" "}
												membres
											</span>
										</div>
										<Button
											size="sm"
											onClick={handleManageMembers}
										>
											Gérer les membres
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card className="w-full md:w-auto md:flex-1">
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">
										Formations
									</CardTitle>
									<CardDescription>
										Formations associées à l'organisation
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<BookOpen className="h-5 w-5 text-primary" />
											<span className="text-lg font-medium">
												{organization.trainingsCount ||
													0}{" "}
												formations
											</span>
										</div>
										<Button
											size="sm"
											onClick={handleManageTrainings}
										>
											Gérer les formations
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>

						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList>
								<TabsTrigger value="details">
									Détails
								</TabsTrigger>
								<TabsTrigger value="members">
									Membres
								</TabsTrigger>
								<TabsTrigger value="trainings">
									Formations
								</TabsTrigger>
							</TabsList>

							<TabsContent value="details" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>
											Informations détaillées
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<h3 className="text-sm font-medium text-muted-foreground">
													ID
												</h3>
												<p>{organization.id}</p>
											</div>
											<div>
												<h3 className="text-sm font-medium text-muted-foreground">
													Créée le
												</h3>
												<p>
													{new Date(
														organization.createdAt
													).toLocaleDateString(
														"fr-FR"
													)}
												</p>
											</div>
											<div>
												<h3 className="text-sm font-medium text-muted-foreground">
													Dernière mise à jour
												</h3>
												<p>
													{new Date(
														organization.updatedAt
													).toLocaleDateString(
														"fr-FR"
													)}
												</p>
											</div>
											<div>
												<h3 className="text-sm font-medium text-muted-foreground">
													Conteneur Azure
												</h3>
												<p>
													{organization.azureContainer ||
														"Non défini"}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="members" className="mt-6">
								<OrganizationMembersList
									organizationId={organization.id}
									members={organization.members}
								/>
							</TabsContent>

							<TabsContent value="trainings" className="mt-6">
								<OrganizationTrainingsList
									organizationId={organization.id}
									trainings={organization.trainings}
								/>
							</TabsContent>
						</Tabs>
					</div>
				) : (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Organisation non trouvée
						</AlertDescription>
					</Alert>
				)}
			</div>
		</AdminLayout>
	);
}
