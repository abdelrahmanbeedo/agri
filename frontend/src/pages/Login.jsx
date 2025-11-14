import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // <-- NEW
  const nav = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); // clear old errors

    try {
      const res = await axios.post("/api/auth/login", { email, password });

      login(res.data.user, res.data.token);

      nav(res.data.user.role === "farmer" ? "/farmer" : "/trader");
    } catch (err) {
      setError("Invalid email or password. Please try again."); // <-- NEW
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 w-full max-w-sm rounded-xl shadow"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">{error}</p> // <-- NEW
        )}

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>

        <p className="mt-3 text-sm">
          No account? <a href="/register" className="text-blue-500">Register</a>
        </p>
      </form>
    </div>
  );
}
