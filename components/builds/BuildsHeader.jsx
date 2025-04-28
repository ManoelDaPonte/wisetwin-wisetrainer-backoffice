import { useState, useEffect } from "react";
import { Upload, Search, List, GridIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BuildsHeader({ onUploadClick, onContainerChange }) {
	const [containers, setContainers] = useState([]);
	const [selectedContainer, setSelectedContainer] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		// Charger la liste des containers
		async function fetchContainers() {
			try {
				const response = await fetch("/api/builds/containers");
				if (response.ok) {
					const data = await response.json();
					setContainers(data.containers || []);
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement des containers:",
					error
				);
			}
		}

		fetchContainers();
	}, []);

	const handleContainerSelect = (container) => {
		setSelectedContainer(container);
		if (onContainerChange) {
			onContainerChange(container);
		}
	};

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
		// Ici on pourrait implémenter la recherche côté client
		// ou déclencher une recherche côté serveur
	};

	return (
		<div className="mb-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Builds Unity</h1>
					<p className="text-muted-foreground">
						Gérez les builds WebGL pour vos formations
					</p>
				</div>
				<Button onClick={onUploadClick}>
					<Upload className="mr-2 h-4 w-4" />
					Uploader un build
				</Button>
			</div>

			<div className="flex items-center gap-4 flex-wrap">
				<div className="relative flex-1 min-w-[200px]">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Rechercher des builds..."
						className="pl-8"
						value={searchQuery}
						onChange={handleSearch}
					/>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="flex items-center justify-between gap-2"
						>
							<span>
								{selectedContainer
									? selectedContainer
									: "Tous les containers"}
							</span>
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => handleContainerSelect(null)}
						>
							Tous les containers
						</DropdownMenuItem>
						{containers.map((container) => (
							<DropdownMenuItem
								key={container.name}
								onClick={() =>
									handleContainerSelect(container.name)
								}
							>
								{container.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<ToggleGroup type="single" defaultValue="list">
					<ToggleGroupItem value="grid">
						<GridIcon className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem value="list">
						<List className="h-4 w-4" />
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	);
}
