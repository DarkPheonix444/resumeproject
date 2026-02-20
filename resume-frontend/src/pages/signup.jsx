import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !name || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/signup/", {
        email,
        name,
        password,
      });

      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.email) {
        setError("Email already exists");
      } else if (err.response?.data?.password) {
        setError(err.response.data.password[0]);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start your Resume Scanner journey in seconds.">
      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSignup}>
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
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="auth-alt-text">
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </AuthLayout>
  );
}
