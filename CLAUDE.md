# CONSTITUTION
1. Keep going until the job is completely solved before ending your turn.
2. Use your tools don’t guess. If your’re unsure about code or files, open them– do not hallucinate.
3. Plan, then reflect. Plan thoroughly before every tool call and reflect on the outcome after.

# Rules, Code Style & Best Practices

- Prefer for...of instead of forEach. (biomelint/complexity/noForEach)
- Default to using Bun instead of Node.js.
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.
- Always run `bun run check:fix` after making changes to fix formatting and linting.
- Always run `bun run tsc` after making changes to check for type errors.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **next-prisma-flow**, a Prisma generator that scaffolds a full-stack typesafe state management system for Next.js applications with a modern, intuitive developer experience. It generates API routes, server actions, Jotai state management, enhanced React hooks, and smart form integration from the given Prisma schema.

Workflow

1. Update the baseline with the new feature spec.
2. Implement the feature in the generator.
3. Run the test‑suite (bun test) to ensure baseline parity.
4. Document breaking changes or improvements.
5. Bump version compatibility notes.


## Development Commands

```bash
# Build the generator (copies to examples/todolist/generator.js)
bun run build

# Run generator directly for testing
bun run dev

# Test the generator and evaluate the generated code against the baseline
bun test

# Lint and format code
bun run check
bun run check:fix

# Type check the generator
bun run tsc

# Type check the example project generated code
cd examples/blog
bun run tsc

# Test with example project
cd examples/blog
bunx prisma generate
bun run tsc:generated
bun run dev
```

### Example Project Commands

The todolist example uses these additional commands:

```bash
# Database operations
bun run db:generate  # Generate Prisma client

# Type check the example project generated code
bun run tsc:generated

# Format and lint the example project
bun run check:fix

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
  output   = "../flow"
  models   = ["Author", "Post", "Category"]
  
  authorSelect     = ["id", "name", "email", "avatar"]
  authorOptimistic = "overwrite"
  authorPagination = "false"
  
  postSelect     = ["id", "title", "description", "status", "publishedAt", "createdAt", "updatedAt", "author", "category", "comments"]
  postOptimistic = "overwrite"
  postPagination = "true"
}
```

### Key Configuration Options

- **select**: Array of fields to expose in API responses (security whitelist)
- **optimistic**: Strategy for optimistic updates ("merge", "overwrite")
- **pagination**: Enable pagination utilities ("true"/"false")
- **prismaClientPath**: Path to Prisma client instance (auto-resolved from schema location)

All configuration options are optional.

## Generated Code Layout

For each Prisma model Post we materialise:

flow/
 └─ post/
     ├─ atoms.ts      ← synchronous entity & patch atoms
     ├─ fx.ts         ← write‑only async atoms (server actions + optimistic)
     ├─ derived.ts    ← selectors & loadable views
     ├─ hooks.ts      ← React hooks (CRUD + forms)
     ├─ store.ts      ← createScopedStore() helper (opt‑in)
     ├─ actions.ts    ← plain server actions wrapper for all prisma queries (full feature parity)
     ├─ schemas.ts    ← zod‑prisma validation schemas
     ├─ types.ts      ← re‑exported Prisma & helper types
     └─ index.ts      ← public barrel (see §3)

Why this structure?
- Clear separation of concerns – data (atoms) vs. side‑effects (fx) vs. view (derived).
- Fine‑grained reactivity – UI rerenders only when relevant atoms change.
- Server‑friendly – per‑request createStore() enables RSC or parallel test isolation.

## **Public Export Surface:**
```typescript
// generated/flow/post/index.ts
import * as State   from "./atoms"        // friendly alias
import * as atoms   from "./atoms"        // expert access
import { createPostStore } from "./store"
import * as Hooks   from "./hooks"
import * as Actions from "./actions"
import * as Types   from "./types"
import * as Schemas from "./schemas"

export const posts = {
  /** Low‑level synchronous Jotai atoms (advanced) */
  atoms,
  /** Friendly alias – use in docs & samples */
  state: State,
  /** Per‑request scoped store (SSR / tests) */
  createStore: createPostStore,
  /** Client‑side convenience hooks */
  hooks: Hooks,
  /** Typed server actions */
  actions: Actions,
  /** zod schemas & TypeScript types */
  schemas: Schemas,
  types: Types,
} as const

// Common re‑exports
export const { usePosts, usePost, usePostForm } = Hooks
export type { Post, PostCreateInput, PostWhereUniqueInput }
```

Developers interact almost exclusively with hooks, actions, or state; raw atoms remain accessible for advanced composition.

## State Management Architecture

