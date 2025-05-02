//components/formations/FormationsGrid.jsx
"use client";

import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, GraduationCap } from "lucide-react";

export default function FormationsGrid({ formations = [] }) {
	const router = useRouter();

	if (formations.length === 0) {
		return (
			<div className="text-center py-12 border rounded-md">
				<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground mb-4">
					Aucune formation trouvée.
				</p>
				<p className="text-sm text-muted-foreground">
					Utilisez le bouton "Nouvelle formation" pour commencer.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{formations.map((formation) => (
				<Card
					key={formation.id}
					className="hover-lift transition-all overflow-hidden cursor-pointer"
					onClick={() =>
						router.push(`/formations/view/${formation.id}`)
					}
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							{formation.name}
						</CardTitle>
						<CardDescription className="line-clamp-2">
							{formation.description || "Aucune description"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2 mb-4">
							<Badge
								variant="outline"
								className="bg-wisetwin-blue/10"
							>
								{formation.category || "Non catégorisé"}
							</Badge>
							<Badge variant="outline">
								{formation.difficulty || "Non défini"}
							</Badge>
						</div>

						<div className="flex flex-col space-y-2">
							<div className="flex items-center text-sm text-muted-foreground">
								<Clock className="mr-2 h-4 w-4" />
								<span>
									{formation.duration || "Durée non définie"}
								</span>
							</div>
							<div className="flex items-center text-sm text-muted-foreground">
								<Users className="mr-2 h-4 w-4" />
								<span>0 inscrits</span>
							</div>
						</div>
					</CardContent>
					<CardFooter className="border-t bg-muted/50 p-3">
						<div className="flex items-center text-sm text-muted-foreground">
							<GraduationCap className="mr-2 h-4 w-4" />
							<span>
								{formation.courses?.length || 0} module
								{(formation.courses?.length || 0) > 1
									? "s"
									: ""}
							</span>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
