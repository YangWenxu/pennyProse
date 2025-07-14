import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

const CommentInput = ({ onSubmit, placeholder = "Share your thoughts...", rows = 4, className = "", disabled = false }) => {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) {
      alert('Please write a comment')
      return
    }
    onSubmit(content)
    setContent('')
  }

  const handleChange = (e) => {
    setContent(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        <textarea
          placeholder={placeholder}
          value={content}
          onChange={handleChange}
          rows={rows}
          className={`input-field ${className}`}
          required
          disabled={disabled}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={disabled || !content.trim()}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Post Comment
          </button>
        </div>
      </div>
    </form>
  )
}

export default CommentInput
