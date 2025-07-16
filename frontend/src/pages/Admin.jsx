import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Settings, Loader2, Search, Filter, Upload } from 'lucide-react'
import { api } from '../api/client'
import MarkdownImporter from '../components/MarkdownImporter'

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showImporter, setShowImporter] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [filters])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const response = await api.getAdminStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    console.log('Fetching posts with filters:', filters)
    try {
      setPostsLoading(true)
      const response = await api.getAdminPosts({
        status: filters.status,
        search: filters.search,
        page: filters.page,
        limit: 10
      })
      console.log('API Response:', response.data)
      setPosts(response.data.posts)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
    } finally {
      setPostsLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await api.deletePost(postId)
      fetchPosts() // Refresh the list
      fetchAdminData() // Refresh stats
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await api.updatePostStatus(postId, newStatus)
      fetchPosts() // Refresh the list
      fetchAdminData() // Refresh stats
    } catch (err) {
      console.error('Error updating post status:', err)
      alert('Failed to update post status: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleImportComplete = (results) => {
    console.log('Import completed:', results)
    // Refresh data after import
    fetchAdminData()
    fetchPosts()
    // Close importer if all files were successful
    if (results.summary.failed === 0) {
      setShowImporter(false)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading admin data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchAdminData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Blog Administration</h1>
        <div className="flex items-center gap-3">
          <Link to="/manage" className="btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Manage Categories & Tags
          </Link>
          <button
            onClick={() => setShowImporter(!showImporter)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Markdown
          </button>
          <Link to="/create" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-2xl font-bold text-primary-600">{stats?.totalPosts || 0}</div>
          <div className="text-sm text-gray-500">Total Posts</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">{stats?.publishedPosts || 0}</div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-yellow-600">{stats?.draftPosts || 0}</div>
          <div className="text-sm text-gray-500">Drafts</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-blue-600">{stats?.totalCategories || 0}</div>
          <div className="text-sm text-gray-500">Categories</div>
        </div>
      </div>

      {/* Markdown Importer */}
      {showImporter && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Markdown Files</h3>
          <MarkdownImporter onImportComplete={handleImportComplete} />
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 input-field"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="card">
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts found</p>
            <Link to="/create" className="btn-primary">
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        <Link to={`/post/${post.slug}`} className="hover:text-primary-600">
                          {post.title}
                        </Link>
                      </div>
                      {post.category && (
                        <div className="mt-1">
                          <span
                            className="inline-block px-2 py-1 text-xs text-white rounded"
                            style={{ backgroundColor: post.category.color }}
                          >
                            {post.category.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={post.status}
                        onChange={(e) => handleStatusChange(post.id, e.target.value)}
                        className={`text-xs font-semibold rounded px-2 py-1 border-0 ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.author?.name || post.author?.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.viewCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/post/${post.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Post"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/edit/${post.id}`}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Debug info - remove in production */}
            {!postsLoading && (
              <div className="mt-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
                Debug: Page {pagination.page} of {pagination.pages}, Total: {pagination.total}
              </div>
            )}

            {/* Debug info - remove in production */}
            {!postsLoading && (
              <div className="mt-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
                Debug: Page {pagination.page} of {pagination.pages}, Total: {pagination.total}, Posts: {posts.length}
              </div>
            )}

            {/* Pagination Component */}
            {!postsLoading && posts.length > 0 && pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>

                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers - Simple version */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else {
                        // Show pages around current page
                        const start = Math.max(1, pagination.page - 2);
                        const end = Math.min(pagination.pages, start + 4);
                        pageNum = start + i;
                        if (pageNum > end) return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