| Layer            | File         | Responsibility                                                                                        |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| **Raw atoms**    | `atoms.ts`   | Pure, synchronous source‑of‑truth (`entitiesAtom`, `pendingPatchesAtom`).                             |
| **Side‑effects** | `fx.ts`      | Write‑only async atoms (create/update/delete) that handle optimistic updates and call server actions. |
| **Derived view** | `derived.ts` | Read‑only selectors (`listAtom`, `loadingAtom`) & `loadable()` wrappers – no manual flags.            |
| **React hooks**  | `hooks.ts`   | Glue layer transforming atom data into ergonomic hooks (`usePosts`, `usePost`).                       |

Benefits:

* **Predictable** – data graph mirrors DB table; operations isolated.
* **Optimistic** – UI updates instantly; reconciliation handled centrally.
* **Testable** – store can be swapped with `createScopedStore()`.


## Template System

Templates in `src/templates/` use string interpolation for code generation:
- Each template exports a function that takes model data and returns generated code
- Templates handle imports, type definitions, and business logic patterns
- Generated code follows Next.js App Router conventions
- Themplates do not contain any hardcoded model names or fields etc. Everything is dynamic and constructed from the schema using the DMMF (https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts).


## Baseline

The baseline is the golden standard for the generator. It is the reference implementation of the generator. It is used to test the generator and to ensure that the generator is working correctly. Always ensure the generator is working correctly against the baseline by running the test suite.

@baseline/README.md

## 6 · Usage Examples

### 6.1 List & Create (App Router)

```tsx
// app/(dashboard)/posts/page.tsx
import { posts, categories } from "./generated/flow"

export default function PostsPage() {
  const {
    data: posts,
    createPost,
    updatePost,
    deletePost,
    loading,
    error,
  } = posts.hooks.usePosts()

  const { data: categories } = categories.hooks.useCategories()

  // react‑hook‑form + zod, auto‑generated by the generator
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = posts.hooks.usePostForm()

  const onSubmit = handleSubmit(async (values) => {
    await createPost(values)
  })

  if (loading) return <p>Loading…</p>
  if (error)   return <p>{error.message}</p>

  return (
    <section>
      <form onSubmit={onSubmit} className="space-y-2">
        <input {...register("title")} placeholder="Title" />
        <textarea {...register("description")} placeholder="Description" />
        <button type="submit">Add</button>
        {errors.title && <p>{errors.title.message}</p>}
      </form>

      <ul className="mt-4 space-y-1">
        {posts.map((p) => (
          <PostItem key={p.id} id={p.id} />
        ))}
      </ul>
    </section>
  )
}
```

### 6.2 Individual Item

```tsx
// components/PostItem.tsx
import { posts, PostWhereUniqueInput } from "@/flow"

export default function PostItem({ id }: PostWhereUniqueInput) {
  const {
    data,
    updatePost,
    deletePost,
    loading,
    error,
  } = posts.hooks.usePost({ id })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = posts.hooks.usePostForm(data)

  if (loading) return <li>Loading…</li>
  if (error)   return <li>{error.message}</li>
  if (!data)   return null

  const onSubmit = handleSubmit(async (values) => {
    await updatePost(id, values)
  })

  return (
    <li className="space-y-1">
      <form onSubmit={onSubmit}>
        <input {...register("title")} defaultValue={data.title} />
        <button type="submit">Save</button>
      </form>
      <button onClick={() => deletePost(id)}>Delete</button>
    </li>
  )
}
```

### 6.3 Custom Derived State

```ts
// hooks/useMyPosts.ts
import { atom } from "jotai"
import { posts } from "./generated/flow"
import { atomFamily } from 'jotai/utils'

export const myPostsAtom = atom((get) => {
  const allPosts = get(posts.state.entitiesAtom)
  return Object.values(allPosts).filter((p) => p.authorId === currentUserId)
})

export const publishPostAtom = atomFamily((postId: string) =>
  atom(null, async (get, set) => {
    set(posts.state.pendingPatchesAtom, (p) => ({ ...p, [postId]: { type: 'update' } }))

    try {
      const updated = await posts.actions.update(postId, { status: 'PUBLISHED' })
      set(posts.state.entitiesAtom, (m) => ({ ...m, [postId]: updated }))
    } finally {
      set(posts.state.pendingPatchesAtom, (p) => {
        const { [postId]: _, ...rest } = p
        return rest
      })
    }
  })
)
```

## Important Development Notes

- Always run `bun run build` after template changes to build the generator and update the example project
- The generator copies itself to `examples/blog/generator.js` for local testing
- Use the blog example to validate changes before committing
- Generated code should align with the baseline. Validate against the baseline by running `bun run baseline:compare`
- Security: Always configure `select` arrays as configured in the generator config (or default to all fields)
- Clean, modern API for convenient and intuitive use