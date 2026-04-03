import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PlaceOrderModal from "../components/PlaceOrderModal";
import NegotiatePriceModal from "../components/NegotiatePriceModal";
import { ArrowLeft, Package, User, MapPin, ShoppingCart, MessageCircle, BadgeDollarSign } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data);
        setError("");
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  async function handleContactFarmer() {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/messages?conversation=${res.data._id}`);
    } catch (err) {
      console.error("Contact farmer error:", err);
      alert("Failed to start conversation. Please try again.");
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-earth-50 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-earth-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-600 mb-4">{error || "Product not found"}</p>
            <Link
              to={isLoggedIn ? (user?.role === "farmer" ? "/farmer" : "/trader") : "/"}
              className="text-sage-600 hover:text-sage-800 font-medium"
            >
              Go back
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white rounded-2xl border border-sage-100 shadow-soft overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-sage-50 flex items-center justify-center p-8 min-h-[400px]">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="max-w-full max-h-[400px] object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-10 h-10 text-sage-300" />
                    </div>
                    <p className="text-sage-400">No image</p>
                  </div>
                )}
              </div>

              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 text-xs font-medium bg-sage-100 text-sage-700 rounded-full capitalize">
                    {product.category}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    product.status === "active" 
                      ? "bg-sage-100 text-sage-700" 
                      : "bg-earth-100 text-earth-600"
                  }`}>
                    {product.status}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-sage-900 mb-4">{product.title}</h1>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-sage-900">{product.price_per_unit}</span>
                    <span className="text-lg text-sage-500">EGP/{product.unit}</span>
                  </div>
                </div>

                <div className="py-5 border-y border-sage-100 mb-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-sage-500 mb-1">Available</p>
                      <p className="font-semibold text-sage-900">{product.quantity} {product.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-sage-500 mb-1">Total Value</p>
                      <p className="font-semibold text-sage-900">{(product.quantity * product.price_per_unit).toLocaleString()} EGP</p>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-sage-700 mb-2">Description</h3>
                    <p className="text-sage-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-sage-700 mb-2">Farmer</h3>
                  <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                    <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sage-900">{product.farmer_id?.name || "Unknown"}</p>
                      {product.farmer_id?.email && (
                        <p className="text-sm text-sage-500">{product.farmer_id.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {product.status === "active" && user?.role === "trader" && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowOrderModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-sage-600 text-white py-3 rounded-xl font-medium hover:bg-sage-700 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Place Order
                    </button>
                    <button
                      onClick={() => setShowNegotiateModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-honey-500 text-white py-3 rounded-xl font-medium hover:bg-honey-600 transition-colors"
                    >
                      <BadgeDollarSign className="w-5 h-5" />
                      Negotiate Price
                    </button>
                    <button
                      onClick={handleContactFarmer}
                      className="w-full flex items-center justify-center gap-2 border border-sage-200 text-sage-700 py-3 rounded-xl font-medium hover:bg-sage-50 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message Farmer
                    </button>
                  </div>
                )}

                {user?.role === "farmer" && product.farmer_id?._id === user.id && (
                  <div className="p-4 bg-sage-50 rounded-xl border border-sage-100">
                    <p className="text-sm text-sage-700">
                      This is your product listing. You can manage it from your dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <PlaceOrderModal
            product={product}
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
          />

          <NegotiatePriceModal
            product={product}
            isOpen={showNegotiateModal}
            onClose={() => setShowNegotiateModal(false)}
          />
        </div>
      </div>
    </>
  );
}
