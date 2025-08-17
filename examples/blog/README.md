# Flow Blog Example

This example demonstrates a blog application built with Next.js and the `next-prisma-flow` state engine. It showcases generated hooks, forms, and server actions for working with Prisma models.

## Getting Started

Install dependencies and generate Prisma client and Flow code:

```bash
npm install
npm run generate
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The app demonstrates:

- Listing posts with `usePostList`
- Viewing individual posts with `usePost`
- Creating posts with `usePostForm`
- Global Flow context via `FlowProvider`

Generated code will appear in `lib/flow` after running `npm run generate`.
