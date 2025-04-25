# FlashGenAI

A modern web application that enables users to quickly and effectively create educational flashcards with the support of artificial intelligence.

## Table of Contents

- [FlashGenAI](#flashgenai)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
    - [Key Features](#key-features)
    - [Target Audience](#target-audience)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [AI Integration](#ai-integration)
    - [CI/CD and Hosting](#cicd-and-hosting)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Available Scripts](#available-scripts)
  - [Project Scope](#project-scope)
    - [MVP Features](#mvp-features)
    - [Limitations](#limitations)
    - [What's Not Included in MVP](#whats-not-included-in-mvp)
  - [Project Status](#project-status)
    - [Success Metrics](#success-metrics)
  - [License](#license)

## Project Overview

FlashGenAI addresses the problem of time-consuming manual creation of flashcards, which often discourages users from utilizing the effective learning method of spaced repetition.

### Key Features

- **AI-Powered Flashcard Generation**: Automatically create flashcards in front-back format using GPT models
- **Flashcard Management**: Create, edit, accept/reject, and organize your flashcards
- **Spaced Repetition System**: Simple algorithm to optimize learning and retention
- **User Account System**: Store and manage personal flashcard sets
- **Intuitive Interface**: Easy-to-use UI for reviewing and managing flashcards

### Target Audience

- Students and learners at all levels
- Teachers and educators
- Anyone looking to optimize their learning process with flashcards

## Tech Stack

### Frontend
- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Accessible React components

### Backend
- [Supabase](https://supabase.com/) - PostgreSQL database, authentication, and Backend-as-a-Service
- Open source solution that can be hosted locally or on your own server

### AI Integration
- [Openrouter.ai](https://openrouter.ai/) - API gateway to access various AI models:
  - OpenAI
  - Anthropic
  - Google and others
- Financial limit settings on API keys

### CI/CD and Hosting
- GitHub Actions for CI/CD pipelines
- DigitalOcean for application hosting via Docker

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)
- Supabase account (for backend services)
- Openrouter.ai API key (for AI functionality)

> **Note**: This project uses Node.js 22.14.0, which is a newer version. If you're using nvm (Node Version Manager), you can run `nvm use` to automatically use the version specified in `.nvmrc`.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flashgenai_mvp.git
cd flashgenai_mvp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase and Openrouter.ai credentials (refer to documentation for specific variables)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:4321`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix ESLint issues
- `npm run format` - Format code with Prettier

## Project Scope

### MVP Features

- User registration and authentication system
- AI-powered flashcard generation from text input (1000-10000 characters)
- Flashcard management (accept/reject, edit, delete)
- Simple spaced repetition algorithm
- Basic user dashboard with three main options: Reviews, Your Decks, New Deck

### Limitations

- Limit of 5 flashcard sets generated daily per user
- Text-only flashcards in front-back format (no images or multimedia)
- Web application only (no mobile optimization)
- Simple spaced repetition algorithm based on open-source implementation

### What's Not Included in MVP

- Advanced spaced repetition algorithms (like SuperMemo, Anki)
- PDF, DOCX, and other format imports
- Flashcard sharing between users
- Integration with other educational platforms
- Mobile applications
- Advanced user onboarding
- Payment mechanisms
- Tagging/categorization of flashcard sets
- Merging flashcard sets
- Pre-deployment flashcard testing

## Project Status

FlashGenAI is currently in MVP (Minimum Viable Product) development stage. The focus is on implementing the core functionality described in the project scope.

### Success Metrics

- 75% of AI-generated flashcards are accepted by users
- Users create 75% of all flashcards using AI rather than manual entry

## License

This project is licensed under the MIT License - see the LICENSE file for details.
