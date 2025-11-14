import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [role, setRole] = useState("farmer");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const { login } = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await axios.post("/api/auth/register", {
      ...form,
      role,
    });

    login(res.data.user, res.data.token);
    nav(role === "farmer" ? "/farmer" : "/trader");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 w-full max-w-sm rounded-xl shadow"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="farmer">Farmer</option>
          <option value="trader">Trader</option>
        </select>

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Create account
        </button>
      </form>
    </div>
  );
}
