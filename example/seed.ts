import { prisma } from './lib/prisma'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.author.deleteMany()

  // Create tags
  const techTag = await prisma.tag.create({
    data: { name: 'Technology' }
  })
  
  const tutorialTag = await prisma.tag.create({
    data: { name: 'Tutorial' }
  })
  
  const newsTag = await prisma.tag.create({
    data: { name: 'News' }
  })

  // Create authors
  const alice = await prisma.author.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      bio: 'Tech enthusiast and software developer with 10 years of experience.'
    }
  })

  const bob = await prisma.author.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      bio: 'Writer and blogger focusing on web development and best practices.'
    }
  })

  // Create posts with comments
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Next.js 14',
      content: 'Next.js 14 introduces exciting new features including the App Router, Server Components, and more. This guide will help you get started with building modern web applications.',
      authorId: alice.id,
      tags: {
        connect: [{ id: techTag.id }, { id: tutorialTag.id }]
      },
      comments: {
        create: [
          {
            content: 'Great tutorial! This really helped me understand Server Components.',
            authorId: bob.id
          },
          {
            content: 'Thanks for the clear explanation. Looking forward to more content!',
            authorId: alice.id
          }
        ]
      }
    }
  })

  const post2 = await prisma.post.create({
    data: {
      title: 'The Future of Web Development',
      content: 'Exploring upcoming trends in web development including AI integration, edge computing, and the evolution of JavaScript frameworks.',
      authorId: bob.id,
      tags: {
        connect: [{ id: techTag.id }, { id: newsTag.id }]
      },
      comments: {
        create: [
          {
            content: 'Interesting perspectives on AI integration. Do you think it will replace traditional development?',
            authorId: alice.id
          }
        ]
      }
    }
  })

  const post3 = await prisma.post.create({
    data: {
      title: 'Building Type-Safe APIs with Prisma',
      content: 'Learn how to leverage Prisma ORM to build fully type-safe database queries and mutations in your TypeScript applications.',
      authorId: alice.id,
      tags: {
        connect: [{ id: tutorialTag.id }]
      }
    }
  })

  const post4 = await prisma.post.create({
    data: {
      title: 'React Server Components Deep Dive',
      content: 'Understanding the architecture and benefits of React Server Components, and how they change the way we build React applications.',
      authorId: bob.id,
      tags: {
        connect: [{ id: techTag.id }, { id: tutorialTag.id }]
      },
      comments: {
        create: [
          {
            content: 'This cleared up a lot of confusion I had about Server Components vs Client Components.',
            authorId: alice.id
          },
          {
            content: 'The performance benefits are really impressive!',
            authorId: bob.id
          }
        ]
      }
    }
  })

  const post5 = await prisma.post.create({
    data: {
      title: 'Optimizing Database Queries in Production',
      content: 'Best practices for optimizing database performance including indexing strategies, query optimization, and connection pooling.',
      authorId: alice.id,
      tags: {
        connect: [{ id: techTag.id }]
      }
    }
  })

  console.log('✅ Seeding complete!')
  console.log(`Created ${2} authors, ${5} posts, ${6} comments, and ${3} tags`)
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })