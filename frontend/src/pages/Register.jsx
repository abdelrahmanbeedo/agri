import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sprout, Users, Check } from "lucide-react";

export default function Register() {
  const { t, isRTL } = useLanguage();
  const [role, setRole] = useState("farmer");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const prefillRole = searchParams.get("role");
    if (prefillRole === "farmer" || prefillRole === "trader") setRole(prefillRole);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setError("");
    setLoading(true);
    if (!form.name || !form.email || !form.password) {
      setError(t('auth.fillAllFields'));
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError(t('auth.passwordLengthError'));
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/api/auth/register", { ...form, role });
      if (res.data.token && res.data.user) {
        login(res.data.user, res.data.token);
        setTimeout(() => nav(res.data.user.role === "farmer" ? "/farmer" : "/trader", { replace: true }), 100);
      } else {
        setError(t('auth.invalidResponse'));
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.error || t('auth.registrationFailed'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-sage-800 via-sage-900 to-sage-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-honey-500/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-sage-600/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-between p-16 w-full">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AgriMarket</span>
          </Link>

          <div className="space-y-8 max-w-md">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
                {isRTL ? "ابدأ رحلتك الآن" : "Start your journey"}
              </h1>
              <p className="text-sage-300 text-lg mt-3 leading-relaxed">
                {isRTL ? "انضم إلى آلاف المزارعين والتجار في أكبر سوق زراعي" : "Join thousands of farmers and traders in the largest agricultural marketplace"}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Sprout, text: isRTL ? "بيع منتجاتك مباشرة" : "Sell your products directly" },
                { icon: Users, text: isRTL ? "تواصل مع مشترين جدد" : "Connect with new buyers" },
                { icon: Check, text: isRTL ? "ابنِ سمعة وأرباح" : "Build reputation and profits" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sage-200 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-honey-400" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sage-500 text-sm">{isRTL ? "مجاني تماماً - انضم الآن" : "Completely free — join now"}</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-sm animate-slideUp">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl mb-4 shadow-lg shadow-sage-200">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth.createAccount')}</h1>
            <p className="text-gray-500 mt-1.5">{t('auth.joinCommunity')}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-sage-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className={`h-0.5 w-12 transition-all duration-300 ${step >= 2 ? 'bg-sage-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-sage-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="label">{t('auth.iAm')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("farmer")}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        role === "farmer"
                          ? "border-sage-500 bg-sage-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sprout className={`w-4 h-4 ${role === "farmer" ? 'text-sage-600' : 'text-gray-400'}`} />
                        <div className={`font-semibold text-sm ${role === "farmer" ? 'text-sage-800' : 'text-gray-700'}`}>
                          {t('auth.farmer')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{t('auth.sellProducts')}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("trader")}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        role === "trader"
                          ? "border-sage-500 bg-sage-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className={`w-4 h-4 ${role === "trader" ? 'text-sage-600' : 'text-gray-400'}`} />
                        <div className={`font-semibold text-sm ${role === "trader" ? 'text-sage-800' : 'text-gray-700'}`}>
                          {t('auth.trader')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{t('auth.buyProducts')}</div>
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-full">
                  {isRTL ? "التالي" : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="label">{t('auth.fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input pl-10" placeholder={t('auth.namePlaceholder')} required />
                  </div>
                </div>
                <div>
                  <label className="label">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input pl-10" placeholder={t('auth.emailPlaceholder')} required />
                  </div>
                </div>
                <div>
                  <label className="label">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input pl-10 pr-10" placeholder={t('auth.passwordMinLength')} required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                    {isRTL ? "رجوع" : "Back"}
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary flex-1 btn-lg">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('auth.creatingAccount')}
                      </span>
                    ) : t('auth.createAccountBtn')}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.haveAccount')}{" "}
              <Link to="/login" className="font-medium text-sage-600 hover:text-sage-700 transition-colors">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
