"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BuildsHeader from "@/components/builds/BuildsHeader";
import BuildsList from "@/components/builds/BuildsList";
import UploadBuildForm from "@/components/builds/UploadBuildForm";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function BuildsPage() {
	const { loading } = useAuth();
	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0); // Utilisé pour forcer le rafraîchissement des builds
	const [selectedContainer, setSelectedContainer] = useState(null);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-lg font-medium">Chargement...</span>
			</div>
		);
	}

	const handleUploadSuccess = () => {
		// Fermer le modal et rafraîchir la liste des builds
		setTimeout(() => {
			setUploadModalOpen(false);
			setRefreshKey((prev) => prev + 1);
		}, 2000);
	};

	const openUploadModal = () => {
		setUploadModalOpen(true);
	};

	return (
		<AdminLayout>
			<BuildsHeader
				onUploadClick={openUploadModal}
				onContainerChange={setSelectedContainer}
			/>
			<BuildsList key={refreshKey} container={selectedContainer} />

			<Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
				<DialogContent className="sm:max-w-lg">
					<UploadBuildForm
						onClose={() => setUploadModalOpen(false)}
						onSuccess={handleUploadSuccess}
					/>
				</DialogContent>
			</Dialog>
		</AdminLayout>
	);
}
