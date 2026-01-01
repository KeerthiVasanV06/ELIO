import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlogForm from "../../components/Blog/BlogForm";
import { getBlogBySlug, updateBlog } from "../../services/blogService";
import "./EditBlog.css";

const EditBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getBlogBySlug(slug);
        setBlog(res.data);
      } catch (err) {
        setError("Failed to load blog");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleUpdateBlog = async (data) => {
    try {
      setError("");
      await updateBlog(blog._id, data);
      navigate(`/blogs/${data.slug || slug}`);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update blog";
      setError(message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <div className="edit-blog-loading">Loading...</div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <div className="edit-blog-error">{error || "Blog not found"}</div>
      </>
    );
  }

  return (
    <>
      <main className="edit-blog-page">
        <div className="edit-blog-container">
          <h1>Edit Blog</h1>
          {error && <div className="page-error">{error}</div>}
          <BlogForm
            initialData={blog}
            onSubmit={handleUpdateBlog}
            loading={loading}
          />
        </div>
      </main>
    </>
  );
};

export default EditBlog;