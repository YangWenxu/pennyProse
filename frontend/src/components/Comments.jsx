import { useState, useEffect } from 'react'
import { MessageCircle, Reply, Send, User, Clock, Loader2 } from 'lucide-react'
import { api } from '../api/client'

const Comments = ({ postSlug }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [newComment, setNewComment] = useState({
    content: '',
    authorName: '',
    authorEmail: ''
  })

  useEffect(() => {
    if (postSlug) {
      fetchComments()
    }
  }, [postSlug])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await api.getComments(postSlug)
      setComments(response.data.comments)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e, parentId = null) => {
    e.preventDefault()
    
    if (!newComment.content.trim() || !newComment.authorName.trim()) {
      alert('Please fill in your name and comment')
      return
    }

    try {
      setSubmitting(true)
      await api.createComment(postSlug, {
        content: newComment.content,
        authorName: newComment.authorName,
        authorEmail: newComment.authorEmail,
        parentId
      })
      
      // Reset form
      setNewComment({
        content: '',
        authorName: '',
        authorEmail: ''
      })
      setReplyingTo(null)
      
      // Refresh comments
      fetchComments()
    } catch (err) {
      console.error('Error creating comment:', err)
      alert('Failed to post comment: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {comment.author?.name || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="text-gray-700 mb-3 whitespace-pre-wrap">
          {comment.content}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-sm">
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
          )}
          {comment._count?.replies > 0 && (
            <span className="text-gray-500">
              {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <form onSubmit={(e) => handleSubmitComment(e, comment.id)}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your name *"
                    value={newComment.authorName}
                    onChange={(e) => setNewComment(prev => ({ ...prev, authorName: e.target.value }))}
                    className="input-field text-sm"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={newComment.authorEmail}
                    onChange={(e) => setNewComment(prev => ({ ...prev, authorEmail: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>
                <textarea
                  placeholder="Write your reply..."
                  value={newComment.content}
                  onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="input-field text-sm"
                  required
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Post Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Leave a Comment</h4>
        <form onSubmit={(e) => handleSubmitComment(e)}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={newComment.authorName}
                  onChange={(e) => setNewComment(prev => ({ ...prev, authorName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={newComment.authorEmail}
                  onChange={(e) => setNewComment(prev => ({ ...prev, authorEmail: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment *
              </label>
              <textarea
                placeholder="Share your thoughts..."
                value={newComment.content}
                onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments
