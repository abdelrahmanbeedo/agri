import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { MessageCircle, BadgeDollarSign, Package, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const handleContactFarmer = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      navigate(`/messages?conversation=${res.data._id}`);
    } catch (err) {
      console.error("Contact farmer error:", err);
      alert("Failed to start conversation.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sage-100 overflow-hidden hover:border-sage-200 hover:shadow-soft transition-all group">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-[4/3] bg-sage-50 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-sage-300" />
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-sage-900 group-hover:text-sage-700 transition-colors line-clamp-2">
                {product.title}
              </h3>
              <p className="text-sm text-sage-500 mt-1">{product.category}</p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${
              product.status === "active" 
                ? "bg-sage-100 text-sage-700" 
                : "bg-earth-100 text-earth-600"
            }`}>
              {product.status}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-sage-900">
                {product.price_per_unit}
              </span>
              <span className="text-sm text-sage-500">EGP/{product.unit}</span>
            </div>
            <p className="text-sm text-sage-600 mt-1">
              {product.quantity} {product.unit} available
            </p>
          </div>

          {product.farmer_id?.name && (
            <div className="flex items-center gap-1.5 text-sm text-sage-500">
              <MapPin className="w-4 h-4" />
              <span>{product.farmer_id.name}</span>
            </div>
          )}
        </div>
      </Link>

      {product.status === "active" && user?.role === "trader" && product.farmer_id?._id !== user.id && (
        <div className="px-5 pb-5 pt-0 flex gap-2">
          <button
            onClick={handleContactFarmer}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sage-200 text-sage-700 rounded-xl text-sm font-medium hover:bg-sage-50 hover:border-sage-300 transition-colors"
            title="Message farmer"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <Link
            to={`/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-colors"
            title="View and order"
          >
            <BadgeDollarSign className="w-4 h-4" />
            Order
          </Link>
        </div>
      )}
    </div>
  );
}
