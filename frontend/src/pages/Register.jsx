import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Leaf, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("farmer");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const prefillRole = searchParams.get("role");
    if (prefillRole === "farmer" || prefillRole === "trader") {
      setRole(prefillRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        ...form,
        role,
      });

      if (res.data.token && res.data.user) {
        const userRole = res.data.user.role;
        login(res.data.user, res.data.token);
        
        setTimeout(() => {
          if (userRole === "farmer") {
            nav("/farmer", { replace: true });
          } else if (userRole === "trader") {
            nav("/trader", { replace: true });
          } else {
            nav("/trader", { replace: true });
          }
        }, 100);
      } else {
        setError("Invalid response from server.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.error || "Registration failed.");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-sage-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-sage-100 rounded-xl mb-4">
                <Leaf className="w-7 h-7 text-sage-600" />
              </div>
              <h1 className="text-2xl font-bold text-sage-900">Create your account</h1>
              <p className="text-sage-500 mt-1">Join the AgriMarket community</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-sage-400" />
                  </div>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-shadow"
                    placeholder="Ahmed Hassan"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-sage-400" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-shadow"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sage-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full pl-10 pr-12 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-shadow"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sage-400 hover:text-sage-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === "farmer"
                        ? "border-sage-500 bg-sage-50"
                        : "border-sage-200 hover:border-sage-300"
                    }`}
                  >
                    <div className="font-medium text-sage-900">Farmer</div>
                    <div className="text-sm text-sage-500">Sell my products</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("trader")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === "trader"
                        ? "border-sage-500 bg-sage-50"
                        : "border-sage-200 hover:border-sage-300"
                    }`}
                  >
                    <div className="font-medium text-sage-900">Trader</div>
                    <div className="text-sm text-sage-500">Buy products</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sage-600 text-white py-3 rounded-xl font-medium hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sage-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-sage-800 hover:text-sage-900">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
