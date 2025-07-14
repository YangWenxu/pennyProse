import { useState, useRef } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

// Simple frontmatter parser
const parseFrontmatter = (content) => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return {
      data: {},
      content: content
    }
  }

  const frontmatterText = match[1]
  const bodyContent = match[2]
  const data = {}

  // Parse YAML-like frontmatter
  const lines = frontmatterText.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.substring(0, colonIndex).trim()
    let value = trimmed.substring(colonIndex + 1).trim()

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1)
      if (arrayContent.trim()) {
        data[key] = arrayContent.split(',').map(item =>
          item.trim().replace(/^["']|["']$/g, '')
        )
      } else {
        data[key] = []
      }
    }
    // Parse booleans
    else if (value === 'true') {
      data[key] = true
    } else if (value === 'false') {
      data[key] = false
    }
    // Parse numbers
    else if (!isNaN(value) && value !== '') {
      data[key] = Number(value)
    }
    // String value
    else {
      data[key] = value
    }
  }

  return {
    data,
    content: bodyContent
  }
}

const SingleMarkdownImporter = ({ onFileImport, onClear }) => {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Check if it's a markdown file
    if (!selectedFile.name.endsWith('.md') && selectedFile.type !== 'text/markdown') {
      setError('Please select a Markdown (.md) file')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Read and parse the file
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        const parsed = parseFrontmatter(content)
        
        const data = {
          title: parsed.data.title || selectedFile.name.replace(/\.md$/, '').replace(/[-_]/g, ' '),
          excerpt: parsed.data.excerpt || parsed.data.description || '',
          content: parsed.content,
          category: parsed.data.category || '',
          tags: parsed.data.tags || [],
          published: parsed.data.published !== false,
          featured: parsed.data.featured || false,
          date: parsed.data.date || new Date().toISOString().split('T')[0]
        }
        
        setParsedData(data)
        onFileImport(data)
      } catch (err) {
        setError('Failed to parse Markdown file: ' + err.message)
        console.error('Error parsing markdown:', err)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0]
    handleFileSelect(selectedFile)
  }

  const handleClear = () => {
    setFile(null)
    setParsedData(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClear()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {!file ? (
        // File Drop Zone
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Import Markdown File
          </h3>
          <p className="text-gray-500 mb-3">
            Drag and drop your .md file here, or click to select
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            Select File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-2">
            Supports frontmatter with title, category, tags, etc.
          </p>
        </div>
      ) : (
        // File Selected
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">{file.name}</p>
                <p className="text-xs text-green-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-green-600 hover:text-green-800"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {parsedData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Parsed Data Preview:</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {parsedData.title}</div>
                {parsedData.excerpt && <div><strong>Excerpt:</strong> {parsedData.excerpt}</div>}
                {parsedData.category && <div><strong>Category:</strong> {parsedData.category}</div>}
                {parsedData.tags.length > 0 && (
                  <div><strong>Tags:</strong> {parsedData.tags.join(', ')}</div>
                )}
                <div><strong>Status:</strong> {parsedData.published ? 'Published' : 'Draft'}</div>
                <div><strong>Content Length:</strong> {parsedData.content.length} characters</div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-1">Frontmatter Support</h5>
        <p className="text-xs text-gray-600 mb-2">
          Your Markdown file can include frontmatter with these fields:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div><code>title</code> - Post title</div>
          <div><code>excerpt</code> - Post excerpt</div>
          <div><code>category</code> - Category name</div>
          <div><code>tags</code> - Array of tags</div>
          <div><code>published</code> - true/false</div>
          <div><code>featured</code> - true/false</div>
        </div>
      </div>
    </div>
  )
}

export default SingleMarkdownImporter
