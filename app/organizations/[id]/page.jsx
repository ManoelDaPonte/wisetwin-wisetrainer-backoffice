//app/organizations/[id]/page.jsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Edit } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentOrganization } from "@/lib/hooks/organizations/currentOrganization/useCurrentOrganization";
import CurrentOrganizationDetails from "@/components/organizations/currentOrganization/CurrentOrganizationDetails";
import CurrentOrganizationMembersTable from "@/components/organizations/currentOrganization/CurrentOrganizationMembersTable";
import CurrentOrganizationBuildsOverview from "@/components/organizations/currentOrganization/CurrentOrganizationBuildsOverview";

export default function OrganizationDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { organization, isLoading, error } = useCurrentOrganization(
		params.id
	);

	const handleBack = () => {
		router.push("/organizations");
	};

	const handleEdit = () => {
		router.push(`/organizations/edit/${params.id}`);
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
						<CurrentOrganizationDetails
							organization={organization}
						/>
						<CurrentOrganizationMembersTable
							members={organization.members}
						/>
						<CurrentOrganizationBuildsOverview
							organizationId={organization.id}
						/>
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
