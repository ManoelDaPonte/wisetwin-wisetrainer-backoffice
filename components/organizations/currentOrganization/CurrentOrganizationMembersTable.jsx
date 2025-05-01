//components/organizations/currentOrganization/OrganizationMembersTable.jsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Mail } from "lucide-react";

export default function CurrentOrganizationMembersTable({ members = [] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<Users className="h-6 w-6 text-primary" />
					Membres ({members.length})
				</CardTitle>
				<CardDescription>
					Liste des membres de l'organisation
				</CardDescription>
			</CardHeader>
			<CardContent>
				{members.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						Aucun membre dans cette organisation
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nom</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Rôle</TableHead>
								<TableHead>Membre depuis</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{members.map((member) => (
								<TableRow key={member.id}>
									<TableCell className="font-medium">
										{member.user?.name || "Inconnu"}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											{member.user?.email}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{member.role}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(
											member.joinedAt
										).toLocaleDateString("fr-FR")}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
