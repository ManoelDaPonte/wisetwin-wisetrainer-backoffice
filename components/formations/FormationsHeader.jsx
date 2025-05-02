//components/formations/FormationsHeader.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FormationsHeader({
	searchQuery = "",
	onSearchChange = () => {},
}) {
	const router = useRouter();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Formations</h1>
					<p className="text-muted-foreground">
						Gérez vos formations et leurs contenus
					</p>
				</div>
				<Button onClick={() => router.push("/formations/create")}>
					<PlusCircle className="mr-2 h-4 w-4" />
					Nouvelle formation
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Rechercher des formations..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
}
