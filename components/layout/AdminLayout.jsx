"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function AdminLayout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<div className="flex h-screen bg-background">
			<Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Header toggleSidebar={toggleSidebar} />

				<main className="flex-1 overflow-auto p-4 lg:p-6">
					{children}
				</main>

				<Footer />
			</div>
		</div>
	);
}
