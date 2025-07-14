import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Tag, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../../api/client'

const CategoryPosts = () => {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setLoading(true)
        const response = await api.getCategoryPosts(slug)
        setData(response.data)
      } catch (err) {
        console.error('Error fetching category posts:', err)
        setError('Failed to load category posts')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategoryPosts()
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
          <span className="ml-2 text-gray-600">Loading category posts...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Category not found'}</p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const { category, posts } = data

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

      {/* Category Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: category.color }}
          ></div>
          <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this category
        </p>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No posts found in this category</p>
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

      {/* Related Categories */}
      {data.relatedCategories && data.relatedCategories.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Categories</h3>
          <div className="flex flex-wrap gap-3">
            {data.relatedCategories.map((relatedCategory) => (
              <Link
                key={relatedCategory.id}
                to={`/categories/${relatedCategory.slug}`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: relatedCategory.color }}
                ></div>
                <span>{relatedCategory.name}</span>
                <span className="text-gray-500">({relatedCategory.postCount})</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryPosts
