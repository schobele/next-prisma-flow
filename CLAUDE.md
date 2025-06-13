# CONSTITUTION
1. Keep going until the job is completely solved before ending your turn.
2. Use your tools don't guess. If your're unsure about code or files, open them– do not hallucinate.
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

### Latest Enhancement: Smart Form Transformation System

The generator now includes a sophisticated form handling system that automatically handles data transformation between ModelType instances and form input schemas:

- **Automatic Mode Detection**: Forms auto-detect create vs update based on whether an instance is provided
- **Smart Data Transformation**: Nested objects like `author: { id, name }` are automatically transformed to `authorId` for form inputs
- **Flexible Transform Functions**: Custom transformation logic via `fromModelType`, `toCreateInput`, and `toUpdateInput` options
- **Type-Safe Form Handling**: Full TypeScript support with proper inference throughout the form lifecycle

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

For each Prisma model Post we materialise e.g. for the model Post:

flow/
 ├─ index.ts            ← barrel file for all models
 ├─ prisma.ts           ← re‑exported Prisma client
 ├─ zod/
 |   └─ index.ts        ← index for all zod schemas for a model
 ├─ shared/             ← shared code for all models
 |   ├─ actions/
 |   │   ├─ factory.ts  ← factory to create actions for a model
 |   │   └─ unwrap.ts   ← unwraps the result of an action
 |   └─ hooks/
 |       ├─ relation-helper.ts   ← helper to create relation helpers for a model
 |       ├─ use-form-factory.ts  ← enhanced factory to create useForm hooks with smart transformations
 |       └─ useAutoload.ts       ← automatic data loading hook
 └─ post/
     ├─ actions.ts    ← plain server actions wrapper for all prisma queries (full feature parity)
     ├─ atoms.ts      ← synchronous entity & patch atoms
     ├─ config.ts     ← configuration for the model
     ├─ derived.ts    ← selectors & loadable views
     ├─ fx.ts         ← write‑only async atoms (server actions + optimistic)
     ├─ hooks.ts      ← React hooks (CRUD + enhanced forms)
     ├─ index.ts      ← public barrel (see §3)
     ├─ schemas.ts    ← zod‑prisma validation schemas
     └─ types.ts      ← re‑exported Prisma & helper types

Why this structure?
- Clear separation of concerns – data (atoms) vs. side‑effects (fx) vs. view (derived).
- Fine‑grained reactivity – UI rerenders only when relevant atoms change.
- Smart form handling – automatic transformation between ModelType and form schemas.

## **Public Export Surface:**
```typescript
// generated/flow/post/index.ts
import * as Actions from "./actions";
import * as baseAtoms from "./atoms";
import * as derived from "./derived";
import * as fx from "./fx";
import * as Hooks from "./hooks";
import * as Schemas from "./schemas";
import * as Types from "./types";

export type { CreateInput, ModelType as Post, UpdateInput, WhereUniqueInput } from "./types";

const Atoms = {
	...baseAtoms,
	...derived,
	...fx,
};

export const posts = {
	atoms: Atoms,
	hooks: Hooks,
	actions: Actions,
	schemas: Schemas,
	types: Types,
} as const;

export const { usePosts, usePost, usePostForm } = Hooks;
```

Developers interact almost exclusively with hooks, actions, or state; raw atoms remain accessible for advanced composition.

## State Management Architecture

| Layer            | File         | Responsibility                                                                                        |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| **Raw atoms**    | `atoms.ts`   | Pure, synchronous source‑of‑truth (`entitiesAtom`, `pendingPatchesAtom`).                             |
| **Side‑effects** | `fx.ts`      | Write‑only async atoms (create/update/delete) that handle optimistic updates and call server actions. |
| **Derived view** | `derived.ts` | Read‑only selectors (`listAtom`, `loadingAtom`) & `loadable()` wrappers – no manual flags.            |
| **React hooks**  | `hooks.ts`   | Glue layer transforming atom data into ergonomic hooks (`usePosts`, `usePost`, `usePostForm`).        |

Benefits:

* **Predictable** – data graph mirrors DB table; operations isolated.
* **Optimistic** – UI updates instantly; reconciliation handled centrally.
* **Smart Forms** – automatic transformation between ModelType and form input schemas.

## Template System

Templates in `src/templates/` use string interpolation for code generation:
- Each template exports a function that takes model data and returns generated code
- Templates handle imports, type definitions, and business logic patterns
- Generated code follows Next.js App Router conventions
- Themplates do not contain any hardcoded model names or fields etc. Everything must be dynamic and constructed from the schema using the DMMF (https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts).


## Baseline

The baseline is the golden standard for the generator. It is the reference implementation of the generator. It is used to test the generator and to ensure that the generator is working correctly. Always ensure the generator is working correctly against the baseline by running the test suite.

@baseline/README.md

## 6 · Usage Examples

### 6.1 Enhanced Form Handling with Smart Transformations

