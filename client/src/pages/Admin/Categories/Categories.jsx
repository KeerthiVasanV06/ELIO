import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext/useAuth";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../../services/categoryService";
import "./Categories.css";

const Categories = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }

    fetchCategories();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newCategory.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      await createCategory({ name: newCategory });
      setNewCategory("");
      setSuccessMessage("Category created successfully!");
      fetchCategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter((c) => c._id !== id));
        setSuccessMessage("Category deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete category");
        console.error(err);
      }
    }
  };

  return (
    <div className="categories-admin">
      <div className="admin-header">
        <div>
          <h1>Manage Categories</h1>
          <p className="admin-subtitle">Create and manage blog categories</p>
        </div>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="create-section">
        <h2>Add New Category</h2>
        <form onSubmit={handleCreateCategory} className="create-form">
          <input
            type="text"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="form-submit-btn">+ Add Category</button>
        </form>
      </div>

      <div className="categories-section">
        <h2>All Categories</h2>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : (
          <div className="categories-list">
            {categories.length === 0 ? (
              <p className="no-data">No categories yet. Create your first category above.</p>
            ) : (
              <div className="table-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id}>
                        <td><strong>{cat.name}</strong></td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(cat._id)}
                            title="Delete category"
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;