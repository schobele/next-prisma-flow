import { PostForm } from "@/components/blog/post-form";
import { getCurrentUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function NewPostPage() {
  const user = getCurrentUser();
  
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to create posts.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <PostForm authorId={user.id} />
    </div>
  );
}