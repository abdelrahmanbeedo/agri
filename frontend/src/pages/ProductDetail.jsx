import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import PlaceOrderModal from "../components/PlaceOrderModal";
import NegotiatePriceModal from "../components/NegotiatePriceModal";
import { ArrowLeft, Package, User, ShoppingCart, MessageCircle, Zap, Star, ChevronRight, Image } from "lucide-react";
import ReviewList from "../components/ReviewList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user, isLoggedIn, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [startingNegotiation, setStartingNegotiation] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, count: 0 });

  useEffect(() => {
    async function fetchProduct() {
      try { setLoading(true);
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data); setError("");
      } catch { setError(t('productDetail.productNotFound')); }
      finally { setLoading(false); }
    }
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/api/reviews/product/${id}`)
      .then(res => { setReviews(res.data.reviews); setReviewStats(res.data.stats); })
      .catch(() => {});
  }, [id]);

  async function handleContactFarmer() {
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axios.post(`${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id }, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/messages?conversation=${res.data._id}`);
    } catch { alert(t('productDetail.contactFarmerFailed')); }
  }

  async function handleStartNegotiation() {
    if (!token) { navigate("/login"); return; }
    setStartingNegotiation(true);
    try {
      const res = await axios.post(`${API_URL}/api/negotiations`,
        { product_id: product._id, ask_price: product.price_per_unit, ask_quantity: product.quantity },
        { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/negotiation/${res.data.session_id}`);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.msg || t('productDetail.startNegotiationFailed'));
    } finally { setStartingNegotiation(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-sage-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">{t('productDetail.loading')}</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center animate-fadeIn">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-600 font-medium mb-4">{error || t('productDetail.productNotFound')}</p>
        <Link to={isLoggedIn ? (user?.role === "farmer" ? "/farmer" : "/trader") : "/"}
          className="text-sage-600 hover:text-sage-800 font-medium text-sm transition-colors">{t('productDetail.goBack')}</Link>
      </div>
    </div>
  );

  const isOwner = user?.role === "farmer" && product.farmer_id?._id === user.id;

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t('productDetail.back')}
        </button>

        <div className="card overflow-hidden">
          <div className="md:flex">
            <div className="md:w-[45%] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-8 min-h-[400px] relative">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.title}
                  className="max-w-full max-h-[400px] object-contain rounded-xl animate-scaleIn" />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Image className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">{t('productDetail.noImage')}</p>
                </div>
              )}
              {product.status === "active" ? (
                <span className="absolute top-4 left-4 badge badge-success">{t('productDetail.active')}</span>
              ) : (
                <span className="absolute top-4 left-4 badge badge-neutral">{t('productDetail.inactive')}</span>
              )}
            </div>

            <div className="md:w-[55%] p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="badge badge-info">{product.category}</span>
                {product.ai_grade && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold shadow-sm ${product.ai_grade.grade === "Grade A" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
                        title={`${(product.ai_grade.confidence * 100).toFixed(1)}% confidence`}>
                    {product.ai_grade.grade === "Grade A" ? "A" : "C"}
                    <span className="opacity-90 font-normal text-xs">{product.ai_grade.grade === "Grade A" ? "Fresh" : "Rotten"}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight">{product.title}</h1>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{Number(product.price_per_unit).toLocaleString()}</span>
                <span className="text-lg text-gray-500">EGP/{product.unit}</span>
              </div>

              <div className="py-5 border-y border-gray-100 mb-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('productDetail.available')}</p>
                    <p className="font-semibold text-gray-900">{product.quantity.toLocaleString()} {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('productDetail.totalValue')}</p>
                    <p className="font-semibold text-gray-900">{(product.quantity * product.price_per_unit).toLocaleString()} EGP</p>
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('productDetail.description')}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('productDetail.farmer')}</h3>
                <div className="flex items-center gap-3 p-3.5 bg-sage-50/60 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-sm font-bold">
                    {product.farmer_id?.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.farmer_id?.name || t('productDetail.unknown')}</p>
                    {product.farmer_id?.email && <p className="text-sm text-gray-500">{product.farmer_id.email}</p>}
                  </div>
                </div>
              </div>

              {product.status === "active" && user?.role === "trader" && !isOwner && (
                <div className="space-y-3">
                  <button onClick={() => setShowOrderModal(true)}
                    className="btn btn-primary btn-lg w-full">
                    <ShoppingCart className="w-5 h-5" />
                    {t('productDetail.placeOrder')}
                  </button>
                  <button onClick={handleStartNegotiation} disabled={startingNegotiation}
                    className="btn btn-lg w-full bg-gradient-to-r from-honey-500 to-honey-600 text-white hover:from-honey-600 hover:to-honey-700 shadow-sm border-none">
                    <Zap className="w-5 h-5" />
                    {startingNegotiation ? t('productDetail.starting') : t('productDetail.formalNegotiation')}
                  </button>
                  <button onClick={handleContactFarmer} className="btn btn-secondary btn-lg w-full">
                    <MessageCircle className="w-5 h-5" />
                    {t('productDetail.messageFarmer')}
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="p-4 bg-sage-50 rounded-xl border border-sage-100">
                  <p className="text-sm text-sage-700 font-medium">{t('productDetail.yourListing')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="card p-6 mt-6">
            <div className="flex items-center gap-3 mb-5">
              <Star className="w-5 h-5 text-honey-500 fill-honey-500" />
              <h2 className="font-semibold text-gray-900">{t('review.title')}</h2>
              <span className="text-sm text-gray-500">({reviewStats.count} {reviewStats.count === 1 ? t('review.oneReview') : t('review.multipleReviews')})</span>
            </div>
            <ReviewList reviews={reviews} onDelete={() => {}} />
          </div>
        )}

        <PlaceOrderModal product={product} isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />
        <NegotiatePriceModal product={product} isOpen={showNegotiateModal} onClose={() => setShowNegotiateModal(false)} />
      </div>
    </div>
  );
}
