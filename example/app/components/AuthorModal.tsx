'use client'

import { useAuthor } from '../../generated/flow/author/client/hooks'

export default function AuthorModal({ 
  authorId, 
  onClose 
}: { 
  authorId: string
  onClose: () => void 
}) {
  const { data: author, isLoading } = useAuthor(authorId)

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Author Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : author ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {author.name || 'Unnamed Author'}
              </h3>
              <p className="text-gray-600">{author.email}</p>
              {author.bio && (
                <p className="mt-2 text-gray-700">{author.bio}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(author.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Posts by this author</h4>
              <div className="space-y-3">
                {author.posts && author.posts.length > 0 ? (
                  author.posts.map((post) => (
                    <div key={post.id} className="border-l-2 border-gray-200 pl-4">
                      <h5 className="font-medium">{post.title}</h5>
                      {post.content && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {post.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No posts yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recent Comments</h4>
              <div className="space-y-2">
                {author.comments && author.comments.length > 0 ? (
                  author.comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Author not found</p>
        )}
      </div>
    </div>
  )
}