import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

// Define constants for status and priority
const TodoStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

const TodoPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data
  await prisma.tag.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    },
  });

  console.log('✅ Created users');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'work', color: '#3b82f6' } }),
    prisma.tag.create({ data: { name: 'personal', color: '#10b981' } }),
    prisma.tag.create({ data: { name: 'urgent', color: '#ef4444' } }),
    prisma.tag.create({ data: { name: 'ideas', color: '#8b5cf6' } }),
    prisma.tag.create({ data: { name: 'shopping', color: '#f59e0b' } }),
    prisma.tag.create({ data: { name: 'health', color: '#ec4899' } }),
  ]);

  console.log('✅ Created tags');

  // Create lists for user1
  const inbox = await prisma.list.create({
    data: {
      name: 'Inbox',
      description: 'Default inbox for new tasks',
      icon: '📥',
      color: '#6b7280',
      isDefault: true,
      orderIndex: 0,
      userId: user1.id,
    },
  });

  const workList = await prisma.list.create({
    data: {
      name: 'Work',
      description: 'Work-related tasks and projects',
      icon: '💼',
      color: '#3b82f6',
      orderIndex: 1,
      userId: user1.id,
    },
  });

  const personalList = await prisma.list.create({
    data: {
      name: 'Personal',
      description: 'Personal tasks and reminders',
      icon: '🏠',
      color: '#10b981',
      orderIndex: 2,
      userId: user1.id,
    },
  });

  const projectList = await prisma.list.create({
    data: {
      name: 'Side Project',
      description: 'Tasks for the new app development',
      icon: '🚀',
      color: '#8b5cf6',
      orderIndex: 3,
      userId: user1.id,
    },
  });

  console.log('✅ Created lists');

  // Create todos with various states
  const todo1 = await prisma.todo.create({
    data: {
      title: 'Review quarterly report',
      description: 'Review and provide feedback on Q4 2024 report',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.HIGH,
      dueDate: new Date('2024-08-15'),
      orderIndex: 0,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[2].id }],
      },
    },
  });

  const todo2 = await prisma.todo.create({
    data: {
      title: 'Team meeting preparation',
      description: 'Prepare slides and agenda for weekly team sync',
      status: TodoStatus.TODO,
      priority: TodoPriority.MEDIUM,
      dueDate: new Date('2024-08-14'),
      orderIndex: 1,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  // Create a todo with subtasks
  const mainTodo = await prisma.todo.create({
    data: {
      title: 'Launch new feature',
      description: 'Complete all tasks for feature launch',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.URGENT,
      dueDate: new Date('2024-08-20'),
      orderIndex: 2,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[2].id }],
      },
    },
  });

  // Create subtasks
  await prisma.todo.create({
    data: {
      title: 'Write documentation',
      description: 'Create user documentation for the new feature',
      status: TodoStatus.COMPLETED,
      priority: TodoPriority.MEDIUM,
      completedAt: new Date('2024-08-10'),
      orderIndex: 0,
      listId: workList.id,
      userId: user1.id,
      parentId: mainTodo.id,
    },
  });

  await prisma.todo.create({
    data: {
      title: 'QA testing',
      description: 'Complete QA testing and bug fixes',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.HIGH,
      orderIndex: 1,
      listId: workList.id,
      userId: user1.id,
      parentId: mainTodo.id,
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Deploy to production',
      description: 'Deploy feature to production environment',
      status: TodoStatus.TODO,
      priority: TodoPriority.HIGH,
      orderIndex: 2,
      listId: workList.id,
      userId: user1.id,
      parentId: mainTodo.id,
    },
  });

  // Personal todos
  await prisma.todo.create({
    data: {
      title: 'Grocery shopping',
      description: 'Buy groceries for the week',
      status: TodoStatus.TODO,
      priority: TodoPriority.MEDIUM,
      dueDate: new Date('2024-08-13'),
      orderIndex: 0,
      listId: personalList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[1].id }, { id: tags[4].id }],
      },
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Doctor appointment',
      description: 'Annual checkup at 2 PM',
      status: TodoStatus.TODO,
      priority: TodoPriority.HIGH,
      dueDate: new Date('2024-08-18'),
      orderIndex: 1,
      listId: personalList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[1].id }, { id: tags[5].id }],
      },
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Call mom',
      description: "It's her birthday!",
      status: TodoStatus.TODO,
      priority: TodoPriority.URGENT,
      dueDate: new Date('2024-08-14'),
      orderIndex: 2,
      listId: personalList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[1].id }],
      },
    },
  });

  // Completed todos
  await prisma.todo.create({
    data: {
      title: 'Submit expense report',
      description: 'Submit Q3 expense report',
      status: TodoStatus.COMPLETED,
      priority: TodoPriority.MEDIUM,
      completedAt: new Date('2024-08-05'),
      orderIndex: 3,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Book flight tickets',
      description: 'Book tickets for conference',
      status: TodoStatus.COMPLETED,
      priority: TodoPriority.HIGH,
      completedAt: new Date('2024-08-08'),
      orderIndex: 3,
      listId: personalList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[1].id }],
      },
    },
  });

  // Archived todos
  await prisma.todo.create({
    data: {
      title: 'Old project cleanup',
      description: 'Archive old project files',
      status: TodoStatus.CANCELLED,
      priority: TodoPriority.LOW,
      orderIndex: 99,
      isArchived: true,
      listId: workList.id,
      userId: user1.id,
    },
  });

  // Inbox items
  await prisma.todo.create({
    data: {
      title: 'Review new proposal',
      description: 'Check the new project proposal from client',
      status: TodoStatus.TODO,
      priority: TodoPriority.MEDIUM,
      orderIndex: 0,
      listId: inbox.id,
      userId: user1.id,
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Research new framework',
      description: 'Look into the new React features',
      status: TodoStatus.TODO,
      priority: TodoPriority.LOW,
      orderIndex: 1,
      listId: inbox.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[3].id }],
      },
    },
  });

  // Project todos
  await prisma.todo.create({
    data: {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated deployment',
      status: TodoStatus.TODO,
      priority: TodoPriority.HIGH,
      orderIndex: 0,
      listId: projectList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Design database schema',
      description: 'Create Prisma schema for the new features',
      status: TodoStatus.COMPLETED,
      priority: TodoPriority.HIGH,
      completedAt: new Date('2024-08-09'),
      orderIndex: 1,
      listId: projectList.id,
      userId: user1.id,
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Implement authentication',
      description: 'Add user authentication with NextAuth',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.URGENT,
      orderIndex: 2,
      listId: projectList.id,
      userId: user1.id,
    },
  });

  // Create a few todos for user2
  const user2List = await prisma.list.create({
    data: {
      name: 'My Tasks',
      description: 'Personal task list',
      icon: '📝',
      color: '#06b6d4',
      isDefault: true,
      orderIndex: 0,
      userId: user2.id,
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Prepare presentation',
      description: 'Create slides for client meeting',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.HIGH,
      dueDate: new Date('2024-08-16'),
      orderIndex: 0,
      listId: user2List.id,
      userId: user2.id,
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  await prisma.todo.create({
    data: {
      title: 'Code review',
      description: 'Review PRs from the team',
      status: TodoStatus.TODO,
      priority: TodoPriority.MEDIUM,
      orderIndex: 1,
      listId: user2List.id,
      userId: user2.id,
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  console.log('✅ Created todos with subtasks and tags');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });