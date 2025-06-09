import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting Blog seed...");

	// Clean up existing data
	await prisma.comment.deleteMany();
	await prisma.post.deleteMany();
	await prisma.category.deleteMany();
	await prisma.author.deleteMany();

	console.log("🧹 Cleaned existing data");

	// Create sample authors
	const authors = await Promise.all([
		prisma.author.create({
			data: {
				email: "alice@example.com",
				name: "Alice Johnson",
				avatar: "https://images.unsplash.com/photo-1494790108755-2616b4b33a7e?w=64",
			},
		}),
		prisma.author.create({
			data: {
				email: "bob@example.com",
				name: "Bob Smith",
				avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64",
			},
		}),
	]);

	console.log(`👥 Created ${authors.length} authors`);

	// Create sample categories
	const categories = await Promise.all([
		prisma.category.create({
			data: {
				name: "Technology",
				color: "#3b82f6",
			},
		}),
		prisma.category.create({
			data: {
				name: "Lifestyle",
				color: "#10b981",
			},
		}),
		prisma.category.create({
			data: {
				name: "Travel",
				color: "#f59e0b",
			},
		}),
		prisma.category.create({
			data: {
				name: "Programming",
				color: "#ef4444",
			},
		}),
	]);

	console.log(`📂 Created ${categories.length} categories`);

	// Create sample posts
	const posts = await Promise.all([
		prisma.post.create({
			data: {
				title: "Getting Started with Next.js 14",
				description: "A comprehensive guide to building modern web applications with Next.js 14 and the App Router.",
				status: "PUBLISHED",
				publishedAt: new Date("2024-02-15"),
				authorId: authors[0].id,
				categoryId: categories[0].id, // Technology
			},
		}),
		prisma.post.create({
			data: {
				title: "10 Tips for Better Work-Life Balance",
				description: "Practical strategies to maintain a healthy balance between your professional and personal life.",
				status: "PUBLISHED",
				publishedAt: new Date("2024-02-10"),
				authorId: authors[0].id,
				categoryId: categories[1].id, // Lifestyle
			},
		}),
		prisma.post.create({
			data: {
				title: "Hidden Gems of Southeast Asia",
				description: "Discover amazing destinations off the beaten path in Southeast Asia.",
				status: "DRAFT",
				authorId: authors[0].id,
				categoryId: categories[2].id, // Travel
			},
		}),
		prisma.post.create({
			data: {
				title: "Mastering TypeScript: Advanced Types",
				description: "Deep dive into TypeScript's advanced type system and how to leverage it in your projects.",
				status: "PUBLISHED",
				publishedAt: new Date("2024-02-01"),
				authorId: authors[1].id,
				categoryId: categories[3].id, // Programming
			},
		}),
		prisma.post.create({
			data: {
				title: "The Future of Remote Work",
				description: "Exploring trends and predictions for the future of remote work in a post-pandemic world.",
				status: "DRAFT",
				authorId: authors[1].id,
				categoryId: categories[1].id, // Lifestyle
			},
		}),
	]);

	console.log(`📝 Created ${posts.length} posts`);

	// Create sample comments for published posts
	const publishedPosts = posts.filter(post => post.status === "PUBLISHED");
	const comments = await Promise.all([
		prisma.comment.create({
			data: {
				content: "Great article! The App Router really changes the game for Next.js development.",
				postId: publishedPosts[0].id,
			},
		}),
		prisma.comment.create({
			data: {
				content: "Thank you for sharing these practical tips. Work-life balance is so important.",
				postId: publishedPosts[1].id,
			},
		}),
		prisma.comment.create({
			data: {
				content: "This is exactly what I needed to understand TypeScript better. Bookmarked!",
				postId: publishedPosts[2].id,
			},
		}),
	]);

	console.log(`💬 Created ${comments.length} comments`);

	// Summary
	console.log("\n🎉 Blog seed completed successfully!");
	console.log("\n📊 Summary:");
	console.log(`   👥 Authors: ${authors.length}`);
	console.log(`   📂 Categories: ${categories.length}`);
	console.log(`   📝 Posts: ${posts.length}`);
	console.log(`   💬 Comments: ${comments.length}`);

	console.log("\n🚀 Ready to explore Blog!");
	console.log("\nDemo Authors:");
	console.log("   📧 alice@example.com (Alice Johnson)");
	console.log("   📧 bob@example.com (Bob Smith)");
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