```tsx
// app/(dashboard)/posts/page.tsx
import { posts, categories } from "@/flow"

export default function PostsPage() {
  const {
    /* data */
    data: postsList,
    count,
    hasAny,

    /* meta */
    loading,
    error,

    /* actions */
    createPost,
    updatePost,
    deletePost,

    /* relations */
    relations,
  } = posts.hooks.usePosts()

  const { data: categoryList } = categories.hooks.useCategories()
  
  // Enhanced form with automatic transformation
  const form = posts.hooks.usePostForm(undefined, {
    onSuccess: () => console.log('Post created!'),
    transform: {
      // Automatic transformation handles: authorId, categoryId extraction
      toCreateInput: (data) => ({
        ...data,
        // Any custom transformation logic can go here
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      }),
    },
  })

  if (loading) return <p>Loading…</p>
  if (error)   return <p>{error.message}</p>

  return (
    <section>
      <h1 className="text-xl font-semibold">Posts ({count})</h1>

      <form onSubmit={form.handleSubmit} className="space-y-2">
        <input {...form.register("title")} placeholder="Title" />
        <textarea {...form.register("description")} placeholder="Description" />
        <select {...form.register("authorId")}>
          {/* Options populated from authors */}
        </select>
        <select {...form.register("categoryId")}>
          {/* Options populated from categories */}
        </select>
        <button type="submit" disabled={form.isSubmitting}>
          {form.isCreating ? 'Creating...' : 'Create Post'}
        </button>
        {form.submitError && <p>Error: {form.submitError.message}</p>}
      </form>

      {!hasAny && <p className="mt-4 italic">No posts yet</p>}

      <ul className="mt-4 space-y-1">
        {postsList.map((p) => (
          <PostItem key={p.id} id={p.id} />
        ))}
      </ul>
    </section>
  )
}
```

### 6.2 Individual Item with Edit Form

```tsx
// components/PostItem.tsx
import { posts } from "@/flow"

export default function PostItem({ id }: { id: string }) {
  const {
    data: post,
    loading,
    error,

    /* entity actions */
    updatePost,
    deletePost,

    /* relation helpers */
    relations: { category },  // ▶ access connect / disconnect helpers
  } = posts.hooks.usePost(id)

  // Enhanced form automatically handles ModelType → UpdateInput transformation
  const form = posts.hooks.usePostForm(post, {
    onSuccess: () => console.log('Post updated!'),
    transform: {
      // Custom transformation if needed - automatic handling includes:
      // - author: { id, name } → authorId
      // - category: { id, name } → categoryId
      // - Arrays like comments are automatically skipped
      fromModelType: (post) => ({
        title: post.title,
        description: post.description,
        status: post.status,
        authorId: post.author?.id || post.authorId,
        categoryId: post.category?.id || post.categoryId,
      }),
    },
  })

  if (loading) return <li>Loading…</li>
  if (error)   return <li>{error.message}</li>
  if (!post)   return null

  const setDraft = () => updatePost({ status: "DRAFT" })
  const publish  = () => updatePost({ status: "PUBLISHED" })

  return (
    <li className="space-y-2 border p-2 rounded-md">
      <form onSubmit={form.handleSubmit} className="space-y-1">
        <input {...form.register("title")} placeholder="Title" />
        <textarea {...form.register("description")} placeholder="Description" />
        <select {...form.register("authorId")}>
          {/* Pre-filled with current author */}
        </select>
        <select {...form.register("categoryId")}>
          {/* Pre-filled with current category */}
        </select>
        <button type="submit" disabled={form.isSubmitting}>
          {form.isUpdating ? 'Updating...' : 'Save Changes'}
        </button>
        {form.submitError && <p>Error: {form.submitError.message}</p>}
      </form>

      <div className="flex gap-2 text-sm">
        <button onClick={setDraft}>Draft</button>
        <button onClick={publish}>Publish</button>
        <button onClick={() => deletePost()}>Delete</button>
      </div>

      <div className="text-xs text-muted-foreground">
        Category: {post.categoryId ?? "–"}
        {/* quick relation connect example */}
        <button
          onClick={() =>
            category.connect({ id: "tech" /* ← choose from list */ })
          }
        >
          set Tech
        </button>
        {!!post.categoryId && (
          <button onClick={() => category.disconnect()}>remove</button>
        )}
      </div>
    </li>
  )
}
```

### 6.3 Form Transformation Examples

```ts
// Advanced form transformation patterns
import { posts } from "@/flow"

// Custom transformation for complex data structures
const customForm = posts.hooks.usePostForm(postInstance, {
  transform: {
    // Transform ModelType to form format (automatic by default)
    fromModelType: (post) => ({
      title: post.title,
      description: post.description,
      authorId: post.author?.id || post.authorId,
      categoryId: post.category?.id || post.categoryId,
      tags: post.tags?.map(tag => tag.id) || [], // Handle arrays
    }),
    
    // Transform form data to CreateInput
    toCreateInput: (formData) => ({
      title: formData.title,
      description: formData.description,
      authorId: formData.authorId,
      categoryId: formData.categoryId,
      status: 'DRAFT', // Set default status
      publishedAt: null,
    }),
    
    // Transform form data to UpdateInput
    toUpdateInput: (formData) => ({
      title: formData.title,
      description: formData.description,
      authorId: formData.authorId,
      categoryId: formData.categoryId,
      // Keep existing status and publishedAt unless explicitly changed
    }),
  },
})
```

### 6.4 Custom Derived State

```ts
// hooks/useMyPosts.ts
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { posts } from "@/flow"

/** Posts authored by the current user */
export const myPostsAtom = atom((get) => {
  const all = get(posts.state.entitiesAtom)
  return Object.values(all).filter((p) => p.authorId === currentUserId)
})

/** "Publish" action with optimistic update */
export const publishPostAtom = atomFamily((postId: string) =>
  atom(null, async (get, set) => {
    // mark pending
    set(posts.state.pendingPatchesAtom, (p) => ({ ...p, [postId]: { type: "update" } }))

    try {
      const updated = await posts.actions.update({ id: postId }, { status: "PUBLISHED" })
      set(posts.state.entitiesAtom, (m) => ({ ...m, [postId]: updated }))
    } finally {
      set(posts.state.pendingPatchesAtom, (p) => {
        const { [postId]: _ignored, ...rest } = p
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
- Form transformations: The system automatically handles common patterns like extracting IDs from nested objects
- Clean, modern API for convenient and intuitive use