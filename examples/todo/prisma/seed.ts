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

  // Clean up existing data in proper order
  await prisma.todo.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create companies with predictable IDs for auth system
  const company1 = await prisma.company.create({
    data: {
      id: 'cm5a8z9b1c2d3e4f5g6h7i8j', // Acme Corp ID
      name: 'Acme Corporation',
      slug: 'acme-corp',
      logo: '🏢',
      plan: 'pro',
      maxUsers: 25,
      maxStorage: 10000, // 10GB
    },
  });

  const company2 = await prisma.company.create({
    data: {
      id: 'cm5b8z9b1c2d3e4f5g6h7i8j', // StartupFlow ID
      name: 'StartupFlow',
      slug: 'startupflow',
      logo: '🚀',
      plan: 'free',
      maxUsers: 5,
      maxStorage: 1000, // 1GB
    },
  });

  const company3 = await prisma.company.create({
    data: {
      id: 'cm5c8z9b1c2d3e4f5g6h7i8j', // TechSolutions ID
      name: 'TechSolutions Inc',
      slug: 'techsolutions',
      logo: '💻',
      plan: 'enterprise',
      maxUsers: 100,
      maxStorage: 50000, // 50GB
    },
  });

  console.log('✅ Created companies');

  // Create users with company associations and predictable IDs
  const user1 = await prisma.user.create({
    data: {
      id: 'cm5u8z9b1c2d3e4f5g6h7i8j', // John Doe ID
      email: 'john@acme.com',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      role: 'admin',
      companyId: company1.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'cm5v8z9b1c2d3e4f5g6h7i8j', // Jane Smith ID
      email: 'jane@acme.com',
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      role: 'member',
      companyId: company1.id,
    },
  });

  // User in different company
  const user3 = await prisma.user.create({
    data: {
      id: 'cm5w8z9b1c2d3e4f5g6h7i8j', // Alice Johnson ID
      email: 'alice@startupflow.com',
      name: 'Alice Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      role: 'admin',
      companyId: company2.id,
    },
  });

  // User in third company
  const user4 = await prisma.user.create({
    data: {
      id: 'cm5x8z9b1c2d3e4f5g6h7i8j', // Bob Wilson ID
      email: 'bob@techsolutions.com',
      name: 'Bob Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      role: 'viewer',
      companyId: company3.id,
    },
  });

  console.log('✅ Created users across companies');

  // Create tags for company1 (Acme Corp)
  const tagsCompany1 = await Promise.all([
    prisma.tag.create({ data: { name: 'work', color: '#3b82f6', companyId: company1.id } }),
    prisma.tag.create({ data: { name: 'personal', color: '#10b981', companyId: company1.id } }),
    prisma.tag.create({ data: { name: 'urgent', color: '#ef4444', companyId: company1.id } }),
    prisma.tag.create({ data: { name: 'ideas', color: '#8b5cf6', companyId: company1.id } }),
    prisma.tag.create({ data: { name: 'shopping', color: '#f59e0b', companyId: company1.id } }),
    prisma.tag.create({ data: { name: 'health', color: '#ec4899', companyId: company1.id } }),
  ]);

  // Create tags for company2 (StartupFlow) - some overlapping, some unique
  const tagsCompany2 = await Promise.all([
    prisma.tag.create({ data: { name: 'startup', color: '#06b6d4', companyId: company2.id } }),
    prisma.tag.create({ data: { name: 'mvp', color: '#f59e0b', companyId: company2.id } }),
    prisma.tag.create({ data: { name: 'growth', color: '#10b981', companyId: company2.id } }),
    prisma.tag.create({ data: { name: 'urgent', color: '#ef4444', companyId: company2.id } }),
  ]);

  // Create tags for company3 (TechSolutions)
  const tagsCompany3 = await Promise.all([
    prisma.tag.create({ data: { name: 'enterprise', color: '#1f2937', companyId: company3.id } }),
    prisma.tag.create({ data: { name: 'security', color: '#dc2626', companyId: company3.id } }),
    prisma.tag.create({ data: { name: 'architecture', color: '#7c3aed', companyId: company3.id } }),
  ]);

  console.log('✅ Created tags for all companies');

  // Create lists for user1 (Acme Corp)
  const inbox = await prisma.list.create({
    data: {
      name: 'Inbox',
      description: 'Default inbox for new tasks',
      icon: '📥',
      color: '#6b7280',
      isDefault: true,
      orderIndex: 0,
      companyId: company1.id,
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
      companyId: company1.id,
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
      companyId: company1.id,
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
      companyId: company1.id,
      userId: user1.id,
    },
  });

  console.log('✅ Created lists for Acme Corp');

  // Create todos with various states for Acme Corp
  const todo1 = await prisma.todo.create({
    data: {
      title: 'Review quarterly report',
      description: 'Review and provide feedback on Q4 2024 report',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.HIGH,
      dueDate: new Date('2024-08-15'),
      orderIndex: 0,
      companyId: company1.id,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tagsCompany1[0].id }, { id: tagsCompany1[2].id }],
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
      companyId: company1.id,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tagsCompany1[0].id }],
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
      companyId: company1.id,
      listId: workList.id,
      userId: user1.id,
      tags: {
        connect: [{ id: tagsCompany1[0].id }, { id: tagsCompany1[2].id }],
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
      companyId: company1.id,
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
      companyId: company1.id,
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
      companyId: company1.id,
      listId: workList.id,
      userId: user1.id,
      parentId: mainTodo.id,
    },
  });

  // More todos for Acme Corp (company1)
  await Promise.all([
    // Personal todos for user1
    prisma.todo.create({
      data: {
        title: 'Grocery shopping',
        description: 'Buy groceries for the week',
        status: TodoStatus.TODO,
        priority: TodoPriority.MEDIUM,
        dueDate: new Date('2024-08-13'),
        orderIndex: 0,
        companyId: company1.id,
        listId: personalList.id,
        userId: user1.id,
        tags: { connect: [{ id: tagsCompany1[1].id }, { id: tagsCompany1[4].id }] },
      },
    }),
    
    // Inbox item
    prisma.todo.create({
      data: {
        title: 'Review new proposal',
        description: 'Check the new project proposal from client',
        status: TodoStatus.TODO,
        priority: TodoPriority.MEDIUM,
        orderIndex: 0,
        companyId: company1.id,
        listId: inbox.id,
        userId: user1.id,
      },
    }),
  ]);

  // Create list and todos for user2 (also in Acme Corp)
  const user2List = await prisma.list.create({
    data: {
      name: 'Marketing Tasks',
      description: 'Marketing and outreach tasks',
      icon: '📢',
      color: '#06b6d4',
      isDefault: true,
      orderIndex: 0,
      companyId: company1.id,
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
      companyId: company1.id,
      listId: user2List.id,
      userId: user2.id,
      tags: { connect: [{ id: tagsCompany1[0].id }] },
    },
  });

  console.log('✅ Created todos for Acme Corp users');

  // Create data for StartupFlow (company2)
  const startupList = await prisma.list.create({
    data: {
      name: 'MVP Development',
      description: 'Tasks for building our MVP',
      icon: '🚀',
      color: '#f59e0b',
      isDefault: true,
      orderIndex: 0,
      companyId: company2.id,
      userId: user3.id,
    },
  });

  await Promise.all([
    prisma.todo.create({
      data: {
        title: 'Define product requirements',
        description: 'Create detailed PRD for MVP features',
        status: TodoStatus.COMPLETED,
        priority: TodoPriority.HIGH,
        completedAt: new Date('2024-08-05'),
        orderIndex: 0,
        companyId: company2.id,
        listId: startupList.id,
        userId: user3.id,
        tags: { connect: [{ id: tagsCompany2[1].id }] },
      },
    }),
    prisma.todo.create({
      data: {
        title: 'Setup development environment',
        description: 'Configure Next.js, database, and deployment',
        status: TodoStatus.IN_PROGRESS,
        priority: TodoPriority.URGENT,
        orderIndex: 1,
        companyId: company2.id,
        listId: startupList.id,
        userId: user3.id,
        tags: { connect: [{ id: tagsCompany2[0].id }, { id: tagsCompany2[3].id }] },
      },
    }),
    prisma.todo.create({
      data: {
        title: 'User research interviews',
        description: 'Conduct 10 user interviews for validation',
        status: TodoStatus.TODO,
        priority: TodoPriority.MEDIUM,
        orderIndex: 2,
        companyId: company2.id,
        listId: startupList.id,
        userId: user3.id,
        tags: { connect: [{ id: tagsCompany2[2].id }] },
      },
    }),
  ]);

  console.log('✅ Created todos for StartupFlow');

  // Create data for TechSolutions (company3) 
  const enterpriseList = await prisma.list.create({
    data: {
      name: 'Security Audit',
      description: 'Annual security compliance tasks',
      icon: '🔒',
      color: '#dc2626',
      isDefault: true,
      orderIndex: 0,
      companyId: company3.id,
      userId: user4.id,
    },
  });

  await Promise.all([
    prisma.todo.create({
      data: {
        title: 'Review access controls',
        description: 'Audit user permissions and access levels',
        status: TodoStatus.TODO,
        priority: TodoPriority.HIGH,
        orderIndex: 0,
        companyId: company3.id,
        listId: enterpriseList.id,
        userId: user4.id,
        tags: { connect: [{ id: tagsCompany3[1].id }] },
      },
    }),
    prisma.todo.create({
      data: {
        title: 'Update system architecture docs',
        description: 'Document current microservices architecture',
        status: TodoStatus.IN_PROGRESS,
        priority: TodoPriority.MEDIUM,
        orderIndex: 1,
        companyId: company3.id,
        listId: enterpriseList.id,
        userId: user4.id,
        tags: { connect: [{ id: tagsCompany3[2].id }] },
      },
    }),
  ]);

  console.log('✅ Created todos for TechSolutions');
  console.log('🎉 Multi-tenant seed completed successfully!');
  
  // Log summary of created data
  const stats = {
    companies: await prisma.company.count(),
    users: await prisma.user.count(), 
    lists: await prisma.list.count(),
    todos: await prisma.todo.count(),
    tags: await prisma.tag.count(),
  };
  console.log('📊 Created:', stats);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });