# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

-   `npm run dev` - Start development server with Turbopack
-   `npm run build` - Build production version
-   `npm run start` - Start production server
-   `npm run lint` - Run linting
-   `npm run test` - Run tests

## Code Style Guidelines

-   **Imports**: Use absolute paths with `@/` prefix (e.g., `import { X } from "@/components/ui/x"`)
-   **Features**: Chaque feature fait appel a une decomposition en services -> api -> hooks -> composant
-   **Components**: React functional components with `export default`
-   **Naming**: PascalCase for components, camelCase for variables/functions
-   **File Structure**: Group by feature first, then type
-   **Error Handling**: Use error state in hooks, display with Alert components
-   **State Management**: Use React hooks with custom hooks for shared logic
-   **UI Components**: Utilize Radix UI components from components/ui/
-   **CSS**: Use Tailwind utility classes for styling
-   **Types**: JSX components use `.jsx` extension
-   **API Routes**: Implement in `app/api/` directory
-   **Documentation**: Add comments at top of files indicating path
