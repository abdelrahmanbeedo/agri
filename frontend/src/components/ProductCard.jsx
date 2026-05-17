import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import axios from "axios";
import { MessageCircle, ShoppingCart, Package, MapPin, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductCard({ product }) {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const handleContactFarmer = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/messages?conversation=${res.data._id}`);
    } catch { alert(t('productDetail.contactFarmerFailed')); }
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-100 overflow-hidden hover:border-sage-200 hover:shadow-lg hover:shadow-sage-900/5 transition-all duration-300 animate-scaleIn">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-[4/3] bg-sage-50 overflow-hidden relative">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}
          {product.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg shadow-sm">
              {product.category}
            </span>
          )}
          {product.ai_grade_id && (
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 ${product.ai_grade_id.grade === "Grade A" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
                 title={`${product.ai_grade_id.grade} — ${product.ai_grade_id.fruit} (${(product.ai_grade_id.confidence * 100).toFixed(0)}%)`}>
              <span className="text-sm">{product.ai_grade_id.grade === "Grade A" ? "A" : "C"}</span>
              <span className="opacity-90 font-normal">{product.ai_grade_id.grade === "Grade A" ? "Fresh" : "Rotten"}</span>
            </div>
          )}
          {product.average_rating > 0 && (
            <span className={`absolute px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg shadow-sm flex items-center gap-1 ${product.ai_grade_id ? "bottom-3 right-3" : "top-3 right-3"}`}>
              <Star className="w-3 h-3 text-honey-500 fill-honey-500" />
              {product.average_rating.toFixed(1)}
            </span>
          )}
          {product.status === "inactive" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium text-gray-600">Inactive</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-gray-900 group-hover:text-sage-700 transition-colors leading-snug line-clamp-2">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-baseline gap-1.5 mt-4">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {Number(product.price_per_unit).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">EGP/{product.unit}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
            <span>{product.quantity.toLocaleString()} {product.unit}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="capitalize">{product.farmer_id?.name || t('productCard.farmer')}</span>
          </div>
        </div>
      </Link>

      {product.status === "active" && user?.role === "trader" && product.farmer_id?._id !== user.id && (
        <div className="px-5 pb-5 pt-0 flex gap-2.5">
          <button onClick={handleContactFarmer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sage-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-sage-50 hover:border-sage-300 transition-all duration-200">
            <MessageCircle className="w-4 h-4" />
            {t('productCard.message')}
          </button>
          <Link to={`/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-all duration-200 shadow-sm hover:shadow-md">
            <ShoppingCart className="w-4 h-4" />
            {t('productCard.order')}
          </Link>
        </div>
      )}
    </div>
  );
}
