import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/token/", {
        email,
        password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      alert("Login successful");
      navigate("/");
    } catch (error) {
      setError("Invalid email or password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue scanning and analyzing resumes.">
      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="auth-alt-text">
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </AuthLayout>
  );
}
