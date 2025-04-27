// hooks/useAuth.js
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";

// Contexte d'authentification
const AuthContext = createContext();

// Provider du contexte d'authentification
export function AuthProvider({ children }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Vérifier l'état d'authentification au chargement
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/check", {
					method: "GET",
					credentials: "include",
				});
				setIsAuthenticated(response.ok);
			} catch (error) {
				setIsAuthenticated(false);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Fonction de déconnexion
	const logout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			setIsAuthenticated(false);
			router.push("/login");
			router.refresh();
		} catch (error) {
			console.error("Erreur lors de la déconnexion:", error);
		}
	};

	// Fonction de connexion (pour mise à jour de l'état)
	const login = () => {
		setIsAuthenticated(true);
	};

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, loading, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
	return useContext(AuthContext);
}
