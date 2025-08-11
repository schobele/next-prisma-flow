import EditPostPage from "../../../components/EditPostPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  return <EditPostPage postId={postId} />;
}


