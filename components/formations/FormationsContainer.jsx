//components/formations/FormationsContainer.jsx
"use client";

import { useFormations } from "@/lib/hooks/formations/useFormations";
import FormationsHeader from "./FormationsHeader";
import FormationsGrid from "./FormationsGrid";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormationsContainer() {
	const { formations, isLoading, error, searchQuery, handleSearch } =
		useFormations();

	return (
		<div className="space-y-6">
			<FormationsHeader
				searchQuery={searchQuery}
				onSearchChange={handleSearch}
			/>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : error ? (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : (
				<FormationsGrid formations={formations} />
			)}
		</div>
	);
}
