import { PostForm } from "@/components/blog/post-form";
import { getCurrentUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const user = getCurrentUser();
  
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to edit posts.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <PostForm postId={params.id} authorId={user.id} />
    </div>
  );
}