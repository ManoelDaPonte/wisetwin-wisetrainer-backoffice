// app/page.jsx
"use client";

import AdminLayout from "@/components/layout/AdminLayout";

export default function DashboardPage() {
	return (
		<AdminLayout>
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Hello, World!</h1>
				<p className="text-muted-foreground">
					Welcome to your admin portal.
				</p>
			</div>
		</AdminLayout>
	);
}
