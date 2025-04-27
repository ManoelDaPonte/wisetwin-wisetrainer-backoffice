"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Erreur de connexion");
			}

			router.push("/");
			router.refresh();
		} catch (err) {
			setError(
				err.message || "Une erreur est survenue lors de la connexion"
			);
		} finally {
			setLoading(false);
		}
	};

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	return (
		<Card className="animate-fade-in border-none shadow-xl">
			<CardHeader className="pt-12 text-center">
				<CardTitle className="text-2xl font-bold">
					Administration
				</CardTitle>
				<CardDescription>
					Connectez-vous pour accéder au panneau d'administration
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleLogin} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@exemple.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Mot de passe</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<button
								type="button"
								onClick={toggleShowPassword}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-wisetwin-blue to-wisetwin-darkblue hover:from-wisetwin-blue/90 hover:to-wisetwin-darkblue/90"
						disabled={loading}
					>
						{loading ? (
							<div className="flex items-center justify-center">
								<div className="spinner mr-2" />
								<span>Connexion en cours...</span>
							</div>
						) : (
							<div className="flex items-center justify-center">
								<LogIn className="mr-2 h-4 w-4" />
								<span>Se connecter</span>
							</div>
						)}
					</Button>
				</form>
			</CardContent>

			<CardFooter className="text-center text-sm text-muted-foreground">
				Portail d'administration sécurisé
			</CardFooter>
		</Card>
	);
}
