// components/organizations/OrganizationMembersList.jsx
"use client";

import { useState } from "react";
import {
	Mail,
	UserCheck,
	UserMinus,
	UserPlus,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function OrganizationMembersList({
	organizationId,
	members = [],
}) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState(null);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberRole, setNewMemberRole] = useState("MEMBER");
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState(null);

	const handleAddMember = async () => {
		if (!newMemberEmail) return;

		setIsProcessing(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/members`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: newMemberEmail,
						role: newMemberRole,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de l'ajout du membre"
				);
			}

			// Fermer le modal et rafraîchir la liste
			setIsAddModalOpen(false);
			setNewMemberEmail("");
			setNewMemberRole("MEMBER");

			// Idéalement, on devrait rafraîchir la liste des membres ici
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRemoveMember = async () => {
		if (!selectedMember) return;

		setIsProcessing(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/members/${selectedMember.id}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la suppression du membre"
				);
			}

			// Fermer le modal et rafraîchir la liste
			setIsRemoveModalOpen(false);
			setSelectedMember(null);

			// Idéalement, on devrait rafraîchir la liste des membres ici
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsProcessing(false);
		}
	};

	if (!members || members.length === 0) {
		return (
			<div className="text-center p-12 border rounded-md">
				<UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h3 className="text-lg font-medium mb-2">Aucun membre</h3>
				<p className="text-muted-foreground mb-4">
					Cette organisation n'a pas encore de membres. Ajoutez des
					membres pour pouvoir leur accorder l'accès aux formations.
				</p>
				<Button onClick={() => setIsAddModalOpen(true)}>
					<UserPlus className="mr-2 h-4 w-4" />
					Ajouter un membre
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">
					Membres de l'organisation
				</h3>
				<Button onClick={() => setIsAddModalOpen(true)}>
					<UserPlus className="mr-2 h-4 w-4" />
					Ajouter un membre
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="border rounded-md overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nom</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Rôle</TableHead>
							<TableHead>Date d'ajout</TableHead>
							<TableHead className="text-right">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{members.map((member) => (
							<TableRow key={member.id}>
								<TableCell className="font-medium">
									{member.user?.name || "Non défini"}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Mail className="h-4 w-4 text-muted-foreground" />
										{member.user?.email}
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={
											member.role === "OWNER"
												? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
												: member.role === "ADMIN"
												? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
												: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
										}
									>
										{member.role}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(
										member.joinedAt
									).toLocaleDateString("fr-FR")}
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setSelectedMember(member);
											setIsRemoveModalOpen(true);
										}}
										disabled={member.role === "OWNER"}
									>
										<UserMinus className="h-4 w-4 text-destructive" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Modal pour ajouter un membre */}
			<Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Ajouter un membre</DialogTitle>
						<DialogDescription>
							Ajoutez un nouveau membre à cette organisation
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="exemple@domaine.com"
								value={newMemberEmail}
								onChange={(e) =>
									setNewMemberEmail(e.target.value)
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Rôle</Label>
							<Select
								value={newMemberRole}
								onValueChange={setNewMemberRole}
							>
								<SelectTrigger id="role">
									<SelectValue placeholder="Sélectionner un rôle" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MEMBER">
										Membre
									</SelectItem>
									<SelectItem value="ADMIN">
										Administrateur
									</SelectItem>
									<SelectItem value="OWNER">
										Propriétaire
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsAddModalOpen(false)}
							disabled={isProcessing}
						>
							Annuler
						</Button>
						<Button
							onClick={handleAddMember}
							disabled={!newMemberEmail || isProcessing}
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Ajout en cours...
								</>
							) : (
								<>
									<UserPlus className="mr-2 h-4 w-4" />
									Ajouter
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Modal pour supprimer un membre */}
			<Dialog
				open={isRemoveModalOpen}
				onOpenChange={setIsRemoveModalOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Supprimer un membre</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir supprimer ce membre de
							l'organisation ?
						</DialogDescription>
					</DialogHeader>

					{selectedMember && (
						<div className="py-4">
							<p className="mb-2">
								<span className="font-semibold">Nom:</span>{" "}
								{selectedMember.user?.name || "Non défini"}
							</p>
							<p className="mb-2">
								<span className="font-semibold">Email:</span>{" "}
								{selectedMember.user?.email}
							</p>
							<p>
								<span className="font-semibold">Rôle:</span>{" "}
								{selectedMember.role}
							</p>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsRemoveModalOpen(false)}
							disabled={isProcessing}
						>
							Annuler
						</Button>
						<Button
							variant="destructive"
							onClick={handleRemoveMember}
							disabled={isProcessing}
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Suppression...
								</>
							) : (
								<>
									<UserMinus className="mr-2 h-4 w-4" />
									Supprimer
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
