// Mock authentication context for the blog example
// In a real app, this would integrate with your auth provider

import { FlowCtx } from "./flow/core/ctx";

// Mock current user - in real app, get from session/JWT
export function getCurrentUser() {
  // Simulate being logged in as the first author
  // Change this ID to test different authorization scenarios
  return {
    id: "demo-author-1",
    email: "john@example.com",
    name: "John Doe",
    role: "author",
  };
}

// Get the Flow context for server operations
export function getFlowContext(): FlowCtx {
  const user = getCurrentUser();
  
  return {
    userId: user?.id || null,
    role: user?.role || null,
    // No tenant/company in this simple blog example
    tenantId: null,
  };
}

// Check if current user is the author of a post
export function isPostAuthor(authorId: string): boolean {
  const user = getCurrentUser();
  return user?.id === authorId;
}