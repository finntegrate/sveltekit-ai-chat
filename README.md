# SvelteKit AI Chat Assistant

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/finntegrate/sveltekit-ai-chat?quickstart=1)

A modern, responsive chatbot application built with SvelteKit, showcasing how to create an AI-powered chat interface using the Vercel AI SDK. This project demonstrates best practices for building conversational AI applications with a beautiful, professional UI powered by daisyUI and Tailwind CSS.

## Features

- 🤖 **AI-Powered Chat**: Interactive conversations with OpenAI's language models
- 💬 **Modern UI**: Beautiful chat interface with daisyUI components
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Streaming**: Live message streaming for natural conversations
- 🎨 **Professional Styling**: Clean, modern design with Tailwind CSS
- 🔧 **Tool Integration**: Support for AI tool invocations and function calls

## Tech Stack

- **Framework**: SvelteKit
- **AI SDK**: Vercel AI SDK
- **Styling**: Tailwind CSS + daisyUI
- **Language Model**: Any model supported by Vercel AI SDK (e.g., OpenAI GPT-3.5, GPT-4)
- **Type Safety**: TypeScript

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- pnpm package manager (install with `npm install -g pnpm`)
- An OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

### Installation

1. **Clone or create the project:**

```bash
# clone the project
git clone https://github.com/finntegrate/sveltekit-ai-chat
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace `your_openai_api_key_here` with your actual OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

⚠️ **Important**: Never commit your `.env.local` file to version control. It contains sensitive API keys.

## Line Ending Configuration

This project is configured to use consistent line endings (LF) across all platforms to prevent issues with Windows machines changing line endings and creating large diffs.

### What's Configured

- **`.gitattributes`**: Enforces LF line endings for all text files
- **`.editorconfig`**: Ensures consistent editor behavior across IDEs
- **`.prettierrc`**: Configured with `endOfLine: "lf"`
- **DevContainer**: Automatically configures Git settings when using the devcontainer

### Manual Configuration

If you prefer to configure manually:

```bash
git config core.autocrlf false
git config core.eol lf
git add --renormalize .
```

## Development

Once you've completed the installation steps above, start the development server:

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev --open
```

The application will be available at `http://localhost:5173` (or the next available port).

### Project Structure

```
src/
├── routes/
│   ├── +layout.svelte          # Main layout with global styles
│   ├── +page.svelte            # Chat interface component
│   └── api/chat/+server.ts     # API endpoint for chat functionality
├── app.css                     # Global Tailwind CSS styles
└── app.html                    # HTML template
```

## Building

To create a production version of your app:

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Customization

### Styling
- The project uses **daisyUI** themes. You can change the theme by modifying the `data-theme` attribute in `app.html`
- Custom styles can be added to `src/app.css`
- Component-specific styles use Tailwind CSS classes

### AI Configuration
- Model settings can be adjusted in `src/routes/api/chat/+server.ts`
- Support for different OpenAI models (GPT-3.5, GPT-4, etc.)
- Streaming and tool integration capabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [Apache 2.0 License](LICENSE).
