// components/formations/FormationsContainer.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormationsTable from "@/components/formations/FormationsTable";
import FormationsGrid from "@/components/formations/FormationsGrid";
import FormationImportDialog from "@/components/formations/FormationImportDialog";
import FormationsHeader from "@/components/formations/FormationsHeader";

export default function FormationsContainer() {
	const router = useRouter();
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("list");
	const [refreshCounter, setRefreshCounter] = useState(0);

	// Fonction pour forcer un rafraîchissement des données
	const refreshData = () => {
		setRefreshCounter((prev) => prev + 1);
	};

	const handleCreateFormation = () => {
		router.push("/formations/create");
	};

	const handleImportFormation = () => {
		setImportDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<FormationsHeader
				onCreateClick={handleCreateFormation}
				onImportClick={handleImportFormation}
			/>

			<Tabs
				defaultValue="list"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList>
					<TabsTrigger value="list">Liste</TabsTrigger>
					<TabsTrigger value="grid">Grille</TabsTrigger>
				</TabsList>
				<TabsContent value="list">
					<FormationsTable key={refreshCounter} />
				</TabsContent>
				<TabsContent value="grid">
					<FormationsGrid key={refreshCounter} />
				</TabsContent>
			</Tabs>

			<FormationImportDialog
				open={importDialogOpen}
				onOpenChange={setImportDialogOpen}
				onSuccess={refreshData}
			/>
		</div>
	);
}
