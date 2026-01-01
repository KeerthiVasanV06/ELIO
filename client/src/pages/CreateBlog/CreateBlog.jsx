import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BlogForm from "../../components/Blog/BlogForm";
import { createBlog, getBlogs } from "../../services/blogService";
import { getCategories } from "../../services/categoryService";
import "./CreateBlog.css";

const CreateBlog = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]); // Store all blogs before filtering
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const navigate = useNavigate();

  // Fetch categories on mount and when modal closes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const res = await getCategories();
        console.log("Categories response:", res.data);
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch blogs based on selected category
  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true);
      try {
        const res = await getBlogs(1, 12);
        const fetchedBlogs = res.data.blogs || [];
        setAllBlogs(fetchedBlogs); // Store all blogs

        console.log("All blogs:", fetchedBlogs);
        console.log("Selected category:", selectedCategory);
        
        // Find the category name if a category is selected
        let selectedCategoryName = null;
        if (selectedCategory) {
          const category = categories.find((cat) => cat._id === selectedCategory);
          selectedCategoryName = category?.name;
          console.log("Selected category name:", selectedCategoryName);
        }

        // Filter blogs by category ID or by tag name
        let filteredByCategory = fetchedBlogs;
        if (selectedCategory && selectedCategoryName) {
          filteredByCategory = fetchedBlogs.filter((blog) => {
            const hasCategoryId = blog.category?._id === selectedCategory;
            const hasTagMatch = blog.tags?.includes(selectedCategoryName.toLowerCase());
            console.log(`Blog "${blog.title}" - CategoryID match: ${hasCategoryId}, Tag match: ${hasTagMatch}`);
            return hasCategoryId || hasTagMatch;
          });
          console.log("Filtered blogs by category:", filteredByCategory);
        }

        // Apply search filter on top of category filter
        applySearchFilter(filteredByCategory, searchQuery);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, categories]);

  // Apply search filter whenever search query changes
  useEffect(() => {
    const selectedCategoryName = selectedCategory 
      ? categories.find((cat) => cat._id === selectedCategory)?.name 
      : null;

    // Filter blogs by category first
    let filteredByCategory = allBlogs;
    if (selectedCategory && selectedCategoryName) {
      filteredByCategory = allBlogs.filter((blog) => {
        const hasCategoryId = blog.category?._id === selectedCategory;
        const hasTagMatch = blog.tags?.includes(selectedCategoryName.toLowerCase());
        return hasCategoryId || hasTagMatch;
      });
    }

    // Then apply search filter on the category-filtered blogs
    applySearchFilter(filteredByCategory, searchQuery);
  }, [searchQuery, selectedCategory, allBlogs, categories]);

  const applySearchFilter = (blogsToFilter, query) => {
    if (!query.trim()) {
      // If search is empty, show all filtered blogs (by category)
      setBlogs(blogsToFilter);
    } else {
      // Filter by search query (case-insensitive)
      const searchLower = query.toLowerCase();
      const searched = blogsToFilter.filter((blog) => {
        const titleMatch = blog.title.toLowerCase().includes(searchLower);
        const excerptMatch = blog.content.toLowerCase().includes(searchLower);
        console.log(`Searching blog "${blog.title}" for "${query}" - Match: ${titleMatch || excerptMatch}`);
        return titleMatch || excerptMatch;
      });
      console.log("Search results:", searched);
      setBlogs(searched);
    }
  };

  const refreshCategories = async () => {
    try {
      console.log("Refreshing categories...");
      const res = await getCategories();
      console.log("Updated categories:", res.data);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to refresh categories:", err);
    }
  };

  const handleCreateBlog = async (data) => {
    try {
      setLoading(true);
      await createBlog(data);
      setShowCreateForm(false);
      await refreshCategories();
      
      const res = await getBlogs(1, 12);
      const allBlogs = res.data.blogs || [];
      if (selectedCategory) {
        const category = categories.find((cat) => cat._id === selectedCategory);
        const selectedCategoryName = category?.name;
        
        const filtered = allBlogs.filter((blog) => {
          const hasCategoryId = blog.category?._id === selectedCategory;
          const hasTagMatch = blog.tags?.includes(selectedCategoryName?.toLowerCase());
          return hasCategoryId || hasTagMatch;
        });
        setBlogs(filtered);
      } else {
        setBlogs(allBlogs);
      }
      alert("Blog created successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace("/api", "");
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="create-blog-page">
      {/* Floating Create Button */}
      <button
        className="floating-create-btn"
        onClick={() => setShowCreateForm(!showCreateForm)}
        title="Create Blog"
      >
        {showCreateForm ? "✕" : "✎"}
      </button>

      {/* Create Blog Modal */}
      {showCreateForm && (
        <div className="create-blog-modal">
          <div className="create-blog-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowCreateForm(false)}
            >
              ✕
            </button>
            <h2>Create New Blog</h2>
            <BlogForm onSubmit={handleCreateBlog} loading={loading} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="create-blog-container">
        <div className="create-blog-header">
          <h1>Explore Blogs</h1>
          <p>Click a category to see blogs or create your own</p>
        </div>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="categories-header">
            <h2>Categories</h2>
            <Link 
              className="refresh-categories-btn"
              onClick={refreshCategories}
              title="Refresh categories"
            >
              ↻
            </Link>
          </div>

          <div className="categories-grid">
            <button
              className={`category-btn ${!selectedCategory ? "active" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Blogs
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                className={`category-btn ${
                  selectedCategory === category._id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search blogs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </section>

        {/* Blogs Section */}
        <section className="category-blogs-section">
          <div className="blogs-header">
            <h2>
              {selectedCategory
                ? categories.find((c) => c._id === selectedCategory)?.name
                : "All"}
              {" "}Blogs
            </h2>
            <p className="blogs-count">
              {blogsLoading ? "Loading..." : `${blogs.length} blog(s)`}
            </p>
          </div>

          {blogsLoading ? (
            <div className="loading-state">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <p>No blogs found in this category.</p>
              <button
                className="create-btn-secondary"
                onClick={() => setShowCreateForm(true)}
              >
                Create First Blog
              </button>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog) => {
                const excerpt =
                  blog.content.length > 120
                    ? blog.content.substring(0, 120) + "..."
                    : blog.content;

                return (
                  <div
                    key={blog._id}
                    className="blog-card-item"
                    onClick={() => navigate(`/blogs/${blog.slug}`)}
                  >
                    {blog.coverImage && (
                      <div className="blog-card-image">
                        <img
                          src={getImageUrl(blog.coverImage)}
                          alt={blog.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="blog-card-info">
                      <h3>{blog.title}</h3>
                      <p className="blog-excerpt">{excerpt}</p>
                      <div className="blog-footer">
                        <span className="blog-author">
                          By {blog.author?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Create Blog Section at Bottom */}
        <section className="create-blog-section">
          <div className="create-blog-section-header">
            <h2>Ready to Share Your Story?</h2>
            <p>Create engaging content and connect with our growing community</p>
          </div>
          <button
            className="create-blog-btn-large"
            onClick={() => setShowCreateForm(true)}
          >
            ✨ Start Writing Now
          </button>
        </section>
      </div>
    </div>
  );
};

export default CreateBlog;
