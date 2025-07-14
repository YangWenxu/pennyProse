import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Tag, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../../api/client'

const ArchivePosts = () => {
  const { year, month } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArchivePosts = async () => {
      try {
        setLoading(true)
        const response = await api.getArchivePosts(year, month)
        setData(response.data)
      } catch (err) {
        console.error('Error fetching archive posts:', err)
        setError('Failed to load archive posts')
      } finally {
        setLoading(false)
      }
    }

    if (year && month) {
      fetchArchivePosts()
    }
  }, [year, month])

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

  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[parseInt(monthNum) - 1] || monthNum
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading archive posts...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Archive not found'}</p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const { posts } = data

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

      {/* Archive Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            {getMonthName(month)} {year}
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} published in this month
        </p>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No posts found for this period</p>
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
                      {post.tags?.map((tag) => (
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

      {/* Archive Navigation */}
      {data.navigation && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            {data.navigation.prev ? (
              <Link
                to={`/archive/${data.navigation.prev.year}/${data.navigation.prev.month}`}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{getMonthName(data.navigation.prev.month)} {data.navigation.prev.year}</span>
              </Link>
            ) : (
              <div></div>
            )}
            
            {data.navigation.next ? (
              <Link
                to={`/archive/${data.navigation.next.year}/${data.navigation.next.month}`}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <span>{getMonthName(data.navigation.next.month)} {data.navigation.next.year}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchivePosts
