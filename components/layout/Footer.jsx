export default function Footer() {
	return (
		<footer className="border-t bg-white py-4 text-center text-sm text-muted-foreground dark:bg-card">
			Administration - © {new Date().getFullYear()} WiseTwin
		</footer>
	);
}
