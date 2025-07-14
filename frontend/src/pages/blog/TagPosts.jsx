import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Tag, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../../api/client'

const TagPosts = () => {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTagPosts = async () => {
      try {
        setLoading(true)
        const response = await api.getTagPosts(slug)
        setData(response.data)
      } catch (err) {
        console.error('Error fetching tag posts:', err)
        setError('Failed to load tag posts')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchTagPosts()
    }
  }, [slug])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading tag posts...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Tag not found'}</p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const { tag, posts } = data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>
      </div>

      {/* Tag Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: tag.color }}
          >
            #{tag.name}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Posts tagged with "{tag.name}"</h1>
        {tag.description && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tag.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} with this tag
        </p>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No posts found with this tag</p>
          <Link to="/blog" className="btn-primary">
            Browse All Posts
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="space-y-4">
                {/* Post Title */}
                <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  <Link to={`/post/${post.slug}`} className="block">
                    {post.title}
                  </Link>
                </h2>

                {/* Post Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span>Posted by <span className="text-primary-600 font-medium">{post.author?.name || post.author?.username}</span></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                  {post.category && (
                    <Link
                      to={`/categories/${post.category.slug}`}
                      className="px-2 py-1 rounded-full text-xs text-white hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: post.category.color }}
                    >
                      {post.category.name}
                    </Link>
                  )}
                  {post.readTime && (
                    <span className="text-xs text-gray-400">
                      {post.readTime} min read
                    </span>
                  )}
                </div>

                {/* Post Excerpt */}
                <p className="text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Tags and Read More */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-2">
                      {post.tags?.map((postTag) => (
                        <Link
                          key={postTag.id}
                          to={`/tags/${postTag.slug}`}
                          className={`text-xs px-2 py-1 rounded transition-opacity ${
                            postTag.slug === slug 
                              ? 'text-white font-medium' 
                              : 'text-white hover:opacity-80'
                          }`}
                          style={{ backgroundColor: postTag.color }}
                        >
                          {postTag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/post/${post.slug}`}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Read More <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Related Tags */}
      {data.relatedTags && data.relatedTags.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Tags</h3>
          <div className="flex flex-wrap gap-2">
            {data.relatedTags.map((relatedTag) => (
              <Link
                key={relatedTag.id}
                to={`/tags/${relatedTag.slug}`}
                className="text-xs text-white px-2 py-1 rounded hover:opacity-80 transition-opacity"
                style={{ backgroundColor: relatedTag.color }}
                title={`${relatedTag.postCount} posts`}
              >
                {relatedTag.name} ({relatedTag.postCount})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TagPosts
