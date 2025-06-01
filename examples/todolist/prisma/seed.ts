import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting TodoList seed...");

	// Clean up existing data
	await prisma.todo.deleteMany();
	await prisma.category.deleteMany();
	await prisma.user.deleteMany();

	console.log("🧹 Cleaned existing data");

	// Create sample users
	const users = await Promise.all([
		prisma.user.create({
			data: {
				email: "alice@example.com",
				name: "Alice Johnson",
				avatar: "https://images.unsplash.com/photo-1494790108755-2616b4b33a7e?w=64",
			},
		}),
		prisma.user.create({
			data: {
				email: "bob@example.com",
				name: "Bob Smith",
				avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64",
			},
		}),
	]);

	console.log(`👥 Created ${users.length} users`);

	// Create sample categories
	const categories = await Promise.all([
		prisma.category.create({
			data: {
				name: "Work",
				color: "#3b82f6",
			},
		}),
		prisma.category.create({
			data: {
				name: "Personal",
				color: "#10b981",
			},
		}),
		prisma.category.create({
			data: {
				name: "Shopping",
				color: "#f59e0b",
			},
		}),
		prisma.category.create({
			data: {
				name: "Health",
				color: "#ef4444",
			},
		}),
	]);

	console.log(`📂 Created ${categories.length} categories`);

	// Create sample todos
	const todos = await Promise.all([
		prisma.todo.create({
			data: {
				title: "Complete project proposal",
				description: "Finish the Q1 project proposal and send it to the team for review.",
				status: "IN_PROGRESS",
				priority: "HIGH",
				dueDate: new Date("2024-02-15"),
				userId: users[0].id,
				categoryId: categories[0].id, // Work
			},
		}),
		prisma.todo.create({
			data: {
				title: "Buy groceries",
				description: "Milk, bread, eggs, and vegetables for the week.",
				status: "PENDING",
				priority: "MEDIUM",
				dueDate: new Date("2024-02-10"),
				userId: users[0].id,
				categoryId: categories[2].id, // Shopping
			},
		}),
		prisma.todo.create({
			data: {
				title: "Schedule dentist appointment",
				description: "Book annual dental checkup and cleaning.",
				status: "PENDING",
				priority: "LOW",
				userId: users[0].id,
				categoryId: categories[3].id, // Health
			},
		}),
		prisma.todo.create({
			data: {
				title: "Learn React hooks",
				description: "Complete the React hooks tutorial and practice with a small project.",
				status: "COMPLETED",
				priority: "MEDIUM",
				completedAt: new Date("2024-02-01"),
				userId: users[0].id,
				categoryId: categories[1].id, // Personal
			},
		}),
		prisma.todo.create({
			data: {
				title: "Plan weekend trip",
				description: "Research destinations and book accommodation for the weekend getaway.",
				status: "PENDING",
				priority: "LOW",
				dueDate: new Date("2024-02-20"),
				userId: users[1].id,
				categoryId: categories[1].id, // Personal
			},
		}),
		prisma.todo.create({
			data: {
				title: "Review team performance",
				description: "Conduct quarterly performance reviews for all team members.",
				status: "IN_PROGRESS",
				priority: "HIGH",
				dueDate: new Date("2024-02-12"),
				userId: users[1].id,
				categoryId: categories[0].id, // Work
			},
		}),
	]);

	console.log(`✅ Created ${todos.length} todos`);

	// Summary
	console.log("\n🎉 TodoList seed completed successfully!");
	console.log("\n📊 Summary:");
	console.log(`   👥 Users: ${users.length}`);
	console.log(`   📂 Categories: ${categories.length}`);
	console.log(`   ✅ Todos: ${todos.length}`);

	console.log("\n🚀 Ready to explore TodoList!");
	console.log("\nDemo Users:");
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
