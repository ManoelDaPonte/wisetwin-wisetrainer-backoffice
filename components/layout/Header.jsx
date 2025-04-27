"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export default function Header({ toggleSidebar }) {
	const { logout } = useAuth();

	return (
		<header className="border-b bg-white shadow-sm dark:bg-card">
			<div className="flex h-16 items-center justify-between px-4 lg:px-6">
				<Button
					onClick={toggleSidebar}
					variant="ghost"
					size="icon"
					className="lg:hidden"
				>
					<Menu size={20} />
				</Button>

				<div className="ml-auto flex items-center space-x-4">
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground"
					>
						<Bell size={20} />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 rounded-full bg-primary text-white p-0"
							>
								<span className="text-sm font-medium">AD</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Mon compte</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Profil</DropdownMenuItem>
							<DropdownMenuItem>Paramètres</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={logout}>
								Déconnexion
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
