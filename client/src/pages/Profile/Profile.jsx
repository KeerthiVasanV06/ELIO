import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditBlogCard from "../../components/Blog/EditBlogCard";
import { useAuth } from "../../context/AuthContext/useAuth";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getUserStats,
} from "../../services/userService";
import { getBlogsByAuthor, deleteBlog, getImageUrl, updateBlog } from "../../services/blogService";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { id: authorId } = useParams();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  const [stats, setStats] = useState({
    articlesWritten: 0,
    bookmarked: 0,
  });

  const [blogs, setBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setProfileError("");

        let res;
        let userId;

        // If viewing another user's profile by ID
        if (authorId) {
          res = await getUserById(authorId);
          userId = authorId;
          setIsOwnProfile(isAuthenticated && user?._id === authorId);
        } else {
          // If viewing own profile without ID
          if (!isAuthenticated) {
            navigate("/login");
            return;
          }
          res = await getProfile();
          // Ensure we get the _id from the response
          userId = res.data._id || res.data.id;
          console.log("User ID from getProfile:", userId);
          setIsOwnProfile(true);
        }

        if (!userId) {
          console.error("No userId found in profile response");
          setProfileError("Failed to load profile - missing user ID");
          setLoading(false);
          return;
        }

        console.log("Profile fetched:", res.data);
        setProfileData({
          name: res.data.name || "",
          email: res.data.email || "",
        });

        // Fetch stats for this user
        try {
          console.log("Fetching stats for userId:", userId);
          const statsRes = await getUserStats(userId);
          console.log("Stats response received:", statsRes.data);
          
          if (statsRes.data && statsRes.data.stats) {
            setStats({
              articlesWritten: statsRes.data.stats.articlesWritten || 0,
              bookmarked: statsRes.data.stats.bookmarked || 0,
            });
            console.log("Stats updated successfully");
          }
          
          if (statsRes.data && statsRes.data.bookmarkedBlogs) {
            setBookmarkedBlogs(statsRes.data.bookmarkedBlogs);
            console.log("Bookmarked blogs updated:", statsRes.data.bookmarkedBlogs.length);
          }
        } catch (statsError) {
          console.error("Stats fetch error:", statsError.response?.data || statsError.message);
          // Set default stats if fetching fails
          setStats({
            articlesWritten: 0,
            bookmarked: 0,
          });
          setBookmarkedBlogs([]);
        }

        // Fetch user's blogs
        try {
          setBlogsLoading(true);
          console.log("Fetching blogs for author:", userId);
          const blogsRes = await getBlogsByAuthor(userId);
          console.log("Blogs response received:", blogsRes.data);
          
          if (blogsRes.data && blogsRes.data.blogs) {
            setBlogs(blogsRes.data.blogs);
            console.log("Blogs updated successfully:", blogsRes.data.blogs.length);
          }
        } catch (blogsError) {
          console.error("Blogs fetch error:", blogsError.response?.data || blogsError.message);
          setBlogs([]);
        } finally {
          setBlogsLoading(false);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setProfileError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authorId, isAuthenticated, user?._id, navigate]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSuccessMessage("");

    try {
      setLoading(true);
      await updateProfile(profileData);
      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setSuccessMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");
      setShowPasswordForm(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(blogId);
        setSuccessMessage("Blog deleted successfully!");
        setBlogs(blogs.filter((blog) => blog._id !== blogId));
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setProfileError("Failed to delete blog");
        console.error(err);
      }
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
  };

  const handleSaveEditBlog = async (updatedBlog) => {
    setEditLoading(true);
    try {
      console.log("Saving blog with ID:", editingBlog._id);
      console.log("Updated blog data:", updatedBlog);
      
      await updateBlog(editingBlog._id, updatedBlog);
      setSuccessMessage("Blog updated successfully!");
      
      // Update the blog in the local state
      setBlogs(blogs.map(b => b._id === editingBlog._id ? { ...b, ...updatedBlog } : b));
      
      // Close the modal
      setEditingBlog(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update blog";
      setProfileError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading && !profileData.name) {
    return (
      <>
        <main className="profile-page">
          <div className="loading-state">Loading profile...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="profile-page">
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="profile-wrapper">
          {/* LinkedIn-style Header Card */}
          <section className="profile-header-card">
            <div className="header-background"></div>
            <div className="profile-header-content">
              <div className="avatar-section">
                <div className="avatar-circle">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="header-info">
                <h1>{profileData.name}</h1>
                <p className="job-title">Blogger & Writer</p>
                <p className="location">{profileData.email}</p>
              </div>
              {isOwnProfile && (
                <button 
                  className="edit-btn"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              )}
            </div>
          </section>

          {/* Edit Mode Form */}
          {editMode && isOwnProfile && (
            <section className="edit-form-card">
              <h2>Edit Your Information</h2>
              {profileError && <div className="error-message">{profileError}</div>}
              <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="save-btn">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Two Column Layout */}
          <div className="profile-main-grid">
            {/* Left Column - About & Settings */}
            <div className="profile-left">
              {/* About Section */}
              <section className="profile-card">
                <h2>About</h2>
                <p className="about-text">
                  Passionate blogger sharing insights, ideas, and experiences through thoughtful writing.
                </p>
              </section>

              {/* Password Change Section */}
              {isOwnProfile && (
                <section className="profile-card security-card">
                <div className="section-header">
                  <h2>Security</h2>
                  <button 
                    className="section-toggle"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? "✕" : "✎"}
                  </button>
                </div>

                {showPasswordForm ? (
                  <>
                    {passwordError && <div className="error-message">{passwordError}</div>}
                    <form onSubmit={handleChangePassword} className="password-form">
                      <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                          id="currentPassword"
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                          id="newPassword"
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password (min 6 characters)"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" disabled={loading} className="save-btn">
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <p className="password-info">Keep your account secure with a strong password.</p>
                )}
              </section>
              )}
            </div>

            {/* Right Column - Stats */}
            <div className="profile-right">
              {/* Profile Stats */}
              <section className="profile-card stats-card">
                <h2>Profile Stats</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">{stats.articlesWritten}</div>
                    <div className="stat-label">Articles Written</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.bookmarked}</div>
                    <div className="stat-label">Bookmarked</div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* User's Published Blogs Section */}
          {isOwnProfile && (
            <section className="profile-card blogs-section">
              <h2>Your Published Blogs</h2>
              {blogsLoading ? (
                <div className="loading-state">Loading blogs...</div>
              ) : blogs.length === 0 ? (
                <p className="no-blogs-message">You haven't published any blogs yet.</p>
              ) : (
                <div className="blogs-list">
                  {blogs.map((blog) => (
                    <div key={blog._id} className="blog-row">
                      <div className="blog-info">
                        <h4>{blog.title}</h4>
                        <p className="blog-meta">
                          <span className="status-badge">{blog.status}</span>
                          <span className="views-count">{blog.views} views</span>
                          <span className="publish-date">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <div className="blog-actions">
                        <button
                          className="edit-blog-btn"
                          onClick={() => handleEditBlog(blog)}
                          title="Edit blog"
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="delete-blog-btn"
                          onClick={() => handleDeleteBlog(blog._id)}
                          title="Delete blog"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Bookmarked Blogs Section */}
          {isOwnProfile && (
            <section className="profile-card bookmarks-section">
              <h2>Your Bookmarks</h2>
              {bookmarkedBlogs.length === 0 ? (
                <p className="no-blogs-message">You haven't bookmarked any blogs yet.</p>
              ) : (
                <div className="bookmarks-list">
                  {bookmarkedBlogs.map((blog) => (
                    <div key={blog._id} className="bookmark-row">
                      <div className="bookmark-info">
                        <h4>{blog.title}</h4>
                        <p className="bookmark-meta">
                          <span className="status-badge">{blog.status}</span>
                          <span className="views-count">{blog.views} views</span>
                          <span className="publish-date">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <div className="bookmark-actions">
                        <button
                          className="view-blog-btn"
                          onClick={() => navigate(`/blogs/${blog.slug}`)}
                          title="View blog"
                        >
                          👁 View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Edit Blog Modal */}
        {editingBlog && (
          <div className="edit-blog-modal-overlay" onClick={() => setEditingBlog(null)}>
            <div className="edit-blog-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Blog</h2>
                <button 
                  className="modal-close-btn"
                  onClick={() => setEditingBlog(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <EditBlogCard 
                  blog={editingBlog}
                  onSave={handleSaveEditBlog}
                  onCancel={() => setEditingBlog(null)}
                  loading={editLoading}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Profile;