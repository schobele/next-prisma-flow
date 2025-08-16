"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, CheckCircle, Database } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoadingHeader } from '@/components/layout/header';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading, login, availableUsers, availableCompanies } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingHeader />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-14 flex items-center">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <h1 className="text-xl font-bold">Flow Todo - Multi-Tenant Demo</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Multi-Tenant Todo App
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Built with Next.js, Prisma, and <strong>next-prisma-flow</strong> generator
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Type-safe database operations
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automatic tenant isolation
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  React Query integration
                </div>
              </div>
            </div>

            {/* Demo Login Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Company Overview */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Demo Companies
                  </CardTitle>
                  <CardDescription>
                    Each company has isolated data and different plans with varying features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {availableCompanies.map((company) => (
                      <div key={company.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{company.logo}</span>
                          <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">
                              {company.plan}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {company.maxUsers} users • {(company.maxStorage / 1000).toFixed(0)}GB storage
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Cards */}
              {availableUsers.map((user) => {
                const company = availableCompanies.find(c => c.id === user.companyId);
                return (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="text-base">{user.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              @ {company?.name}
                            </span>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {user.email}
                      </p>
                      <Button 
                        onClick={() => login(user.email, 'demo-password')}
                        className="w-full"
                        size="sm"
                      >
                        Login as {user.name.split(' ')[0]}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features Section */}
            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">What you'll see:</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Isolation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Each company's data is completely isolated. Switch between users/companies to see different todos, lists, and tags.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Role-based Permissions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Different user roles (admin, member, viewer) have different capabilities for creating, editing, and managing content.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Flow Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Experience automatic tenant filtering, type-safe operations, React Query integration, and optimistic updates.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Developer Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Check the browser console for detailed logging showing how Flow handles multi-tenancy and data operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show the app
  return <>{children}</>;
}