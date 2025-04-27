"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-wisetwin-darkblue to-wisetwin-blue/80 dark:from-wisetwin-darkblue/80 dark:to-wisetwin-blue/40">
			<div className="flex flex-1 items-center justify-center p-4">
				<div className="w-full max-w-md">
					<LoginForm />

					<p className="mt-8 text-center text-sm text-white/70">
						© {new Date().getFullYear()} WiseTwin. Tous droits
						réservés.
					</p>
				</div>
			</div>
		</div>
	);
}
