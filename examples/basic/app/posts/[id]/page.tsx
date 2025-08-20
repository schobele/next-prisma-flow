import { PostView } from "@/components/blog/post-view";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  return <PostView postId={params.id} />;
}