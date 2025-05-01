import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "Admin - Plateforme de Formation",
	description: "Administration de la plateforme de formation Unity 3D",
	robots: "noindex, nofollow",
};

export default function RootLayout({ children }) {
	return (
		<html lang="fr">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
