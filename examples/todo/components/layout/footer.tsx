"use client";

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Code, Database, Zap } from 'lucide-react';
import { useTenant, useUser } from '@/lib/auth-context';

export function Footer() {
  const tenant = useTenant();
  const user = useUser();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Flow Todo Demo
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Production-ready multi-tenant todo application showcasing the power of next-prisma-flow generator.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Type-safe
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Multi-tenant
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Code className="h-3 w-3 mr-1" />
                Auto-generated
              </Badge>
            </div>
          </div>

          {/* Current Context */}
          {tenant && user && (
            <div>
              <h3 className="font-semibold mb-3">Current Context</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <Badge variant="outline">{tenant.company.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <Badge variant="outline" className="capitalize">{tenant.plan}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tenant ID:</span>
                  <code className="text-xs bg-muted px-1 rounded">
                    {tenant.tenantId.slice(0, 8)}...
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Links and Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto" asChild>
                <Link 
                  href="https://github.com/your-repo/next-prisma-flow" 
                  className="flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View Source Code
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto" asChild>
                <Link 
                  href="https://prisma.io" 
                  className="flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Database className="h-4 w-4" />
                  Prisma Documentation
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto" asChild>
                <Link 
                  href="https://nextjs.org" 
                  className="flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code className="h-4 w-4" />
                  Next.js Documentation
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Built with ❤️ using next-prisma-flow generator
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              💡 Check browser console for Flow debug logs
            </span>
            {process.env.NODE_ENV === 'development' && (
              <Badge variant="outline" className="text-xs">
                Development Mode
              </Badge>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Compact footer for mobile/minimal layouts
 */
export function CompactFooter() {
  return (
    <footer className="border-t bg-muted/30 py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Built with <strong>next-prisma-flow</strong> • 
          <Link 
            href="https://github.com/your-repo" 
            className="hover:underline ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </Link>
        </p>
      </div>
    </footer>
  );
}