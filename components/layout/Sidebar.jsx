"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, Users, FileUp, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
	{
		title: "Tableau de bord",
		href: "/",
		icon: <BarChart3 size={20} />,
	},
	{
		title: "Formations",
		href: "/formations",
		icon: <BookOpen size={20} />,
	},
	{
		title: "Organisations",
		href: "/organisations",
		icon: <Users size={20} />,
	},
	{
		title: "Builds Unity",
		href: "/builds",
		icon: <FileUp size={20} />,
	},
];

export default function Sidebar({ isOpen, toggleSidebar }) {
	const { logout } = useAuth();
	const pathname = usePathname();

	return (
		<aside
			className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 dark:bg-card lg:static lg:translate-x-0 ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="flex h-16 items-center justify-between border-b px-4">
				<h1 className="text-xl font-bold text-wisetwin-blue">
					WiseTwin
				</h1>
				<Button
					onClick={toggleSidebar}
					variant="ghost"
					size="icon"
					className="lg:hidden"
				>
					<X size={20} />
				</Button>
			</div>

			<nav className="mt-6 px-4">
				<ul className="space-y-2">
					{navItems.map((item) => (
						<li key={item.href}>
							<Link
								href={item.href}
								className={cn(
									"flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-primary/10 dark:text-gray-300",
									pathname === item.href &&
										"bg-primary/10 font-medium text-primary"
								)}
							>
								<span className="mr-3">{item.icon}</span>
								<span>{item.title}</span>
							</Link>
						</li>
					))}

					<li className="mt-8 pt-4 border-t">
						<button
							onClick={logout}
							className="flex w-full items-center rounded-md px-3 py-2 text-gray-600 hover:bg-primary/10 dark:text-gray-300"
						>
							<LogOut size={20} className="mr-3" />
							<span>Déconnexion</span>
						</button>
					</li>
				</ul>
			</nav>
		</aside>
	);
}
