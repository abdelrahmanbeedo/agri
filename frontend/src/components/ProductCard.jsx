import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
      alert("Failed to start conversation. Please try again.");
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group flex flex-col">
      <Link
        to={`/products/${product._id}`}
        className="flex-1 flex flex-col"
      >
      {/* Product Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-2">🌾</div>
            <p className="text-sm">No image</p>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition line-clamp-2">
            {product.title}
          </h3>
        </div>

        <p className="text-sm text-gray-500 mb-3 capitalize">{product.category}</p>

        <div className="mb-3">
          <p className="text-2xl font-bold text-green-600">
            {product.price_per_unit} EGP
          </p>
          <p className="text-xs text-gray-500">per {product.unit}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>Available: {product.quantity} {product.unit}</span>
          {product.farmer_id?.name && (
            <span className="text-xs">by {product.farmer_id.name}</span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
            product.status === "active" 
              ? "bg-green-100 text-green-800" 
              : product.status === "sold"
              ? "bg-gray-100 text-gray-800"
              : "bg-red-100 text-red-800"
          }`}>
            {product.status}
          </span>
          <span className="text-green-600 text-sm font-medium group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
      </Link>

      {/* Action Buttons */}
      {product.status === "active" && user?.role === "trader" && product.farmer_id?._id !== user.id && (
        <div className="p-4 pt-0 border-t grid grid-cols-3 gap-2">
          <button
            onClick={handleContactFarmer}
            className="bg-blue-500 text-white px-2 py-2 rounded text-xs hover:bg-blue-600 transition font-medium"
            title="Message farmer"
          >
            💬
          </button>
          <Link
            to={`/products/${product._id}`}
            className="bg-yellow-500 text-white px-2 py-2 rounded text-xs hover:bg-yellow-600 transition font-medium text-center"
            title="Negotiate price"
          >
            💰
          </Link>
          <Link
            to={`/products/${product._id}`}
            className="bg-green-600 text-white px-2 py-2 rounded text-xs hover:bg-green-700 transition font-medium text-center"
            title="Place order"
          >
            📦
          </Link>
        </div>
      )}
    </div>
  );
}

