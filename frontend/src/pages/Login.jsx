import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Sprout, Shield } from "lucide-react";

export default function Login() {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!email || !password) {
      setError(t('auth.enterEmailPassword'));
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data.token && res.data.user) {
        const userRole = res.data.user.role;
        login(res.data.user, res.data.token);
        setTimeout(() => nav(userRole === "farmer" ? "/farmer" : "/trader", { replace: true }), 100);
      } else {
        setError(t('auth.invalidResponse'));
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.error || t('auth.invalidEmailPassword'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-sage-800 via-sage-900 to-sage-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-honey-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-sage-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-sage-600/10 to-transparent blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-between p-16 w-full">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AgriMarket</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              {isRTL ? "مرحباً بعودتك" : "Welcome back"}
            </h1>
            <p className="text-sage-300 text-lg leading-relaxed">
              {isRTL ? "سجل دخولك وتابع نمو أعمالك الزراعية" : "Sign in and continue growing your agricultural business"}
            </p>
            <div className="flex items-center gap-4 text-sage-300 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-honey-400" />
                <span>{isRTL ? "بيانات آمنة" : "Secure"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-honey-400" />
                <span>{isRTL ? "نمو مستمر" : "Growth"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sage-400 text-sm">
            <div className="h-px flex-1 bg-sage-700" />
            <span>{isRTL ? "سوق زراعي متكامل" : "Complete agricultural marketplace"}</span>
            <div className="h-px flex-1 bg-sage-700" />
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-sm animate-slideUp">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl mb-4 shadow-lg shadow-sage-200">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth.welcomeBack')}</h1>
            <p className="text-gray-500 mt-1.5">{t('auth.signInSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('auth.signingIn')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t('nav.signIn')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.noAccount')}{" "}
              <Link to="/register" className="font-medium text-sage-600 hover:text-sage-700 transition-colors">
                {t('auth.createOne')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
