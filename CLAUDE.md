# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint via Next.js
npm test             # Run Vitest tests
npm run db:reset     # Reset SQLite database (destructive)
```

All commands require the `NODE_OPTIONS='--require ./node-compat.cjs'` flag (automatically included via npm scripts). Do not omit this when running Next.js commands manually.

Running a single test: `npx vitest run src/lib/__tests__/file-system.test.ts`

## Architecture

### Data Flow

1. User sends message → `ChatInterface` → `POST /api/chat`
2. The API route streams a Claude response with tool calls
3. Tool calls (`str_replace_editor`, `file_manager`) update the virtual file system via `FileSystemContext`
4. `PreviewFrame` picks up file changes and re-renders the iframe by running JSX through `@babel/standalone`

### Key Contexts

- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`): Holds the in-memory virtual file system. The AI writes files here; the preview reads from here. This is the central state for generated code.
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`): Manages chat messages and coordinates streaming AI responses with tool execution callbacks.

### Virtual File System (`src/lib/file-system.ts`)

A fully in-memory file system (no disk I/O). Files are stored as a plain object map. The AI manipulates files through two tools:
- `str_replace_editor` — creates files or performs string replacement within existing files
- `file_manager` — renames or deletes files

### Preview Pipeline (`src/lib/transform/jsx-transformer.ts`)

JSX files from the virtual FS → Babel transform → generates an import map + HTML document → injected into a sandboxed `<iframe>`. The iframe uses `allow-scripts allow-same-origin`. External packages are resolved via esm.sh CDN in the import map.

### AI Integration (`src/app/api/chat/route.ts`)

Uses Vercel AI SDK with `@ai-sdk/anthropic`. The system prompt lives in `src/lib/prompts/generation.tsx`. Tool definitions are in `src/lib/tools/`. The provider can be swapped to a mock via `src/lib/provider.ts` when `ANTHROPIC_API_KEY` is not set.

### Authentication

JWT tokens via `jose`, stored in HTTP-only cookies. Password hashing via `bcrypt`. Server actions in `src/actions/` handle sign-up, sign-in, sign-out, and project CRUD. Anonymous users are tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts` — their work is preserved until they register.

### Database

SQLite via Prisma. Schema at `prisma/schema.prisma` — reference it whenever you need to understand the structure of data stored in the database. The generated client is in `src/generated/prisma/`. Always run `npx prisma generate` after schema changes.

## Stack

- **Next.js 15** with App Router and React 19
- **Tailwind CSS v4** (PostCSS plugin, not the CLI)
- **shadcn/ui** ("new-york" style, neutral base) with Radix UI primitives
- **Monaco Editor** for the in-app code editor
- **Vitest** + jsdom for tests; `@testing-library/react` for component tests
- Path alias `@/*` maps to `src/*`

## Code Style

Use comments sparingly. Only comment complex or non-obvious code.