// components/associations/AssociationsFilter.jsx
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function AssociationsFilter({
	searchQuery,
	onSearchChange,
	filterType,
	onFilterChange,
}) {
	return (
		<div className="flex flex-wrap gap-4 items-center">
			<div className="relative flex-grow">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Rechercher une formation ou un build..."
					className="pl-8"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>

			<div className="flex items-center gap-2">
				<Filter className="h-4 w-4 text-muted-foreground" />
				<Select value={filterType} onValueChange={onFilterChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Type de filtre" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							Toutes les formations
						</SelectItem>
						<SelectItem value="with-build">
							Avec build associé
						</SelectItem>
						<SelectItem value="without-build">
							Sans build associé
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
