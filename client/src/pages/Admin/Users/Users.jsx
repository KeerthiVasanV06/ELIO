import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext/useAuth";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../../../services/userService";
import "./Users.css";

const Users = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMessage("User role updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Delete this user?")) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((u) => u._id !== userId));
        setSuccessMessage("User deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user");
        console.error(err);
      }
    }
  };

  return (
    <div className="users-admin">
      <div className="admin-header">
        <div>
          <h1>Manage Users</h1>
          <p className="admin-subtitle">Control user roles and permissions</p>
        </div>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-section">
          {users.length === 0 ? (
            <p className="no-data">No users found</p>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete user"
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
  );
};

export default Users;