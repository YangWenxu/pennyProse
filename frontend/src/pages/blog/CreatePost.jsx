import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Eye, ArrowLeft, Edit3, Upload, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { api } from '../../api/client'
import SingleMarkdownImporter from '../../components/SingleMarkdownImporter'

const CreatePost = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [],
    status: 'draft'
  })
  const [categories, setCategories] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useMarkdownImport, setUseMarkdownImport] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.data.success) {
        setCategories(response.data.categories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await api.getTags()
      if (response.data.success) {
        setAvailableTags(response.data.tags)
      }
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTagSelect = (tag) => {
    if (!formData.tags.includes(tag.name)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.name]
      }))
    }
  }

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.createPost(formData)
      if (response.data.success) {
        navigate('/admin')
      } else {
        setError(response.data.message || 'Failed to create post')
      }
    } catch (err) {
      console.error('Error creating post:', err)
      setError('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkdownImport = (importedData) => {
    setFormData(prev => ({
      ...prev,
      title: importedData.title || prev.title,
      content: importedData.content || prev.content,
      excerpt: importedData.excerpt || prev.excerpt
    }))
    setUseMarkdownImport(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Admin</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isPreview 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              type="submit"
              form="create-post-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Import Toggle */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Content Input Method</h3>
            <p className="text-sm text-gray-600 mt-1">Choose between manual input or markdown file import</p>
          </div>
          <button
            onClick={() => setUseMarkdownImport(!useMarkdownImport)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 font-medium"
          >
            {useMarkdownImport ? (
              <ToggleRight className="w-5 h-5 text-blue-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
            <span>{useMarkdownImport ? 'File Import Mode' : 'Manual Input Mode'}</span>
          </button>
        </div>
      </div>

      {/* Markdown Import */}
      {useMarkdownImport && (
        <div className="mb-8">
          <SingleMarkdownImporter onImport={handleMarkdownImport} />
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form id="create-post-form" onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-800">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="Enter an engaging post title..."
              required
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-800">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
              placeholder="Write a brief, compelling description of your post..."
            />
            <p className="text-xs text-gray-500">This will be shown in post previews and search results</p>
          </div>

          {/* Category and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-800">
                Category
              </label>
              <div className="relative">
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-800">
                Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white appearance-none cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-800">
              Tags
            </label>
            <div className="space-y-4">
              {/* Available Tags */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium">Select existing tags:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagSelect(tag)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        formData.tags.includes(tag.name)
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm cursor-not-allowed'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                      disabled={formData.tags.includes(tag.name)}
                    >
                      {tag.name}
                      {formData.tags.includes(tag.name) && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Tag */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium">Or create a new tag:</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter new tag name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    disabled={!newTag.trim()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-semibold text-gray-800">
              Content <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(Markdown supported)</span>
            </label>
            {isPreview ? (
              <div className="min-h-96 p-6 border border-gray-300 rounded-lg bg-gray-50">
                <div className="prose prose-lg max-w-none">
                  {formData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
                  ) : (
                    <p className="text-gray-500 italic">No content to preview</p>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 font-mono text-sm resize-none"
                placeholder="Write your post content here using Markdown syntax..."
                required
              />
            )}
            <p className="text-xs text-gray-500">
              Use Markdown syntax for formatting. {!isPreview && 'Click Preview to see how it will look.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
