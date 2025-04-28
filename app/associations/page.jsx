// app/associations/page.jsx
"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import AssociationsFilter from "@/components/associations/AssociationsFilter";
import AssociationsList from "@/components/associations/AssociationsList";
import { useAssociations } from "@/hooks/useAssociations";

export default function AssociationsPage() {
	const {
		associations,
		isLoading,
		isProcessing,
		error,
		searchQuery,
		setSearchQuery,
		filterType,
		setFilterType,
		removeAssociation,
	} = useAssociations();

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">
						Associations Formations-Builds
					</h1>
					<p className="text-muted-foreground">
						Gérez les associations entre les formations et les
						builds Unity
					</p>
				</div>

				<AssociationsFilter
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					filterType={filterType}
					onFilterChange={setFilterType}
				/>

				<AssociationsList
					associations={associations}
					isLoading={isLoading}
					error={error}
					filterType={filterType}
					onRemoveAssociation={removeAssociation}
					isRemoving={isProcessing}
				/>
			</div>
		</AdminLayout>
	);
}
