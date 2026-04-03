import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { Leaf, MessageSquare, LogOut, User } from "lucide-react";

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
    if (!isLoggedIn || !token) return;
    
    const loadUnreadCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unread_count || 0);
      } catch {
        // Silently fail
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to={isLoggedIn ? (user?.role === "farmer" ? "/farmer" : "/trader") : "/"} 
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center group-hover:bg-sage-600 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-sage-800">AgriMarket</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/classify"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              🍌 Classify
            </Link>
          <div className="flex items-center gap-1">
            {isLoggedIn ? (
              <>
                {user?.role === "trader" && (
                  <Link
                    to="/trader"
                    className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-50 rounded-lg transition-colors"
                  >
                    Browse
                  </Link>
                )}
                {user?.role === "farmer" && (
                  <Link
                    to="/farmer"
                    className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-50 rounded-lg transition-colors"
                  >
                    My Products
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-50 rounded-lg transition-colors"
                >
                  Orders
                </Link>
                <Link
                  to="/messages"
                  className="relative p-2 text-sage-700 hover:text-sage-900 hover:bg-sage-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-honey-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-sage-200">
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-sage-600 hover:text-sage-900 hover:bg-sage-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-sage-700 hover:text-sage-900 hover:bg-sage-50 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-sage-600 text-white hover:bg-sage-700 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
