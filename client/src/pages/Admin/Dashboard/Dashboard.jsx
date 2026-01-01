import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext/useAuth";
import { getUsers } from "../../../services/userService";
import { getCategories } from "../../../services/categoryService";
import { getBlogs } from "../../../services/blogService";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalUsers: 0,
    totalCategories: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const [blogsRes, usersRes, catsRes] = await Promise.all([
          getBlogs(1, 1),
          getUsers(),
          getCategories(),
        ]);

        setStats({
          totalBlogs: blogsRes.data.totalBlogs || 0,
          totalUsers: usersRes.data.length || 0,
          totalCategories: catsRes.data.length || 0,
        });
      } catch (err) {
        setError("Failed to load stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, isAdmin, navigate]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blog-icon">📝</div>
              <div className="stat-content">
                <p className="stat-label">Total Blogs</p>
                <p className="stat-number">{stats.totalBlogs}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon users-icon">👥</div>
              <div className="stat-content">
                <p className="stat-label">Total Users</p>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon categories-icon">📁</div>
              <div className="stat-content">
                <p className="stat-label">Total Categories</p>
                <p className="stat-number">{stats.totalCategories}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon role-icon">🔐</div>
              <div className="stat-content">
                <p className="stat-label">Your Role</p>
                <p className="stat-number capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;