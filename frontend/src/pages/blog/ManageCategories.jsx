import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeft, Loader2, Save } from 'lucide-react'
import { api } from '../../api/client'

const ManageCategories = () => {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })
  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    color: '#10B981'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, tagsRes] = await Promise.all([
        api.getCategories(),
        api.getTags()
      ])
      setCategories(categoriesRes.data.categories)
      setTags(tagsRes.data.tags)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) {
      setError('Category name is required')
      return
    }

    try {
      const response = await api.createCategory(categoryForm)
      if (response.data.success) {
        setSuccess('Category created successfully')
        setCategoryForm({ name: '', description: '', color: '#3B82F6' })
        setShowCategoryForm(false)
        fetchData()
      } else {
        setError(response.data.message || 'Failed to create category')
      }
    } catch (err) {
      console.error('Error creating category:', err)
      setError('Failed to create category')
    }
  }

  const handleTagSubmit = async (e) => {
    e.preventDefault()
    if (!tagForm.name.trim()) {
      setError('Tag name is required')
      return
    }

    try {
      const response = await api.createTag(tagForm)
      if (response.data.success) {
        setSuccess('Tag created successfully')
        setTagForm({ name: '', description: '', color: '#10B981' })
        setShowTagForm(false)
        fetchData()
      } else {
        setError(response.data.message || 'Failed to create tag')
      }
    } catch (err) {
      console.error('Error creating tag:', err)
      setError('Failed to create tag')
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const response = await api.deleteCategory(id)
      if (response.data.success) {
        setSuccess('Category deleted successfully')
        fetchData()
      } else {
        setError(response.data.message || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category')
    }
  }

  const deleteTag = async (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return
    }

    try {
      const response = await api.deleteTag(id)
      if (response.data.success) {
        setSuccess('Tag deleted successfully')
        fetchData()
      } else {
        setError(response.data.message || 'Failed to delete tag')
      }
    } catch (err) {
      console.error('Error deleting tag:', err)
      setError('Failed to delete tag')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Categories & Tags</h1>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Category Form */}
          {showCategoryForm && (
            <form onSubmit={handleCategorySubmit} className="card space-y-4">
              <h3 className="font-medium text-gray-900">New Category</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {category.postCount || 0} posts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
            <button
              onClick={() => setShowTagForm(!showTagForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tag
            </button>
          </div>

          {/* Tag Form */}
          {showTagForm && (
            <form onSubmit={handleTagSubmit} className="card space-y-4">
              <h3 className="font-medium text-gray-900">New Tag</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Tag name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={tagForm.description}
                  onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Tag description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={tagForm.color}
                  onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowTagForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Tags List */}
          <div className="space-y-3">
            {tags.map((tag) => (
              <div key={tag.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <div>
                      {tag.description && (
                        <p className="text-sm text-gray-600">{tag.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {tag.postCount || 0} posts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageCategories
