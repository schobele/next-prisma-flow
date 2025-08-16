"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FlowProvider } from './flow/core/provider';
import type { FlowCtx } from './flow/core/ctx';
import {
  type AuthSession,
  type User,
  type Company,
  getCurrentSession,
  signIn,
  signOut,
  switchCompany,
  getAvailableUsers,
  getAvailableCompanies,
  logAuthDebug,
  logTenantDebug,
} from './auth';

interface AuthContextType {
  // Session state
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchToCompany: (companyId: string) => Promise<boolean>;
  switchToUser: (userId: string) => Promise<boolean>;
  
  // Demo helpers
  availableUsers: User[];
  availableCompanies: Company[];
  
  // Flow context (derived from session)
  flowCtx: FlowCtx | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers] = useState<User[]>(getAvailableUsers());
  const [availableCompanies] = useState<Company[]>(getAvailableCompanies());

  // Initialize session on mount
  useEffect(() => {
    async function initializeAuth() {
      try {
        logAuthDebug('Initializing auth session...');
        const currentSession = await getCurrentSession();
        setSession(currentSession);
        
        if (currentSession) {
          logAuthDebug('Session initialized', {
            user: currentSession.user.email,
            company: currentSession.company.name,
            tenantId: currentSession.company.id,
          });
          logTenantDebug('Tenant context established', {
            companyId: currentSession.company.id,
            companyName: currentSession.company.name,
            plan: currentSession.company.plan,
          });
        } else {
          logAuthDebug('No existing session found');
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // Auth actions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      logAuthDebug('Attempting login', { email });
      const newSession = await signIn(email, password);
      
      if (newSession) {
        setSession(newSession);
        logAuthDebug('Login successful', {
          user: newSession.user.email,
          company: newSession.company.name,
        });
        logTenantDebug('New tenant context', {
          companyId: newSession.company.id,
          companyName: newSession.company.name,
        });
        return true;
      } else {
        setError('Invalid credentials');
        logAuthDebug('Login failed - invalid credentials');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      logAuthDebug('Logging out...');
      await signOut();
      setSession(null);
      setError(null);
      
      logAuthDebug('Logout successful');
      logTenantDebug('Tenant context cleared');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchToCompany = async (companyId: string): Promise<boolean> => {
    try {
      if (!session) return false;
      
      setLoading(true);
      setError(null);
      
      logTenantDebug('Switching company', { 
        from: session.company.name, 
        to: companyId 
      });
      
      const newSession = await switchCompany(companyId, session.user.id);
      
      if (newSession) {
        setSession(newSession);
        logTenantDebug('Company switch successful', {
          companyId: newSession.company.id,
          companyName: newSession.company.name,
          user: newSession.user.email,
        });
        return true;
      } else {
        setError('Failed to switch company');
        logTenantDebug('Company switch failed', { companyId });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch company';
      setError(errorMessage);
      console.error('Company switch error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchToUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const targetUser = availableUsers.find(u => u.id === userId);
      if (!targetUser) {
        setError('User not found');
        return false;
      }
      
      logAuthDebug('Switching user', { 
        from: session?.user.email, 
        to: targetUser.email 
      });
      
      // For demo purposes, we'll sign in as the target user
      const newSession = await signIn(targetUser.email, 'demo-password');
      
      if (newSession) {
        setSession(newSession);
        logAuthDebug('User switch successful', {
          user: newSession.user.email,
          company: newSession.company.name,
        });
        logTenantDebug('New tenant context after user switch', {
          companyId: newSession.company.id,
          companyName: newSession.company.name,
        });
        return true;
      } else {
        setError('Failed to switch user');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch user';
      setError(errorMessage);
      console.error('User switch error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create Flow context from auth session
  // Flow context follows the generated type structure
  const flowCtx: FlowCtx | null = session ? {
    user: {
      id: session.user.id,
      roles: [session.user.role], // Map role to roles array as expected by Flow
    },
    // This is the key field that enables tenant filtering in Flow
    tenantId: session.company.id,
  } : null;

  const authContextValue: AuthContextType = {
    session,
    loading,
    error,
    login,
    logout,
    switchToCompany,
    switchToUser,
    availableUsers,
    availableCompanies,
    flowCtx,
  };

  // Always provide auth context, conditionally wrap with FlowProvider
  if (!flowCtx) {
    return (
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Wrap with both Auth and Flow providers
  // FlowProvider creates its own QueryClient as designed
  return (
    <AuthContext.Provider value={authContextValue}>
      <FlowProvider ctx={flowCtx}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </FlowProvider>
    </AuthContext.Provider>
  );
}

/**
 * Hook to get current tenant information with type safety
 */
export function useTenant() {
  const { session } = useAuth();
  
  if (!session) {
    return null;
  }
  
  return {
    company: session.company,
    tenantId: session.company.id,
    plan: session.company.plan,
    maxUsers: session.company.maxUsers,
    maxStorage: session.company.maxStorage,
  };
}

/**
 * Hook to get current user with role-based utilities
 */
export function useUser() {
  const { session } = useAuth();
  
  if (!session) {
    return null;
  }
  
  return {
    user: session.user,
    role: session.user.role,
    canManageCompany: session.user.role === 'admin',
    canManageUsers: session.user.role === 'admin',
    canCreateContent: ['admin', 'member'].includes(session.user.role),
    canEditContent: (isOwner: boolean) => 
      session.user.role === 'admin' || (session.user.role === 'member' && isOwner),
    canDeleteContent: (isOwner: boolean) => 
      session.user.role === 'admin' || (session.user.role === 'member' && isOwner),
  };
}

/**
 * Development utilities for testing multi-tenancy
 */
export function useAuthDebug() {
  const { session, flowCtx } = useAuth();
  
  return {
    session,
    flowCtx,
    logCurrentContext: () => {
      console.group('🔍 Auth Debug - Current Context');
      console.log('Session:', session);
      console.log('Flow Context:', flowCtx);
      console.log('Tenant ID:', flowCtx?.tenantId);
      console.log('User Role:', session?.user.role);
      console.log('Company Plan:', session?.company.plan);
      console.groupEnd();
    },
    logTenantIsolation: () => {
      console.group('🏢 Tenant Isolation Debug');
      console.log('All data queries will be filtered by companyId:', flowCtx?.tenantId);
      console.log('Flow policies will enforce tenant boundaries automatically');
      console.log('Company:', session?.company.name);
      console.log('Plan limits:', {
        maxUsers: session?.company.maxUsers,
        maxStorage: session?.company.maxStorage,
      });
      console.groupEnd();
    },
  };
}