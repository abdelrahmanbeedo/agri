import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import Navbar from "../components/Navbar";
import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
        setError(t('auth.invalidResponse'));
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || t('auth.invalidEmailPassword');
      setError(errorMsg);
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-sage-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-sage-100 rounded-xl mb-4">
                <Leaf className="w-7 h-7 text-sage-600" />
              </div>
              <h1 className="text-2xl font-bold text-sage-900">{t('auth.welcomeBack')}</h1>
              <p className="text-sage-500 mt-1">{t('auth.signInSubtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-sage-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-shadow"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sage-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-shadow"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sage-600 text-white py-3 rounded-xl font-medium hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('auth.signingIn') : t('nav.signIn')}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sage-600">
                {t('auth.noAccount')}{" "}
                <Link to="/register" className="font-medium text-sage-800 hover:text-sage-900">
                  {t('auth.createOne')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
