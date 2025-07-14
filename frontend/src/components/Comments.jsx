import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Reply, User, Clock, Loader2 } from 'lucide-react'
import { api } from '../api/client'
import CommentInput from './CommentInput'

const Comments = ({ postSlug }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!postSlug) return

    try {
      setLoading(true)
      const response = await api.getComments(postSlug)
      setComments(response.data.comments)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }, [postSlug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async (content, parentId = null) => {
    try {
      setSubmitting(true)
      await api.createComment(postSlug, {
        content: content,
        authorName: 'Anonymous', // 默认匿名用户
        parentId
      })

      // Close reply form
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
          <div key={`reply-form-${comment.id}`} className="mt-4 pt-4 border-t border-gray-100">
            <CommentInput
              onSubmit={(content) => handleSubmitComment(content, comment.id)}
              placeholder="Write your reply..."
              rows={3}
              className="text-sm"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="btn-secondary text-sm mt-2"
            >
              Cancel
            </button>
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
        <CommentInput
          onSubmit={(content) => handleSubmitComment(content)}
          placeholder="Share your thoughts..."
          rows={4}
          disabled={submitting}
        />
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
