"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function AuthPage() {
	// État pour suivre si l'utilisateur est en train de s'inscrire ou de se connecter
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
			<div className="container flex flex-col items-center justify-center px-4 space-y-8 md:px-6">
				<div className="flex flex-col space-y-2 text-center mb-4">
					<h1 className="text-3xl font-bold tracking-tight">
						{isSignUp ? "Créer un compte" : "Se connecter"}
					</h1>
					<p className="text-muted-foreground">
						{isSignUp
							? "Créez un compte pour accéder au tableau de bord d'administration"
							: "Connectez-vous à votre compte pour continuer"}
					</p>
				</div>

				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-xl text-center">
							{isSignUp ? "Inscription" : "Connexion"}
						</CardTitle>
						<CardDescription className="text-center">
							{isSignUp
								? "Entrez vos informations pour créer un compte"
								: "Connectez-vous avec votre compte Auth0"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="grid gap-6">
								<div className="flex flex-col gap-6">
									<Link
										href="/api/auth/login"
										className="w-full"
									>
										<Button
											className="w-full bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light"
											variant="default"
										>
											{isSignUp
												? "S'inscrire avec Auth0"
												: "Se connecter avec Auth0"}
										</Button>
									</Link>

									{/* Bouton de démonstration pour accéder au dashboard (à enlever en production) */}
									<Link href="/dashboard" className="w-full">
										<Button
											className="w-full"
											variant="outline"
										>
											Démo : Accéder au Dashboard
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<div className="text-center text-sm">
							{isSignUp ? (
								<div>
									Vous avez déjà un compte?{" "}
									<button
										onClick={() => setIsSignUp(false)}
										className="underline text-wisetwin-blue hover:text-wisetwin-blue-light"
									>
										Se connecter
									</button>
								</div>
							) : (
								<div>
									Pas encore de compte?{" "}
									<button
										onClick={() => setIsSignUp(true)}
										className="underline text-wisetwin-blue hover:text-wisetwin-blue-light"
									>
										Créer un compte
									</button>
								</div>
							)}
						</div>
					</CardFooter>
				</Card>

				<div className="flex items-center justify-center space-x-2 text-muted-foreground">
					<div className="text-sm">
						© {new Date().getFullYear()} WiseTwin - Tous droits
						réservés
					</div>
				</div>
			</div>
		</div>
	);
}
