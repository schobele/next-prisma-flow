import './globals.css'
import { FlowProvider } from '../generated/flow/core'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next Prisma Flow Example',
  description: 'Example blog app using next-prisma-flow-state-engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mock context - in real app, would come from auth
  const ctx = {
    user: {
      id: 'user-1',
      roles: ['admin'],
      orgId: null
    },
    tenantId: null
  }

  return (
    <html lang="en">
      <body>
        <FlowProvider ctx={ctx}>
          <div className="min-h-screen">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Flow Blog
                  </h1>
                  <nav className="flex gap-4">
                    <a href="/" className="text-gray-700 hover:text-gray-900">
                      Home
                    </a>
                  </nav>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </FlowProvider>
      </body>
    </html>
  )
}