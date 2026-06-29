import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import axios from "axios";
import { MessageCircle, ShoppingCart, Package } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-sage-100 overflow-hidden hover:border-sage-200 transition-all duration-200">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-[4/3] bg-sage-50 overflow-hidden relative">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}
          {product.ai_grade && (
            <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1.5 border-2 border-white/30 ${
              product.ai_grade.grade === "Grade A" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}>
              <span className="text-lg">{product.ai_grade.grade === "Grade A" ? "A" : "C"}</span>
              <span>{product.ai_grade.grade === "Grade A" ? "Fresh" : "Rotten"}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-gray-900">
              {Number(product.price_per_unit).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">EGP/{product.unit}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
            <span>{product.quantity.toLocaleString()} {product.unit}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="truncate">{product.farmer_id?.name || t('productCard.farmer')}</span>
          </div>
        </div>
      </Link>

      {product.status === "active" && user?.role === "trader" && product.farmer_id?._id !== user.id && (
        <div className="px-4 pb-4 pt-0 flex gap-2.5">
          <button onClick={handleContactFarmer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-sage-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-sage-50 active:bg-sage-100 transition-colors min-h-[48px]">
            <MessageCircle className="w-5 h-5" />
            {t('productCard.message')}
          </button>
          <Link to={`/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 active:bg-sage-800 transition-colors shadow-sm min-h-[48px]">
            <ShoppingCart className="w-5 h-5" />
            {t('productCard.order')}
          </Link>
        </div>
      )}
    </div>
  );
}
