// components/associations/AssociationCard.jsx
import { useRouter } from "next/navigation";
import { BookOpen, ArrowRight, Package, Unlink, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AssociationCard({
	formation,
	onRemoveAssociation,
	isRemoving,
}) {
	const router = useRouter();

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-0">
				<div className="flex flex-col md:flex-row">
					<div className="flex-grow p-6">
						<div className="flex items-start gap-4">
							<BookOpen className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg" />
							<div className="flex-grow">
								<h3 className="font-medium text-lg">
									{formation.name}
								</h3>
								<p className="text-sm text-muted-foreground truncate max-w-md">
									{formation.description ||
										"Aucune description"}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<Badge variant="outline">
										{formation.category}
									</Badge>
									<Badge variant="outline">
										{formation.difficulty}
									</Badge>
									<Badge variant="outline">
										{formation.duration}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					<div className="p-6 md:border-l flex flex-col items-center justify-center min-w-64">
						{formation.buildId ? (
							<div className="w-full">
								<div className="flex items-center gap-2 mb-2">
									<ArrowRight className="h-4 w-4 text-green-600" />
									<h4 className="font-medium">
										Build associé
									</h4>
								</div>
								<div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30 mb-4">
									<Package className="h-8 w-8 text-primary" />
									<div className="flex-grow min-w-0">
										<p className="font-medium truncate">
											{formation.buildName}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{formation.buildId}
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="w-full"
										onClick={() =>
											router.push(
												`/builds/view/${formation.buildContainer}/${formation.buildId}`
											)
										}
									>
										Voir le build
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											onRemoveAssociation(formation.id)
										}
										disabled={isRemoving}
									>
										<Unlink className="h-4 w-4" />
									</Button>
								</div>
							</div>
						) : (
							<div className="text-center">
								<Unlink className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
								<p className="text-muted-foreground mb-3">
									Aucun build associé
								</p>
								<Button
									onClick={() =>
										router.push(
											`/formations/view/${formation.id}`
										)
									}
									size="sm"
								>
									<Link className="mr-2 h-4 w-4" />
									Associer un build
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
