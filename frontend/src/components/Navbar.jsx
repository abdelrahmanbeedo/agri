import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { Leaf, MessageSquare, LogOut, User, Zap, Globe, Menu, X, LayoutDashboard, ShoppingBag, Scale, Home } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar() {
  const { user, isLoggedIn, logout, token } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const loadUnreadCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unread_count || 0);
      } catch {}
    };
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
      isActive(path)
        ? "text-sage-800 bg-sage-50"
        : "text-gray-600 hover:text-gray-900 hover:bg-sage-50"
    }`;
  const iconBtnClass = (path) =>
    `relative p-2 rounded-lg transition-all duration-150 ${
      isActive(path)
        ? "text-sage-700 bg-sage-50"
        : "text-gray-500 hover:text-gray-700 hover:bg-sage-50"
    }`;

  const navLinks = isLoggedIn ? (
    <>
      {user?.role === "trader" && (
        <Link to="/trader" className={linkClass("/trader")}>
          {language === "en" ? "Browse" : "تصفح"}
        </Link>
      )}
      {user?.role === "farmer" && (
        <Link to="/farmer" className={linkClass("/farmer")}>
          {language === "en" ? "Dashboard" : "لوحة التحكم"}
        </Link>
      )}
      {user?.role === "admin" && (
        <Link to="/admin" className={linkClass("/admin")}>
          Admin
        </Link>
      )}
      <Link to="/orders" className={linkClass("/orders")}>
        {language === "en" ? "Orders" : "الطلبات"}
      </Link>
    </>
  ) : null;

  const mobileLinks = isLoggedIn ? (
    <>
      <Link to={user?.role === "farmer" ? "/farmer" : "/trader"} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        <LayoutDashboard className="w-5 h-5 text-sage-500" />
        {language === "en" ? "Dashboard" : "لوحة التحكم"}
      </Link>
      <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        <ShoppingBag className="w-5 h-5 text-sage-500" />
        {language === "en" ? "Orders" : "الطلبات"}
      </Link>
      <Link to="/messages" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        <MessageSquare className="w-5 h-5 text-sage-500" />
        {language === "en" ? "Messages" : "الرسائل"}
        {unreadCount > 0 && (
          <span className="ml-auto bg-honey-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
      <Link to="/negotiations" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        <Scale className="w-5 h-5 text-sage-500" />
        {language === "en" ? "Negotiations" : "التفاوض"}
      </Link>
      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        <User className="w-5 h-5 text-sage-500" />
        {language === "en" ? "Profile" : "الملف الشخصي"}
      </Link>
      <Link to="/classify" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        <Zap className="w-5 h-5 text-sage-500" />
        {language === "en" ? "Classifier" : "المصنف"}
      </Link>
      <hr className="my-2 border-gray-100" />
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-left">
        <LogOut className="w-5 h-5" />
        {language === "en" ? "Sign out" : "تسجيل الخروج"}
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
        {language === "en" ? "Sign in" : "تسجيل الدخول"}
      </Link>
      <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors text-center justify-center">
        {language === "en" ? "Get started" : "ابدأ الآن"}
      </Link>
    </>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <Link
              to={isLoggedIn ? (user?.role === "farmer" ? "/farmer" : "/trader") : "/"}
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-sage-900 tracking-tight">AgriMarket</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks}
              <Link to="/classify" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-sage-50 rounded-lg transition-all duration-150">
                <Zap className="w-4 h-4" />
                <span>AI</span>
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-sage-50 rounded-lg transition-all duration-150"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'عربي' : 'EN'}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-1">
                  <Link to="/messages" className={iconBtnClass("/messages")}>
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-honey-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/negotiations" className={iconBtnClass("/negotiations")}>
                    <Scale className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
                    <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-sage-50 rounded-lg transition-all duration-150">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="hidden lg:inline max-w-[100px] truncate">{user?.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn btn-ghost">
                    {language === "en" ? "Sign in" : "تسجيل الدخول"}
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    {language === "en" ? "Get started" : "ابدأ الآن"}
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-sage-50 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-white shadow-xl md:hidden transform transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-sage-900">AgriMarket</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-sage-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {isLoggedIn && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-sage-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          {!isLoggedIn && (
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors">
              <Home className="w-5 h-5 text-sage-500" />
              {language === "en" ? "Home" : "الرئيسية"}
            </Link>
          )}
          {mobileLinks}
          <hr className="my-2 border-gray-100" />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sage-50 rounded-xl transition-colors w-full text-left"
          >
            <Globe className="w-5 h-5 text-sage-500" />
            {language === 'en' ? 'Switch to العربية' : 'Switch to English'}
          </button>
        </div>
      </div>
    </>
  );
}
