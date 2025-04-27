import { FileUp, BookOpen, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function QuickActions() {
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
				>
					<FileUp className="h-4 w-4" />
					<span>Uploader un build</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
				>
					<BookOpen className="h-4 w-4" />
					<span>Créer une formation</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
				>
					<Users className="h-4 w-4" />
					<span>Ajouter une organisation</span>
				</Button>
				<Button
					className="flex w-full justify-start gap-2"
					variant="outline"
				>
					<Globe className="h-4 w-4" />
					<span>Publier une formation</span>
				</Button>
			</CardContent>
		</Card>
	);
}
