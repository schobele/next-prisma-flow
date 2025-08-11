import { listPosts } from '../generated/flow/post/queries.server'
import PostList from './components/PostList'
import PostForm from './components/PostForm'

export default async function HomePage() {
  const ctx = {
    user: {
      id: 'user-1', 
      roles: ['admin'],
      orgId: null
    },
    tenantId: null
  }

  const { items: posts } = await listPosts({ 
    orderBy: { createdAt: 'desc' },
    take: 10 
  }, ctx)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Recent Posts</h2>
        <PostForm />
      </div>
      
      <PostList initialPosts={posts} />
    </div>
  )
}