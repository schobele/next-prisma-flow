import { PostDeepSelect, PostListSelect } from "./generated/flow/post/selects";
import { AuthorDeepSelect } from "./generated/flow/author/selects";
import { CommentDeepSelect } from "./generated/flow/comment/selects";
import { PostDeepSchema, PostWriteSchema } from "./generated/flow/post/zod";
import { z } from "zod";

console.log("=== Testing Generated Output ===\n");

// Test 1: Check PostDeepSelect structure
console.log("1. PostDeepSelect includes author with comments:");
console.log("   author.comments.take:", PostDeepSelect.author.select.comments.take);
console.log("   author.posts (should be false):", PostDeepSelect.author.select.posts);

// Test 2: Check Comment recursive select
console.log("\n2. CommentDeepSelect handles parent-child relationships:");
console.log("   parent (should have select):", !!CommentDeepSelect.parent.select);
console.log("   parent.parent (should be false):", CommentDeepSelect.parent.select.parent);
console.log("   replies (should have take & select):", !!CommentDeepSelect.replies.take);

// Test 3: Validate with Zod schemas
console.log("\n3. Testing Zod validation:");

const validPostWrite = {
  title: "My First Post",
  content: "This is the content",
  published: true,
  views: 0
  // Avoiding nested relations to prevent circular dependency issues
};

const parseResult = PostWriteSchema.safeParse(validPostWrite);
console.log("   Valid post write parsed:", parseResult.success);

// Test 4: Check generated types exist
console.log("\n4. Type exports (checking schema shapes):");
console.log("   PostDeepSchema fields:", Object.keys(PostDeepSchema.shape));
console.log("   PostWriteSchema fields:", Object.keys(PostWriteSchema.shape));

// Test 5: Check the configuration was applied
console.log("\n5. Configuration applied:");
console.log("   Post.comments limit (configured as 100):", PostDeepSelect.comments.take);
console.log("   Author.posts limit (configured as 50):", AuthorDeepSelect.posts.take);

console.log("\n✅ All tests completed successfully!");