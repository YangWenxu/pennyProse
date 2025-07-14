import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag, ChevronRight, Loader2, ChevronLeft } from 'lucide-react'
import { api } from '../../api/client'

const BlogList = () => {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [archive, setArchive] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [pageLoading, setPageLoading] = useState(false)
  const postsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 首次加载显示主loading，分页切换显示pageLoading
        if (currentPage === 1) {
          setLoading(true)
        } else {
          setPageLoading(true)
        }

        // 临时使用模拟数据来测试分页功能
        const mockPosts = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          title: `测试文章 ${i + 1}`,
          slug: `test-post-${i + 1}`,
          excerpt: `这是第 ${i + 1} 篇测试文章的摘要内容，用于测试分页功能是否正常工作。`,
          content: `# 测试文章 ${i + 1}\n\n这是测试内容...`,
          status: 'PUBLISHED',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          readTime: Math.ceil(Math.random() * 10) + 2,
          author: {
            id: 1,
            name: '测试作者',
            username: 'testuser'
          },
          category: {
            id: 1,
            name: '技术',
            slug: 'tech',
            color: '#3B82F6'
          },
          tags: [
            {
              id: 1,
              name: 'JavaScript',
              slug: 'javascript',
              color: '#F59E0B'
            },
            {
              id: 2,
              name: 'React',
              slug: 'react',
              color: '#10B981'
            }
          ]
        }))

        // 模拟分页
        const startIndex = (currentPage - 1) * postsPerPage
        const endIndex = startIndex + postsPerPage
        const paginatedPosts = mockPosts.slice(startIndex, endIndex)

        setPosts(paginatedPosts)
        setTotalPosts(mockPosts.length)
        setTotalPages(Math.ceil(mockPosts.length / postsPerPage))

        // 模拟其他数据
        setCategories([
          { id: 1, name: '技术', slug: 'tech', color: '#3B82F6', postCount: 15 },
          { id: 2, name: '生活', slug: 'life', color: '#10B981', postCount: 8 },
          { id: 3, name: '思考', slug: 'thoughts', color: '#F59E0B', postCount: 5 }
        ])

        setTags([
          { id: 1, name: 'JavaScript', slug: 'javascript', color: '#F59E0B', postCount: 12 },
          { id: 2, name: 'React', slug: 'react', color: '#10B981', postCount: 8 },
          { id: 3, name: 'Node.js', slug: 'nodejs', color: '#3B82F6', postCount: 6 }
        ])

        setArchive([
          {
            year: 2024,
            months: [
              { month: 12, name: '十二月', count: 5 },
              { month: 11, name: '十一月', count: 8 },
              { month: 10, name: '十月', count: 12 }
            ]
          }
        ])



      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
        setPageLoading(false)
      }
    }

    fetchData()
  }, [currentPage])

  // Format date helper
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
          <span className="ml-2 text-gray-600">Loading posts...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* 分页加载状态 */}
          {pageLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          )}

          <div className={`space-y-8 ${pageLoading ? 'opacity-50' : ''}`}>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">暂无文章</p>
                <Link to="/create" className="btn-primary">
                  创建第一篇文章
                </Link>
              </div>
            ) : (
              posts.map((post) => (
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
                        阅读更多 <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* 分页组件 */}
          {posts.length > 0 && (
            <div className="mt-12">

              {/* 分页控件 */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* 上一页 */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </button>

                {/* 页码 */}
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 显示逻辑：当前页前后各2页
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                {/* 下一页 */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* 移动端简化分页 */}
                <div className="sm:hidden flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Categories */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">分类</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="flex items-center justify-between text-gray-600 hover:text-primary-600 transition-colors text-sm group"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-gray-400 text-xs">({category.postCount || 0})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">热门标签</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tags/${tag.slug}`}
                    className="text-xs text-white px-2 py-1 rounded hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color }}
                    title={`${tag.postCount || 0} posts`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Archive */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">归档</h3>
              <div className="space-y-3">
                {archive.length > 0 ? (
                  archive.map((yearData) => (
                    <div key={yearData.year}>
                      <h4 className="font-medium text-gray-900 mb-2">{yearData.year}</h4>
                      <div className="space-y-1 ml-4">
                        {yearData.months.map((month) => (
                          <div key={month.month} className="flex justify-between items-center text-sm">
                            <Link
                              to={`/archive/${yearData.year}/${month.month}`}
                              className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                              {month.name}
                            </Link>
                            <span className="text-gray-400">({month.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">暂无归档数据</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogList
