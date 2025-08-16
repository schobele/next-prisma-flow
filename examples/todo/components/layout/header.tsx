"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSwitcher, AuthDebugInfo } from '@/components/auth/user-switcher';
import { useAuth, useTenant, useUser } from '@/lib/auth-context';
import { Building2, Database, Settings, BarChart3 } from 'lucide-react';

export function Header() {
  const { session } = useAuth();
  const tenant = useTenant();
  const user = useUser();

  if (!session || !tenant || !user) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Multi-Tenant Todo App</h1>
          </div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <h1 className="text-xl font-bold">Flow Todo</h1>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/lists">Lists</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/todos">Todos</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tags">Tags</Link>
              </Button>
              {user.canManageCompany && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          {/* Center - Tenant Info */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{tenant.company.name}</span>
            <Badge variant="outline" className="text-xs">
              {tenant.plan}
            </Badge>
            {tenant.plan === 'free' && (
              <Badge variant="secondary" className="text-xs">
                {tenant.maxUsers} users max
              </Badge>
            )}
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link href="/analytics">
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Link>
            </Button>
            <UserSwitcher />
          </div>
        </div>
      </header>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && <AuthDebugInfo />}
    </>
  );
}

/**
 * Breadcrumb component that shows current tenant context
 */
export function TenantBreadcrumb() {
  const tenant = useTenant();
  const user = useUser();

  if (!tenant || !user) return null;

  return (
    <div className="border-b bg-muted/30 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{tenant.company.name}</span>
          <span>•</span>
          <span className="capitalize">{user.role}</span>
          <span>•</span>
          <Badge variant="outline" className="text-xs capitalize">
            {tenant.plan} Plan
          </Badge>
          {tenant.plan !== 'enterprise' && (
            <>
              <span>•</span>
              <span className="text-xs">
                Storage: {(tenant.maxStorage / 1000).toFixed(0)}GB
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple loading header for when auth is loading
 */
export function LoadingHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <h1 className="text-xl font-bold">Flow Todo</h1>
        </div>
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>
    </header>
  );
}