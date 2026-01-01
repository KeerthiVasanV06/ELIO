import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReadingProgress from "../../components/Blog/ReadingProgress";
import ActionRail from "../../components/Blog/ActionRail";
import AuthorCard from "../../components/Blog/AuthorCard";
import CommentForm from "../../components/CommentForm/CommentForm";
import CommentList from "../../components/CommentList/CommentList";
import { getBlogBySlug, getImageUrl, deleteBlog } from "../../services/blogService";
import { getCommentsByBlog } from "../../services/commentService";
import { useAuth } from "../../context/AuthContext/useAuth";
import "./BlogDetail.css";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await getBlogBySlug(slug);
        console.log("Blog data received from API:", res.data);
        console.log("Blog tags:", res.data.tags);
        setBlog(res.data);

        const commentsRes = await getCommentsByBlog(res.data._id);
        setComments(commentsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlog();
  }, [slug]);

  const refetchBlog = async () => {
    try {
      const res = await getBlogBySlug(slug);
      setBlog(res.data);
    } catch (err) {
      console.error("Failed to refetch blog:", err);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteBlog(blog._id);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete blog:", err);
      setError("Failed to delete blog");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="blog-loading">Loading...</div>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <div className="blog-error">{error || "Blog not found"}</div>
      </>
    );
  }

  return (
    <>
      <ReadingProgress />

      <main className="blog-detail-page">
        {/* Breadcrumb */}
        <nav className="blog-breadcrumb">
          <div className="breadcrumb-container">
            <span
              className="breadcrumb-link"
              onClick={() => navigate("/")}
            >
              Home
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{blog.title}</span>
          </div>
        </nav>

        <article className="blog-article">
          {/* TITLE */}
          <h1 className="article-title">{blog.title}</h1>

          {/* META */}
          <div className="article-meta-header">
            <div className="meta-left">
              <span>
                By{" "}
                <button
                  className="author-link-btn"
                  onClick={() =>
                    navigate(`/profile/${blog.author?._id}`)
                  }
                >
                  {blog.author?.name}
                </button>
              </span>
            </div>

            <span className="meta-last-updated">
              Last updated {new Date(blog.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* COVER IMAGE */}
          {blog.coverImage && (
            <img
              src={getImageUrl(blog.coverImage)}
              alt={blog.title}
              className="article-cover-image"
            />
          )}

          {/* TAGS */}
          {blog.tags?.length > 0 && (
            <div className="article-tags">
              {blog.tags.map((tag) => (
                <span key={tag} className="tag-badge">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="blog-actions-section">
            <ActionRail
              blogId={blog._id}
              likes={blog.likes?.length || 0}
              onLike={refetchBlog}
            />
          </div>

          {/* BODY */}
          <div className="article-body">{blog.content}</div>


          {/* COMMENTS */}
          <section className="article-comments-section">
            <div className="comments-header">
              <h2 className="comments-title">Comment</h2>
            </div>

            <CommentForm
              blogId={blog._id}
              onCommentAdded={handleCommentAdded}
            />

            {comments.length > 0 && (
              <CommentList
                comments={comments}
                blogId={blog._id}
                onCommentDeleted={handleCommentDeleted}
              />
            )}
          </section>

          {/* DELETE BUTTON */}
          {(user?._id === blog.author?._id || user?.role === "admin") && (
            <div className="admin-delete-section">
              <button 
                className="delete-blog-btn"
                onClick={handleDeleteBlog}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Blog"}
              </button>
            </div>
          )}
        </article>
      </main>
    </>
  );
};

export default BlogDetail;
