// Seed script to populate the database with sample blog data
// Run with: bun run seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.author.deleteMany();

  // Create authors
  const john = await prisma.author.create({
    data: {
      id: "demo-author-1",
      email: "john@example.com",
      name: "John Doe",
      bio: "Full-stack developer and technical writer. Passionate about web technologies and clean code.",
    },
  });

  const jane = await prisma.author.create({
    data: {
      id: "demo-author-2",
      email: "jane@example.com",
      name: "Jane Smith",
      bio: "Frontend specialist with a love for React and TypeScript. Building beautiful UIs since 2015.",
    },
  });

  console.log("✅ Created authors:", { john: john.name, jane: jane.name });

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: "Next.js",
        slug: "nextjs",
      },
    }),
    prisma.tag.create({
      data: {
        name: "TypeScript",
        slug: "typescript",
      },
    }),
    prisma.tag.create({
      data: {
        name: "React",
        slug: "react",
      },
    }),
    prisma.tag.create({
      data: {
        name: "Prisma",
        slug: "prisma",
      },
    }),
    prisma.tag.create({
      data: {
        name: "Database",
        slug: "database",
      },
    }),
  ]);

  console.log("✅ Created tags:", tags.map(t => t.name).join(", "));

  // Create posts
  const posts = [
    {
      title: "Getting Started with Next.js 15 and Prisma",
      slug: "nextjs-15-prisma-guide",
      excerpt: "Learn how to build a full-stack application with Next.js 15 and Prisma ORM. We'll cover setup, schema design, and best practices.",
      content: `Next.js 15 brings exciting new features that pair perfectly with Prisma ORM for building full-stack applications.

In this guide, we'll explore:
- Setting up a Next.js 15 project with TypeScript
- Integrating Prisma for database management
- Using Server Components and Server Actions
- Implementing type-safe database queries
- Best practices for production deployment

The combination of Next.js and Prisma provides an excellent developer experience with full type safety from database to frontend.

Let's start by creating a new Next.js project and adding Prisma...`,
      published: true,
      publishedAt: new Date("2024-01-15"),
      authorId: john.id,
      tags: {
        connect: [
          { id: tags[0].id }, // Next.js
          { id: tags[3].id }, // Prisma
        ],
      },
    },
    {
      title: "Building Type-Safe Forms with React Hook Form and Zod",
      slug: "type-safe-forms-rhf-zod",
      excerpt: "Discover how to create robust, type-safe forms using React Hook Form and Zod validation. Includes autosave functionality!",
      content: `Forms are a crucial part of web applications, and ensuring they're type-safe can prevent many runtime errors.

Today we'll build a complete form solution using:
- React Hook Form for form state management
- Zod for schema validation
- TypeScript for end-to-end type safety
- Autosave functionality with field-level tracking

This approach gives us:
- Compile-time type checking
- Runtime validation
- Excellent performance
- Great developer experience

Here's how to implement a form with these technologies...`,
      published: true,
      publishedAt: new Date("2024-01-20"),
      authorId: jane.id,
      tags: {
        connect: [
          { id: tags[1].id }, // TypeScript
          { id: tags[2].id }, // React
        ],
      },
    },
    {
      title: "Optimistic Updates in React Query",
      slug: "optimistic-updates-react-query",
      excerpt: "Master the art of optimistic updates to create snappy, responsive UIs with React Query (TanStack Query).",
      content: `Optimistic updates are a powerful pattern for creating responsive user interfaces that feel instant.

With React Query (now TanStack Query), implementing optimistic updates is straightforward:

1. Update the cache immediately when a mutation starts
2. Roll back the changes if the mutation fails
3. Reconcile with server data when the mutation succeeds

This pattern is especially useful for:
- Todo lists and task managers
- Comment systems
- Like/favorite buttons
- Any interaction where immediate feedback improves UX

Let's implement optimistic updates step by step...`,
      published: true,
      publishedAt: new Date("2024-01-25"),
      authorId: john.id,
      tags: {
        connect: [
          { id: tags[2].id }, // React
        ],
      },
    },
    {
      title: "Database Migrations with Prisma",
      slug: "prisma-migrations-guide",
      excerpt: "A comprehensive guide to managing database schema changes with Prisma Migrate in development and production.",
      content: `Database migrations are essential for evolving your application's data model over time.

Prisma Migrate provides a declarative way to manage schema changes:

Key concepts:
- Development migrations for rapid iteration
- Production migrations for safe deployments
- Migration history tracking
- Rollback strategies
- Data migrations and seeding

Best practices:
- Always review generated SQL before applying
- Test migrations in staging environments
- Keep migrations small and focused
- Document breaking changes

Let's explore each aspect in detail...`,
      published: true,
      publishedAt: new Date("2024-02-01"),
      authorId: jane.id,
      tags: {
        connect: [
          { id: tags[3].id }, // Prisma
          { id: tags[4].id }, // Database
        ],
      },
    },
    {
      title: "Draft: Advanced Patterns in Next.js",
      slug: "advanced-nextjs-patterns",
      excerpt: "Exploring advanced patterns and techniques for building scalable Next.js applications.",
      content: `This is a draft post about advanced Next.js patterns.

Topics to cover:
- Parallel and intercepting routes
- Advanced middleware patterns
- Optimizing bundle size
- Custom server implementations
- Monorepo setups

(This post is still being written...)`,
      published: false,
      publishedAt: null,
      authorId: john.id,
      tags: {
        connect: [
          { id: tags[0].id }, // Next.js
        ],
      },
    },
    {
      title: "Draft: The Future of Full-Stack TypeScript",
      slug: "future-fullstack-typescript",
      excerpt: "Examining the current state and future trends of full-stack TypeScript development.",
      content: `Work in progress...

The TypeScript ecosystem continues to evolve rapidly. This post will explore:
- Current state of the ecosystem
- Emerging patterns and tools
- Predictions for the future

Check back soon for the complete article!`,
      published: false,
      publishedAt: null,
      authorId: jane.id,
      tags: {
        connect: [
          { id: tags[1].id }, // TypeScript
        ],
      },
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({
      data: postData,
      include: {
        author: true,
        tags: true,
      },
    });
    console.log(`✅ Created post: "${post.title}" by ${post.author.name}`);
  }

  const postCount = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { published: true } });
  const draftCount = await prisma.post.count({ where: { published: false } });

  console.log("\n📊 Database summary:");
  console.log(`  - Total posts: ${postCount}`);
  console.log(`  - Published: ${publishedCount}`);
  console.log(`  - Drafts: ${draftCount}`);
  console.log(`  - Authors: ${await prisma.author.count()}`);
  console.log(`  - Tags: ${await prisma.tag.count()}`);
  
  console.log("\n✨ Seeding complete!");
  console.log("\n💡 Tips for testing:");
  console.log("  - The mock auth in lib/auth.ts logs you in as 'John Doe' (demo-author-1)");
  console.log("  - John can edit/delete his own posts but not Jane's posts");
  console.log("  - Try the autosave feature by editing a post - watch the field indicators!");
  console.log("  - Check the admin page to see all posts including drafts");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });