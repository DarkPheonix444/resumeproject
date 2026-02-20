import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

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
      const response = await api.post("/users/signup/", {
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
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Sign Up</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px" }}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p>
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </div>
  );
}
