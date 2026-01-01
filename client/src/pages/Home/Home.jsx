import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBlogs,
  getImageUrl,
  unbookmarkBlog,
} from "../../services/blogService";
import { useAuth } from "../../context/AuthContext/useAuth";
import apiClient from "../../services/apiClient";
import "./Home.css";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [removingBookmarkId, setRemovingBookmarkId] = useState(null);

  // =========================
  // FETCH LATEST BLOGS (24H)
  // =========================
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogs(1, 12);
        const blogsArray = res.data.blogs || [];

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentBlogs = blogsArray.filter(
          (blog) => new Date(blog.createdAt) >= last24h
        );

        setBlogs(recentBlogs);
      } catch (err) {
        console.error(err);
        setError("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // =========================
  // FETCH BOOKMARKS
  // =========================
  const fetchBookmarkedBlogs = async () => {
    if (!isAuthenticated) return;

    setBookmarksLoading(true);
    try {
      const res = await apiClient.get("/blogs/user/bookmarks-details");
      setBookmarkedBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("Bookmark fetch failed", err);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const handleBookmarksToggle = () => {
    if (!showBookmarks && isAuthenticated) {
      fetchBookmarkedBlogs();
    }
    setShowBookmarks((prev) => !prev);
  };

  // =========================
  // REMOVE BOOKMARK
  // =========================
  const handleRemoveBookmark = async (blogId, e) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingBookmarkId(blogId);
    try {
      await unbookmarkBlog(blogId);
      setBookmarkedBlogs((prev) =>
        prev.filter((blog) => blog._id !== blogId)
      );
    } catch (err) {
      console.error("Failed to remove bookmark", err);
      alert("Failed to remove bookmark");
    } finally {
      setRemovingBookmarkId(null);
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return <div className="home-loading">Loading blogs...</div>;
  }

  return (
    <div className="home-container">
      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Share your <span className="highlight">stories</span>. Build your{" "}
            <span className="highlight">audience</span>.
          </h1>
          <p className="hero-subtitle">
            The platform for creators to write, grow, and monetize their ideas.
          </p>

          <div className="hero-cta">
            {isAuthenticated ? (
              <>
                <Link to="/blog" className="btn btn-primary btn-lg">
                  Explore and Write ✍️
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= BLOGS ================= */}
      <section className="blogs-section">
        <div className="blogs-header">
          <div>
            <h2>Latest Articles</h2>
            <p>Fresh ideas from the community</p>
          </div>

          {isAuthenticated && (
            <button
              className={`btn btn-ghost ${showBookmarks ? "active" : ""}`}
              onClick={handleBookmarksToggle}
            >
              {showBookmarks ? "All Blogs" : "📌 Bookmarks"}
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {showBookmarks && bookmarksLoading && (
          <div className="empty-state">
            <p>Loading bookmarks...</p>
          </div>
        )}

        {!showBookmarks && blogs.length === 0 && (
          <div className="empty-state">
            <p>No recent blogs yet.</p>
          </div>
        )}

        {showBookmarks && bookmarkedBlogs.length === 0 && !bookmarksLoading && (
          <div className="empty-state">
            <p>No bookmarked blogs yet.</p>
          </div>
        )}

        <div className="blogs-grid">
          {(showBookmarks ? bookmarkedBlogs : blogs).map((blog) => (
            <Link
              key={blog._id}
              to={`/blogs/${blog.slug}`}
              className="blog-card"
            >
              {blog.coverImage && (
                <div className="blog-image">
                  <img
                    src={getImageUrl(blog.coverImage)}
                    alt={blog.title}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}

              <div className="blog-content">
                <div className="blog-meta">
                  <span className="category">
                    {blog.category || "General"}
                  </span>
                  <span className="read-time">
                    {Math.ceil(blog.content.split(" ").length / 200)} min read
                  </span>
                </div>

                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">
                  {blog.content.substring(0, 120)}...
                </p>

                <div className="blog-footer">
                  <span className="author-name">
                    {blog.author?.fullName || "Unknown"}
                  </span>

                  {isAuthenticated && showBookmarks && (
                    <button
                      className={`bookmark-btn ${removingBookmarkId === blog._id ? "removing" : ""
                        }`}
                      onClick={(e) =>
                        handleRemoveBookmark(blog._id, e)
                      }
                      title="Remove bookmark"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to start your journey?</h2>
          <p>Join creators building meaningful platforms</p>

          {isAuthenticated ? (
            <Link to="/blog" className="btn btn-primary btn-lg">
              Write Your First Post
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
