import axios from 'axios'

// 根据环境配置API基础URL
const API_BASE_URL = import.meta.env.PROD
  ? 'https://api.yangwenxu.github.io'  // 生产环境API地址
  : 'http://localhost:3001'            // 开发环境API地址

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url)
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data || error.message)
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const api = {
  // Posts
  getPosts: (params = {}) => {
    return apiClient.get('/api/posts', { params })
  },
  
  getPost: (slug) => {
    return apiClient.get(`/api/posts/${slug}`)
  },

  getPostById: (id) => {
    return apiClient.get(`/api/posts/id/${id}`)
  },
  
  createPost: (data) => {
    return apiClient.post('/api/posts', data)
  },
  
  updatePost: (id, data) => {
    return apiClient.put(`/api/posts/${id}`, data)
  },
  
  deletePost: (id) => {
    return apiClient.delete(`/api/posts/${id}`)
  },
  
  // Categories
  getCategories: () => {
    return apiClient.get('/api/categories')
  },

  createCategory: (data) => {
    return apiClient.post('/api/categories', data)
  },

  updateCategory: (id, data) => {
    return apiClient.put(`/api/categories/${id}`, data)
  },

  deleteCategory: (id) => {
    return apiClient.delete(`/api/categories/${id}`)
  },

  getCategoryPosts: (slug, params = {}) => {
    return apiClient.get(`/api/categories/${slug}/posts`, { params })
  },

  // Tags
  getTags: () => {
    return apiClient.get('/api/tags')
  },

  createTag: (data) => {
    return apiClient.post('/api/tags', data)
  },

  updateTag: (id, data) => {
    return apiClient.put(`/api/tags/${id}`, data)
  },

  deleteTag: (id) => {
    return apiClient.delete(`/api/tags/${id}`)
  },

  getTagPosts: (slug, params = {}) => {
    return apiClient.get(`/api/tags/${slug}/posts`, { params })
  },

  // Archive
  getArchive: () => {
    return apiClient.get('/api/archive')
  },

  getArchivePosts: (year, month, params = {}) => {
    return apiClient.get(`/api/archive/${year}/${month}`, { params })
  },

  // Admin
  getAdminStats: () => {
    return apiClient.get('/api/admin/stats')
  },

  getAdminPosts: (params = {}) => {
    return apiClient.get('/api/admin/posts', { params })
  },

  deletePost: (id) => {
    return apiClient.delete(`/api/posts/${id}`)
  },

  updatePostStatus: (id, status) => {
    return apiClient.patch(`/api/posts/${id}/status`, { status })
  },

  importMarkdownFiles: (files) => {
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('markdownFiles', files[i])
    }
    return apiClient.post('/api/admin/import-markdown', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Comments
  getComments: (slug) => {
    return apiClient.get(`/api/posts/${slug}/comments`)
  },

  createComment: (slug, data) => {
    return apiClient.post(`/api/posts/${slug}/comments`, data)
  },
  
  // Auth
  login: (credentials) => {
    return apiClient.post('/api/auth/login', credentials)
  },
  
  register: (userData) => {
    return apiClient.post('/api/auth/register', userData)
  },
  
  getCurrentUser: () => {
    return apiClient.get('/api/auth/me')
  },
  
  // Health check
  healthCheck: () => {
    return apiClient.get('/health')
  }
}

export default apiClient
