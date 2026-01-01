import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext/useAuth";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Register the user
      await registerUser(form);
      
      // Automatically log in the user with the same credentials
      const loginRes = await loginUser({
        email: form.email,
        password: form.password,
      });
      
      // Store token and user data in auth context
      login(loginRes.data.token, loginRes.data.user);
      
      // Redirect to home page
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1 className="register-title">Create account</h1>
        <p className="register-subtitle">Start writing & sharing</p>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p>Already have an account? <a href="/login">Login</a></p>

        {error && <p className="register-error">{error}</p>}
      </form>
    </div>
  );
};

export default Register;
