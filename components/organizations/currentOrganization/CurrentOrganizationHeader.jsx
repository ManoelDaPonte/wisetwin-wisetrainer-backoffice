//components/organizations/CurrentOrganizationHeader.jsx
import { Badge } from "@/components/ui/badge";

export default function CurrentOrganizationHeader({ organization }) {
	if (!organization) return null;

	return (
		<div>
			<h1 className="text-2xl font-bold">{organization.name}</h1>
			<p className="text-muted-foreground mt-1">
				{organization.description || "Aucune description"}
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
					{organization.isActive ? "Active" : "Inactive"}
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
	);
}
