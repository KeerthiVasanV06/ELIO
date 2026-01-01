import { useState } from "react";
import { useAuth } from "../../context/AuthContext/useAuth";
import { addComment } from "../../services/commentService";
import "./CommentForm.css";

const CommentForm = ({ blogId, onCommentAdded, parentCommentId = null }) => {
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        content: content.trim(),
        parentComment: parentCommentId || undefined,
      };
      const res = await addComment(blogId, payload);
      setContent("");
      if (onCommentAdded) {
        onCommentAdded(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="comment-form-guest">
        <p>Please <a href="/login">log in</a> to comment.</p>
      </div>
    );
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {error && <p className="comment-error">{error}</p>}
      <div className="comment-meta">
        <span className="comment-user">Commenting as <strong>{user?.name}</strong></span>
      </div>
      <textarea
        className="comment-input"
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={loading}
      />
      <button type="submit" disabled={loading} className="comment-submit">
        {loading ? "Posting..." : parentCommentId ? "Reply" : "Post Comment"}
      </button>
    </form>
  );
};

export default CommentForm;
