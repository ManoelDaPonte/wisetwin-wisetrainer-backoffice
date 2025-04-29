// components/dashboard/QuickActions.jsx
import { useRouter } from "next/navigation";
import { FileUp, BookOpen, Users, Link2, Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function QuickActions() {
	const router = useRouter();

	const handleAction = (path) => {
		router.push(path);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Actions rapides</CardTitle>
				<CardDescription>
					Accès rapide aux fonctionnalités courantes
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 sm:grid-cols-2">
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
					onClick={() => handleAction("/builds")}
				>
					<FileUp className="h-4 w-4" />
					<span>Uploader un build</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
					onClick={() => handleAction("/formations/create")}
				>
					<BookOpen className="h-4 w-4" />
					<span>Créer une formation</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
					onClick={() => handleAction("/organizations")}
				>
					<Building className="h-4 w-4" />
					<span>Gérer les organisations</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
					onClick={() => handleAction("/associations")}
				>
					<Link2 className="h-4 w-4" />
					<span>Gérer les associations</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2 sm:col-span-2"
					variant="outline"
					onClick={() => handleAction("/organizations")}
				>
					<Plus className="h-4 w-4" />
					<span>Ajouter une organisation</span>
				</Button>
			</CardContent>
		</Card>
	);
}
