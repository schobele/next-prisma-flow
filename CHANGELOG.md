# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-01

### Added
- 🚀 Initial release of Next Prisma Flow Generator
- ⚡ Full-stack code generation from Prisma schema
- 🔒 End-to-end type safety with TypeScript and Zod validation
- 🎯 Smart relationship handling with circular reference prevention
- 📦 Server actions with automatic cache invalidation
- 🌊 Jotai atoms for reactive state management
- 🎣 React hooks with optimistic updates
- 🛤️ API route handlers for RESTful endpoints
- 📝 Comprehensive type definitions
- 🔄 Batch operations with proper CreateManyInput schemas
- 🎨 Barrel exports for clean imports
- 📚 TodoList example application

### Features
- **Type-Safe Code Generation**: Generates fully typed server actions, hooks, atoms, and types
- **Smart Select Objects**: Configurable field selection with relationship filtering
- **Circular Reference Prevention**: Intelligent handling of model relationships to prevent infinite loops
- **Optimistic Updates**: Built-in optimistic UI updates with automatic rollback on errors
- **Cache Invalidation**: Automatic Next.js cache tag invalidation on mutations
- **Zod Validation**: Input validation using Zod schemas with proper type inference
- **Batch Operations**: Efficient `createMany` and `deleteMany` operations
- **Flexible Configuration**: Model-specific configuration for select fields, optimistic strategies, and more

### Configuration
```prisma
generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"
  models   = ["User", "Post", "Category"]
  
  # Model-specific configuration
  userSelect = ["id", "name", "email"]
  postSelect = ["id", "title", "content", "author"]
}
```

### Generated Code Structure
```
generated/flow/
├── index.ts              # Main exports
├── store.ts              # Central Jotai store
├── actions.ts            # Barrel exports for actions
├── atoms.ts              # Barrel exports for atoms
├── hooks.ts              # Barrel exports for hooks
├── types.ts              # Barrel exports for types
└── [model]/
    ├── actions.ts        # Server actions
    ├── atoms.ts          # Jotai atoms
    ├── hooks.ts          # React hooks
    ├── routes.ts         # API routes
    └── types.ts          # TypeScript types
```

### Requirements
- Node.js >= 18.0.0
- TypeScript >= 5.0.0
- Prisma >= 5.0.0
- Next.js 13.4+ (App Router)
- React 18+
- Jotai
- Zod