import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext/useAuth.js";
import apiClient from "../../services/apiClient.js";
import "./ActionRail.css";

const Toast = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
    </div>
  );
};

const ActionRail = ({ blogId, likes = 0, onLike }) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const { isAuthenticated } = useAuth();

  // Fetch user's likes and bookmarks on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserEngagement();
    }
  }, [blogId, isAuthenticated]);

  const fetchUserEngagement = async () => {
    try {
      const likesRes = await apiClient.get("/blogs/user/likes");
      const bookmarksRes = await apiClient.get("/blogs/user/bookmarks");
      
      setLiked(likesRes.data.likedBlogIds.includes(blogId));
      setBookmarked(bookmarksRes.data.bookmarkedBlogIds.includes(blogId));
    } catch (error) {
      console.error("Failed to fetch engagement:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast("Please log in to like blogs", "error");
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const res = await apiClient.post(`/blogs/${blogId}/unlike`);
        setLiked(false);
        // Use the like count from the API response
        if (res.data.blog && res.data.blog.likes) {
          setLikeCount(res.data.blog.likes.length);
        } else {
          setLikeCount(Math.max(0, likeCount - 1));
        }
      } else {
        // Like
        const res = await apiClient.post(`/blogs/${blogId}/like`);
        setLiked(true);
        // Use the like count from the API response
        if (res.data.blog && res.data.blog.likes) {
          setLikeCount(res.data.blog.likes.length);
        } else {
          setLikeCount(likeCount + 1);
        }
      }

      // Refetch blog data to sync like count with backend
      if (onLike) {
        await onLike();
      }
    } catch (error) {
      console.error("Failed to update like:", error);
      showToast("Failed to update like status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this blog",
          text: "I found an interesting blog post",
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "success");
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast("Please log in to bookmark blogs", "error");
      return;
    }

    setLoading(true);
    try {
      if (bookmarked) {
        // Remove bookmark
        await apiClient.post(`/blogs/${blogId}/unbookmark`);
        setBookmarked(false);
        showToast("Bookmark removed", "info");
      } else {
        // Add bookmark
        await apiClient.post(`/blogs/${blogId}/bookmark`);
        setBookmarked(true);
        showToast("Blog bookmarked!", "success");
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      showToast("Failed to update bookmark", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="action-rail">
        <button 
          className={`action-btn like-btn ${liked ? "liked" : ""}`} 
          onClick={handleLike}
          disabled={loading}
          title={liked ? "Unlike" : "Like"}
        >
          <span className="icon-wrapper">
            <span className="heart-icon">{liked ? "❤️" : "🤍"}</span>
            {liked && <span className="heart-glow"></span>}
          </span>
          <span className="count">{likeCount}</span>
          {liked && <span className="pulse-ring"></span>}
        </button>
        <button 
          className="action-btn share-btn" 
          onClick={handleShare}
          disabled={loading}
          title="Share"
        >
          <span className="icon">📤</span>
        </button>
        <button 
          className={`action-btn bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
          onClick={handleBookmark}
          disabled={loading}
          title="Bookmark"
        >
          <span className="icon">{bookmarked ? "📑" : "🔖"}</span>
        </button>
      </div>
      
      <Toast 
        message={toast.message} 
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  );
};

export default ActionRail;
