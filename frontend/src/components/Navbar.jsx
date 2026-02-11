import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar() {
  const { user, isLoggedIn, logout, token } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnreadCount() {
    try {
      const res = await axios.get(`${API_URL}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      // Silently fail - user might not have access yet
    }
  }

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to={isLoggedIn ? (user?.role === "farmer" ? "/farmer" : "/trader") : "/"} className="flex items-center hover:opacity-80 transition">
            <span className="text-2xl font-bold text-green-600">🌾 AgriMarket</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/classify"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              🍌 Classify
            </Link>
            {isLoggedIn ? (
              <>
                {user?.role === "trader" && (
                  <Link
                    to="/trader"
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    Browse Products
                  </Link>
                )}
                {user?.role === "farmer" && (
                  <Link
                    to="/farmer"
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    My Products
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Orders
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition relative"
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user?.name} ({user?.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

