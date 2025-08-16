// Mock authentication system for demonstrating multi-tenant Flow features
// In production, you would integrate with NextAuth.js, Clerk, Auth0, etc.

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string;
  plan: 'free' | 'pro' | 'enterprise';
  maxUsers: number;
  maxStorage: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
  companyId: string;
}

export interface AuthSession {
  user: User;
  company: Company;
  accessToken?: string;
  isAuthenticated: boolean;
}

// Mock data that matches our database seed data
// In production, this would come from your auth provider/database queries
const MOCK_COMPANIES: Company[] = [
  {
    id: 'cm5a8z9b1c2d3e4f5g6h7i8j',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    logo: '🏢',
    plan: 'pro',
    maxUsers: 25,
    maxStorage: 10000,
  },
  {
    id: 'cm5b8z9b1c2d3e4f5g6h7i8j',
    name: 'StartupFlow',
    slug: 'startupflow',
    logo: '🚀',
    plan: 'free',
    maxUsers: 5,
    maxStorage: 1000,
  },
  {
    id: 'cm5c8z9b1c2d3e4f5g6h7i8j',
    name: 'TechSolutions Inc',
    slug: 'techsolutions',
    logo: '💻',
    plan: 'enterprise',
    maxUsers: 100,
    maxStorage: 50000,
  },
];

const MOCK_USERS: User[] = [
  {
    id: 'cm5u8z9b1c2d3e4f5g6h7i8j',
    email: 'john@acme.com',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    role: 'admin',
    companyId: 'cm5a8z9b1c2d3e4f5g6h7i8j',
  },
  {
    id: 'cm5v8z9b1c2d3e4f5g6h7i8j',
    email: 'jane@acme.com',
    name: 'Jane Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    role: 'member',
    companyId: 'cm5a8z9b1c2d3e4f5g6h7i8j',
  },
  {
    id: 'cm5w8z9b1c2d3e4f5g6h7i8j',
    email: 'alice@startupflow.com',
    name: 'Alice Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    role: 'admin',
    companyId: 'cm5b8z9b1c2d3e4f5g6h7i8j',
  },
  {
    id: 'cm5x8z9b1c2d3e4f5g6h7i8j',
    email: 'bob@techsolutions.com',
    name: 'Bob Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    role: 'viewer',
    companyId: 'cm5c8z9b1c2d3e4f5g6h7i8j',
  },
];

/**
 * Mock authentication functions
 * These demonstrate how you would integrate with a real auth system
 */

export async function signIn(email: string, password: string): Promise<AuthSession | null> {
  // Mock sign in - in production, validate credentials with your auth provider
  console.log('🔐 [Auth] Mock sign in attempt:', { email });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = MOCK_USERS.find(u => u.email === email);
  if (!user) {
    console.warn('🔐 [Auth] User not found:', email);
    return null;
  }
  
  const company = MOCK_COMPANIES.find(c => c.id === user.companyId);
  if (!company) {
    console.error('🔐 [Auth] Company not found for user:', user.companyId);
    return null;
  }
  
  const session: AuthSession = {
    user,
    company,
    accessToken: 'mock-jwt-token',
    isAuthenticated: true,
  };
  
  console.log('✅ [Auth] Sign in successful:', { 
    user: user.email, 
    company: company.name,
    role: user.role 
  });
  
  return session;
}

export async function signOut(): Promise<void> {
  console.log('🔐 [Auth] Sign out');
  // In production, clear tokens, cookies, etc.
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  // In production, validate token from cookies/localStorage
  // For demo, return first user as default
  const user = MOCK_USERS[0]; // John Doe from Acme Corp
  const company = MOCK_COMPANIES.find(c => c.id === user.companyId);
  
  if (!company) return null;
  
  return {
    user,
    company,
    accessToken: 'mock-jwt-token',
    isAuthenticated: true,
  };
}

export async function switchCompany(companyId: string, currentUserId: string): Promise<AuthSession | null> {
  console.log('🏢 [Auth] Switching company:', { companyId, currentUserId });
  
  // Find if current user has access to the target company
  // In production, check database for user-company relationships
  const user = MOCK_USERS.find(u => u.id === currentUserId && u.companyId === companyId);
  
  if (!user) {
    console.warn('🏢 [Auth] User does not have access to company:', { companyId, currentUserId });
    return null;
  }
  
  const company = MOCK_COMPANIES.find(c => c.id === companyId);
  if (!company) {
    console.error('🏢 [Auth] Company not found:', companyId);
    return null;
  }
  
  const session: AuthSession = {
    user,
    company,
    accessToken: 'mock-jwt-token',
    isAuthenticated: true,
  };
  
  console.log('✅ [Auth] Company switch successful:', { 
    company: company.name,
    user: user.email 
  });
  
  return session;
}

export function getAvailableUsers(): User[] {
  return MOCK_USERS;
}

export function getAvailableCompanies(): Company[] {
  return MOCK_COMPANIES;
}

/**
 * Utility functions for role-based permissions
 */
export function canManageCompany(role: User['role']): boolean {
  return role === 'admin';
}

export function canManageUsers(role: User['role']): boolean {
  return role === 'admin';
}

export function canCreateContent(role: User['role']): boolean {
  return ['admin', 'member'].includes(role);
}

export function canEditContent(role: User['role'], isOwner: boolean): boolean {
  return role === 'admin' || (role === 'member' && isOwner);
}

export function canDeleteContent(role: User['role'], isOwner: boolean): boolean {
  return role === 'admin' || (role === 'member' && isOwner);
}

/**
 * Plan-based feature checks
 */
export function getMaxUsers(plan: Company['plan']): number {
  const limits = { free: 5, pro: 25, enterprise: 100 };
  return limits[plan];
}

export function getMaxStorage(plan: Company['plan']): number {
  const limits = { free: 1000, pro: 10000, enterprise: 50000 }; // MB
  return limits[plan];
}

export function hasFeature(plan: Company['plan'], feature: string): boolean {
  const features = {
    free: ['basic_todos', 'basic_lists'],
    pro: ['basic_todos', 'basic_lists', 'tags', 'subtasks', 'due_dates', 'bulk_operations'],
    enterprise: ['basic_todos', 'basic_lists', 'tags', 'subtasks', 'due_dates', 'bulk_operations', 'advanced_permissions', 'audit_logs', 'api_access'],
  };
  
  return features[plan]?.includes(feature) || false;
}

/**
 * Developer hints and logging
 */
export function logAuthDebug(message: string, data?: any) {
  console.log(`🔐 [Auth Debug] ${message}`, data || '');
}

export function logTenantDebug(message: string, data?: any) {
  console.log(`🏢 [Tenant Debug] ${message}`, data || '');
}