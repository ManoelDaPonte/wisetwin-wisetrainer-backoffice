import Link from "next/link";
import { BookOpen, Users, FileUp } from "lucide-react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statsCards = [
	{
		title: "Formations",
		count: "23",
		description: "Gérez les formations et leurs contenus",
		icon: <BookOpen className="text-wisetwin-blue" />,
		link: "/formations",
		color: "bg-blue-50 dark:bg-blue-900/20",
	},
	{
		title: "Organisations",
		count: "14",
		description: "Administrez les organisations et leurs accès",
		icon: <Users className="text-wisetwin-darkblue" />,
		link: "/organisations",
		color: "bg-indigo-50 dark:bg-indigo-900/20",
	},
	{
		title: "Builds Unity",
		count: "42",
		description: "Gérez et déployez les builds WebGL",
		icon: <FileUp className="text-green-600" />,
		link: "/builds",
		color: "bg-green-50 dark:bg-green-900/20",
	},
];

export default function StatsCards() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{statsCards.map((card) => (
				<Card
					key={card.title}
					className={`overflow-hidden hover-lift transition-all border ${card.color}`}
				>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">
								{card.title}
							</CardTitle>
							{card.icon}
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{card.count}</p>
						<p className="text-sm text-muted-foreground">
							{card.description}
						</p>
					</CardContent>
					<CardFooter className="pt-0">
						<Button
							asChild
							variant="ghost"
							className="p-0 hover:bg-transparent hover:underline"
						>
							<Link href={card.link}>Gérer</Link>
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
