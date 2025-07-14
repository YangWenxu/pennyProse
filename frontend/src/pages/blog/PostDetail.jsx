import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Calendar, Tag, User, ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import Comments from '../../components/Comments'

const PostDetail = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await api.getPost(slug)
        setPost(response.data.post)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading post...</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        {/* Post Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {post.author?.name || post.author?.username}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          {post.readTime && (
            <span>{post.readTime} min read</span>
          )}
        </div>

        {/* Category and Tags */}
        <div className="flex flex-wrap items-center gap-4">
          {post.category && (
            <Link
              to={`/categories/${post.category.slug}`}
              className="px-3 py-1 rounded-full text-sm text-white hover:opacity-80 transition-opacity"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.name}
            </Link>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tags/${tag.slug}`}
                    className="text-xs text-white px-2 py-1 rounded hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Post Content */}
      <article className="prose prose-lg max-w-none mb-12">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      {/* Post Footer */}
      <footer className="border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center">
          <Link 
            to="/blog" 
            className="btn-secondary"
          >
            ← Back to Blog
          </Link>
          
          {post.category && (
            <Link
              to={`/categories/${post.category.slug}`}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              More in {post.category.name} →
            </Link>
          )}
        </div>
      </footer>

      {/* Comments Section */}
      <div className="mt-12">
        <Comments postId={post.id} />
      </div>
    </div>
  )
}

export default PostDetail
