import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import Navbar from "../components/Navbar";
import { Leaf, Users, Handshake, ArrowRight, Sprout, Scale } from "lucide-react";

export default function Home() {
  const { t, isRTL } = useLanguage();
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <section className="relative bg-white border-b border-sage-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sage-50 text-sage-700 rounded-full text-sm font-medium mb-6">
                <Sprout className="w-4 h-4" />
                {t('home.connectingFarmers')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-sage-900 mb-6 leading-tight">
                {t('home.heroFresh')}<br className="hidden sm:block" />
                <span className="text-honey-600">{t('home.heroDirect')}</span>
              </h1>
              <p className="text-lg text-sage-600 mb-10 max-w-xl mx-auto leading-relaxed">
                {t('home.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 bg-sage-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-sage-700 transition-colors shadow-lg shadow-sage-600/20"
                    >
                      {t('nav.getStarted')} <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 bg-white text-sage-700 px-8 py-3.5 rounded-xl font-medium border border-sage-200 hover:border-sage-300 hover:bg-sage-50 transition-colors"
                    >
                      {t('nav.signIn')}
                    </Link>
                  </>
                ) : (
                  <Link
                    to={user?.role === "farmer" ? "/farmer" : "/trader"}
                    className="inline-flex items-center justify-center gap-2 bg-sage-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-sage-700 transition-colors shadow-lg shadow-sage-600/20"
                  >
                    {t('home.goToDashboard')} <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-sage-900 mb-3">{t('home.howItWorks')}</h2>
            <p className="text-sage-600">{t('home.simplePlatform')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-sage-100 hover:border-sage-200 hover:shadow-soft transition-all">
              <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center mb-5">
                <Leaf className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">{t('home.forFarmers')}</h3>
              <p className="text-sage-600 leading-relaxed">
                {t('home.forFarmersDesc')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-sage-100 hover:border-sage-200 hover:shadow-soft transition-all">
              <div className="w-12 h-12 bg-honey-50 rounded-xl flex items-center justify-center mb-5">
                <Scale className="w-6 h-6 text-honey-600" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">{t('home.forTraders')}</h3>
              <p className="text-sage-600 leading-relaxed">
                {t('home.forTradersDesc')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-sage-100 hover:border-sage-200 hover:shadow-soft transition-all">
              <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center mb-5">
                <Handshake className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">{t('home.directTrade')}</h3>
              <p className="text-sage-600 leading-relaxed">
                {t('home.directTradeDesc')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-sage-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-1">{t('home.readyToStart')}</h3>
                <p className="text-sage-200">{t('home.joinMarketplace')}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/register?role=farmer"
                  className="px-6 py-2.5 bg-white text-sage-700 font-medium rounded-lg hover:bg-sage-50 transition-colors"
                >
                  {t('home.registerAsFarmer')}
                </Link>
                <Link
                  to="/register?role=trader"
                  className="px-6 py-2.5 bg-sage-500 text-white font-medium rounded-lg hover:bg-sage-400 transition-colors"
                >
                  {t('home.registerAsTrader')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-white border-t border-sage-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-sage-500 rounded-md flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sage-800">AgriMarket</span>
              </div>
              <p className="text-sm text-sage-500">
                {t('home.marketplaceTagline')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
