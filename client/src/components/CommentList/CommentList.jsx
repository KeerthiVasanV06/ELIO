import { useState } from "react";
import { useAuth } from "../../context/AuthContext/useAuth";
import { deleteComment } from "../../services/commentService";
import "./CommentList.css";

const CommentList = ({ comments = [], blogId, onCommentDeleted }) => {
  const { user, isAuthenticated } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setDeletingId(commentId);
      setError("");
      console.log("Deleting comment:", commentId);
      
      await deleteComment(commentId);
      console.log("Comment deleted successfully");
      
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete comment";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  // Separate top-level and nested comments
  const topLevelComments = comments.filter((c) => !c.parentComment);
  const nestedComments = (parentId) =>
    comments.filter((c) => c.parentComment === parentId);

  const renderComment = (comment, isNested = false) => {
    // Handle both object and string author IDs
    const authorId = typeof comment.author === "object" 
      ? comment.author._id 
      : comment.author;
    const userId = user?._id;
    
    // String comparison for ID matching
    const authorIdStr = String(authorId);
    const userIdStr = String(userId);
    const isAuthor = userId && authorIdStr === userIdStr;
    const isAdmin = user?.role === "admin";
    const canDelete = isAuthenticated && (isAuthor || isAdmin);

    // Debug logging
    console.log("Comment Debug:", {
      commentId: comment._id,
      commentAuthor: comment.author.name,
      authorId: authorIdStr,
      userId: userIdStr,
      isAuthor,
      isAdmin,
      canDelete,
      isAuthenticated,
    });

    return (
      <div key={comment._id} className={`comment ${isNested ? "nested" : ""}`}>
        <div className="comment-header">
          <strong className="comment-author">{comment.author.name}</strong>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="comment-content">{comment.content}</p>
        {error && <div className="comment-error">{error}</div>}
        <div className="comment-actions">
          {canDelete && (
            <button
              className="comment-delete"
              onClick={() => handleDelete(comment._id)}
              disabled={deletingId === comment._id}
              title={isAuthor ? "Delete your comment" : "Delete as admin"}
            >
              {deletingId === comment._id ? "Deleting..." : "Delete"}
            </button>
          )}
          {!canDelete && isAuthenticated && (
            <span className="comment-info"></span>
          )}
          {!isAuthenticated && (
            <span className="comment-info">
              <a href="/login" style={{ color: "#667eea", textDecoration: "none" }}>Log in</a> to delete
            </span>
          )}
        </div>

        {/* Nested replies */}
        {nestedComments(comment._id).length > 0 && (
          <div className="comment-replies">
            {nestedComments(comment._id).map((reply) =>
              renderComment(reply, true)
            )}
          </div>
        )}
      </div>
    );
  };

  if (comments.length === 0) {
    return <p className="no-comments">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="comment-list">
      <h3>Comments ({comments.length})</h3>
      {topLevelComments.map((comment) => renderComment(comment))}
    </div>
  );
};

export default CommentList;
