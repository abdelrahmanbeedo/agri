import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PlaceOrderModal from "../components/PlaceOrderModal";
import NegotiatePriceModal from "../components/NegotiatePriceModal";

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Product not found"}</p>
            <Link
              to={isLoggedIn ? (user?.role === "farmer" ? "/farmer" : "/trader") : "/"}
              className="text-green-600 hover:underline"
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-green-600 flex items-center"
          >
            ← Back
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Product Image Section */}
              <div className="md:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="max-w-full max-h-96 object-contain rounded"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🌾</div>
                    <p>No image available</p>
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="md:w-1/2 p-8">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full capitalize">
                    {product.category}
                  </span>
                  <span className={`ml-2 inline-block px-3 py-1 text-xs rounded-full capitalize ${
                    product.status === "active" 
                      ? "bg-blue-100 text-blue-800" 
                      : product.status === "sold"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {product.status}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    {product.price_per_unit} EGP
                  </p>
                  <p className="text-gray-600">per {product.unit}</p>
                </div>

                <div className="border-t border-b py-6 my-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Available Quantity</p>
                      <p className="text-lg font-semibold">
                        {product.quantity} {product.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Value</p>
                      <p className="text-lg font-semibold">
                        {(product.quantity * product.price_per_unit).toLocaleString()} EGP
                      </p>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Farmer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{product.farmer_id?.name || "Unknown"}</p>
                    {product.farmer_id?.email && (
                      <p className="text-sm text-gray-600 mt-1">{product.farmer_id.email}</p>
                    )}
                  </div>
                </div>

                {product.status === "active" && user?.role === "trader" && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowOrderModal(true)}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition text-lg"
                    >
                      📦 Place Order
                    </button>
                    <button
                      onClick={() => setShowNegotiateModal(true)}
                      className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition text-lg"
                    >
                      💰 Negotiate Price
                    </button>
                    <button
                      onClick={handleContactFarmer}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
                    >
                      💬 Message Farmer
                    </button>
                  </div>
                )}

                {user?.role === "farmer" && product.farmer_id?._id === user.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
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

  async function handleContactFarmer() {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Create or get conversation with farmer
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Navigate to messages page with conversation selected
      navigate(`/messages?conversation=${res.data._id}`);
    } catch (err) {
      console.error("Contact farmer error:", err);
      alert("Failed to start conversation. Please try again.");
    }
  }
}

