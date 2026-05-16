import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { Leaf, Users, Handshake, ArrowRight, Sprout, Scale, Shield, TrendingUp, Star, ChevronRight, CheckCircle, Wheat, Package } from "lucide-react";

const stats = [
  { value: "2,500+", labelEn: "Active Farmers", labelAr: "مزارع نشط" },
  { value: "8,000+", labelEn: "Tons Traded", labelAr: "طن متداول" },
  { value: "98%", labelEn: "Satisfaction Rate", labelAr: "نسبة رضا" },
  { value: "15+", labelEn: "Countries Reached", labelAr: "دولة وصلت" },
];

const steps = [
  { icon: UserPlus, titleEn: "Create Account", titleAr: "إنشاء حساب", descEn: "Sign up as a farmer or trader in under 2 minutes", descAr: "سجل كمزارع أو تاجر في أقل من دقيقتين" },
  { icon: Package, titleEn: "List or Browse", titleAr: "اعرض أو تصفح", descEn: "Farmers list produce, traders find what they need", descAr: "يعرض المزارعون المنتجات، ويجد التجار ما يحتاجون" },
  { icon: Handshake, titleEn: "Negotiate & Trade", titleAr: "تفاوض وتاجر", descEn: "Agree on price, quality, and delivery terms directly", descAr: "اتفق على السعر والجودة وشروط التوصيل مباشرة" },
  { icon: Truck, titleEn: "Deliver & Grow", titleAr: "توصيل ونمو", descEn: "Close deals, build reputation, and scale your business", descAr: "أغلق الصفقات، ابن سمعتك، ووسع أعمالك" },
];

function UserPlus(props) { return <Users {...props} />; }
function Truck(props) { return <Package {...props} />; }

const features = [
  { icon: Scale, titleEn: "Fair Price Negotiation", titleAr: "تفاوض عادل على السعر", descEn: "Built-in negotiation protocol with market benchmarks and smart suggestions to ensure fair deals for both sides." },
  { icon: Shield, titleEn: "Verified Quality", titleAr: "جودة موثقة", descEn: "Every product listing includes detailed specifications, images, and farmer reputation scores." },
  { icon: TrendingUp, titleEn: "Market Insights", titleAr: "رؤى السوق", descEn: "Real-time price trends, demand forecasting, and data-driven recommendations." },
  { icon: Star, titleEn: "Reputation System", titleAr: "نظام السمعة", descEn: "Build trust through reviews, ratings, and a transparent trading history." },
];

export default function Home() {
  const { t, isRTL } = useLanguage();
  const { isLoggedIn, user } = useAuth();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ---- Hero ---- */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-sage-50 via-white to-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sage-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-honey-200/20 blur-3xl" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-sage-100/20 to-transparent blur-3xl" />
          <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-sage-300/40 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-32 right-20 w-3 h-3 rounded-full bg-honey-400/40 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-sage-400/30 animate-pulse" style={{ animationDuration: '5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-sage-200 text-sage-700 rounded-full text-sm font-medium mb-8 shadow-sm animate-fadeIn">
              <Sprout className="w-4 h-4" />
              <span>{t('home.connectingFarmers')}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-sage-950 mb-6 leading-[1.05] tracking-tight animate-fadeIn">
              {t('home.heroFresh')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-honey-500 to-honey-600">
                {t('home.heroDirect')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fadeIn">
              {t('home.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center gap-2 bg-sage-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-sage-700 transition-all duration-200 shadow-lg shadow-sage-600/20 hover:shadow-xl hover:shadow-sage-600/25 hover:-translate-y-0.5"
                  >
                    {t('nav.getStarted')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-medium border border-gray-200 hover:border-sage-300 hover:bg-sage-50 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {t('nav.signIn')}
                  </Link>
                </>
              ) : (
                <Link
                  to={user?.role === "farmer" ? "/farmer" : "/trader"}
                  className="group inline-flex items-center justify-center gap-2 bg-sage-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-sage-700 transition-all duration-200 shadow-lg shadow-sage-600/20 hover:shadow-xl hover:shadow-sage-600/25 hover:-translate-y-0.5"
                >
                  {t('home.goToDashboard')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="relative -mt-16 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-100 shadow-xl shadow-sage-900/5 p-6 md:p-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl md:text-4xl font-bold text-sage-700 tracking-tight">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{isRTL ? stat.labelAr : stat.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-sage-600 uppercase tracking-widest">{t('home.howItWorks')}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-sage-950 mt-3 tracking-tight">
            {isRTL ? "من البداية إلى الصفقة" : "From start to deal"}
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-lg">
            {isRTL ? "أربع خطوات بسيطة لبدء التداول" : "Four simple steps to start trading"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative group animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-sage-100 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-sage-200 group-hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-sage-600" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-sage-500 bg-sage-50 px-2 py-0.5 rounded-full">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isRTL ? step.titleAr : step.titleEn}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {isRTL ? step.descAr : step.descEn}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="bg-gradient-to-b from-white to-sage-50 border-y border-sage-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-sage-600 uppercase tracking-widest">{isRTL ? "لماذا أغري ماركت" : "WHY AGRIMARKET"}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-sage-950 mt-3 tracking-tight">
              {isRTL ? "مميزات قوية للتجارة" : "Powerful features for trading"}
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto text-lg">
              {isRTL ? "كل ما تحتاجه لتنمية أعمالك الزراعية" : "Everything you need to grow your agricultural business"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-sage-100 shadow-sm hover:shadow-lg hover:border-sage-200 transition-all duration-300 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center shadow-sm shadow-sage-200">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                      {isRTL ? feat.titleAr : feat.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {isRTL ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-700 via-sage-800 to-sage-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-honey-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-honey-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              {isRTL ? "جاهز لبدء التداول؟" : "Ready to start trading?"}
            </h2>
            <p className="text-sage-200 text-lg mb-10 max-w-lg mx-auto">
              {isRTL ? "انضم إلى آلاف المزارعين والتجار الذين يبنون مستقبل التجارة الزراعية" : "Join thousands of farmers and traders building the future of agricultural trade"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?role=farmer"
                className="group inline-flex items-center justify-center gap-2 bg-white text-sage-800 px-8 py-4 rounded-xl font-semibold hover:bg-sage-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Sprout className="w-5 h-5" />
                {isRTL ? "سجل كمزارع" : "Register as Farmer"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/register?role=trader"
                className="group inline-flex items-center justify-center gap-2 bg-sage-600 text-white px-8 py-4 rounded-xl font-semibold border border-sage-500 hover:bg-sage-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                {isRTL ? "سجل كتاجر" : "Register as Trader"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="bg-white/80 border-t border-sage-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sage-900 tracking-tight">AgriMarket</span>
            </div>
            <p className="text-sm text-gray-400">
              {t('home.marketplaceTagline')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
