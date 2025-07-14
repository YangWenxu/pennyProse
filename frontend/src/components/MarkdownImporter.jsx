import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../api/client'

const MarkdownImporter = ({ onImportComplete }) => {
  const [files, setFiles] = useState([])
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFiles) => {
    const markdownFiles = Array.from(selectedFiles).filter(file => 
      file.name.endsWith('.md') || file.type === 'text/markdown'
    )
    setFiles(markdownFiles)
    setResults(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
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
    handleFileSelect(e.target.files)
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleImport = async () => {
    if (files.length === 0) return

    try {
      setImporting(true)
      const response = await api.importMarkdownFiles(files)
      setResults(response.data)
      setFiles([])
      
      if (onImportComplete) {
        onImportComplete(response.data)
      }
    } catch (err) {
      console.error('Error importing files:', err)
      setResults({
        message: 'Import failed',
        errors: [{ file: 'General', error: err.response?.data?.error || err.message }],
        results: [],
        summary: { total: files.length, successful: 0, failed: files.length }
      })
    } finally {
      setImporting(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Import Markdown Files
        </h3>
        <p className="text-gray-500 mb-4">
          Drag and drop your .md files here, or click to select files
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary"
          disabled={importing}
        >
          Select Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,text/markdown"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">
          Supports frontmatter with title, category, tags, published status, etc.
        </p>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={importing}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleImport}
            disabled={importing || files.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Import Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {results.summary.failed === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <h4 className="text-lg font-medium text-gray-900">Import Results</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{results.summary.total}</p>
              <p className="text-sm text-blue-600">Total Files</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{results.summary.successful}</p>
              <p className="text-sm text-green-600">Successful</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{results.summary.failed}</p>
              <p className="text-sm text-red-600">Failed</p>
            </div>
          </div>

          {/* Successful Imports */}
          {results.results.length > 0 && (
            <div>
              <h5 className="font-medium text-green-700 mb-2">Successfully Imported:</h5>
              <div className="space-y-2">
                {results.results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      <strong>{result.file}</strong> → "{result.title}" ({result.status})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {results.errors.length > 0 && (
            <div>
              <h5 className="font-medium text-red-700 mb-2">Errors:</h5>
              <div className="space-y-2">
                {results.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <strong>{error.file}:</strong> {error.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Frontmatter Support</h5>
        <p className="text-sm text-blue-700 mb-2">
          Your Markdown files can include frontmatter with the following fields:
        </p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li><code>title</code> - Post title (defaults to filename)</li>
          <li><code>excerpt</code> or <code>description</code> - Post excerpt</li>
          <li><code>category</code> - Category name or slug</li>
          <li><code>tags</code> - Array of tag names</li>
          <li><code>published</code> - true/false (defaults to true)</li>
          <li><code>featured</code> - true/false (defaults to false)</li>
          <li><code>date</code> - Publication date</li>
        </ul>
      </div>
    </div>
  )
}

export default MarkdownImporter
