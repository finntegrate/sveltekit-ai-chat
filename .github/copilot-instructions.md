# GitHub Copilot Instructions

## Package Management

This project uses **pnpm** as the package manager. Please use `pnpm` commands instead of `npm` or `yarn`:

- ✅ Use: `pnpm install` (not `npm install`)
- ✅ Use: `pnpm add <package>` (not `npm install <package>`)
- ✅ Use: `pnpm add -D <package>` (not `npm install --save-dev <package>`)
- ✅ Use: `pnpm remove <package>` (not `npm uninstall <package>`)
- ✅ Use: `pnpm run <script>` (not `npm run <script>`)

## Project Context

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS + daisyUI
- **AI SDK**: Vercel AI SDK
- **Linting**: ESLint + Prettier
- **Testing**: Vitest

## Code Style Preferences

- Use **2 spaces** for indentation (no tabs)
- Use **single quotes** for strings
- Use **explicit types** instead of `any`
- Follow the existing error handling patterns
- Use proper TypeScript types for better type safety

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run linting and formatting checks
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
