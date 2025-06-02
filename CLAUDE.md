# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **next-prisma-flow**, a Prisma generator that scaffolds full-stack typed code for Next.js applications. It generates API routes, server actions, Jotai state management, and React hooks from Prisma schemas.

### Core Architecture

- **Generator Entry Point**: `index.ts` - Main Prisma generator that reads schema and config
- **Code Generation**: `src/templates/` - Template files for generated code (actions, atoms, hooks, routes, types)
- **Configuration**: `src/config.ts` - Parses generator config from Prisma schema
- **Example Implementation**: `examples/todolist/` - Complete working example with Todo app

### Generated Code Structure

For each model, the generator creates:
- `actions.ts` - Server actions with business logic
- `atoms.ts` - Jotai atoms for state management with optimistic updates
- `hooks.ts` - React hooks wrapping state and mutations
- `routes.ts` - Next.js API route handlers
- `types.ts` - TypeScript type definitions

## Development Commands

```bash
# Build the generator (copies to examples/todolist/generator.js)
bun run build

# Run generator directly for testing
bun run dev

# Test the generator
bun test

# Lint and format code
bun run lint
bun run lint:fix

# Test with example project
cd examples/todolist
bun install
bun run generate  # or npx prisma generate
bun run dev       # Start Next.js dev server
```

### Example Project Commands

The todolist example uses these additional commands:

```bash
# Database operations
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
bun run db:studio    # Open Prisma Studio
bun run db:seed      # Seed database with sample data

# Development
bun run dev          # Next.js with Turbopack
bun run build        # Production build
bun run start        # Production server
```

## Configuration System

The generator uses a flat configuration format in `prisma/schema.prisma`:

```prisma
generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"
  models   = ["User", "Todo", "Category"]
  
  # Model-specific config (lowercase model name + property)
  userSelect     = ["id", "name", "email"]
  userOptimistic = "merge"
  
  todoSelect     = ["id", "title", "status", "userId"]
  todoOptimistic = "overwrite"
  todoPagination = "true"
}
```

### Key Configuration Options

- **select**: Array of fields to expose in API responses (security whitelist)
- **optimistic**: Strategy for optimistic updates ("merge", "overwrite", "manual")
- **pagination**: Enable pagination utilities ("true"/"false")
- **zodPrismaImport**: Path to zod-prisma-types generated schemas (auto-resolved from schema location)
- **prismaImport**: Path to Prisma client instance (auto-resolved from schema location)

### Path Resolution System

The generator automatically resolves relative paths in `prismaImport` and `zodPrismaImport` based on:
- Schema file location (from `options.schemaPath`)
- Generated file nesting level (model files are 1 level deep)
- Absolute imports (starting with @/ or not starting with ./) are preserved as-is

Example path resolution:
```
Schema: prisma/schema.prisma
Config: prismaImport = "../src/client"
Generated: generated/flow/user/actions.ts -> import from "../../src/client"
```

## Template System

Templates in `src/templates/` use string interpolation for code generation:
- Each template exports a function that takes model data and returns generated code
- Templates handle imports, type definitions, and business logic patterns
- Generated code follows Next.js App Router conventions

## State Management Architecture

The generated code uses Jotai for state management with:
- **Base atoms**: Hold entity maps (Record<id, Entity>)
- **Derived atoms**: Computed views (lists, loading states)
- **Action atoms**: Write-only atoms for mutations
- **Optimistic updates**: Immediate UI updates with server sync

## Important Development Notes

- Always run `bun run build` after template changes to update the example
- The generator copies itself to `examples/todolist/generator.js` for local testing
- Use the todolist example to validate changes before publishing
- Generated code should follow the existing patterns for consistency
- Security: Always configure `select` arrays to exclude sensitive fields