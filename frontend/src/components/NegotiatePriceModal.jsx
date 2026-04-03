import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { X, Package, AlertCircle, BadgeDollarSign } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NegotiatePriceModal({ product, isOpen, onClose }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [proposedPrice, setProposedPrice] = useState(product?.price_per_unit || "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const maxQuantity = product.quantity;

  async function handleSendNegotiation(e) {
    e.preventDefault();
    setError("");

    if (!proposedPrice || Number(proposedPrice) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (quantity > maxQuantity || quantity <= 0) {
      setError(`Quantity must be between 1 and ${maxQuantity} ${product.unit}`);
      return;
    }

    setLoading(true);
    try {
      const convRes = await axios.post(
        `${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const negotiationText = `Price Negotiation Offer:\n\n` +
        `Product: ${product.title}\n` +
        `Proposed Price: ${proposedPrice} EGP per ${product.unit}\n` +
        `Quantity: ${quantity} ${product.unit}\n` +
        `Total: ${(Number(proposedPrice) * quantity).toLocaleString()} EGP\n\n` +
        (message ? `Message: ${message}` : "Interested in negotiating the price.");

      await axios.post(
        `${API_URL}/api/messages/conversation/${convRes.data._id}/message`,
        { content: negotiationText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onClose();
      navigate(`/messages?conversation=${convRes.data._id}`);
    } catch (err) {
      console.error("Negotiation error:", err);
      setError(err.response?.data?.msg || "Failed to send negotiation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentTotal = (product.price_per_unit * quantity).toLocaleString();
  const proposedTotal = (Number(proposedPrice || 0) * quantity).toLocaleString();
  const discount = product.price_per_unit - Number(proposedPrice || 0);
  const discountPercent = ((discount / product.price_per_unit) * 100).toFixed(1);
  const hasDiscount = proposedPrice && Number(proposedPrice) < product.price_per_unit;

  return (
    <div className="fixed inset-0 bg-sage-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-sage-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-honey-100 rounded-lg flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5 text-honey-600" />
            </div>
            <h2 className="text-lg font-bold text-sage-900">Negotiate Price</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="p-4 bg-sage-50 rounded-xl mb-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-sage-500" />
              </div>
              <div>
                <p className="font-semibold text-sage-900">{product.title}</p>
                <p className="text-sm text-sage-600 mt-0.5">
                  Current: <span className="font-semibold">{product.price_per_unit} EGP/{product.unit}</span>
                </p>
                <p className="text-sm text-sage-500">Available: {maxQuantity} {product.unit}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSendNegotiation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Your Offer (EGP per {product.unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
              {hasDiscount && (
                <p className="text-sm text-honey-600 mt-1.5 flex items-center gap-1">
                  <span>{discountPercent}% below asking price</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Quantity ({product.unit})
              </label>
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
                rows="3"
                placeholder="Add a message to your offer..."
              />
            </div>

            <div className="p-4 bg-sage-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-sage-600">Original Total:</span>
                <span className="font-medium text-sage-900">{currentTotal} EGP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sage-600">Your Offer:</span>
                <span className={`font-semibold ${hasDiscount ? 'text-honey-600' : 'text-sage-900'}`}>
                  {proposedTotal} EGP
                </span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-sm pt-2 border-t border-sage-200">
                  <span className="text-sage-600">Your Savings:</span>
                  <span className="font-semibold text-honey-600">
                    {((product.price_per_unit - Number(proposedPrice)) * quantity).toLocaleString()} EGP
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-honey-500 text-white rounded-xl font-medium hover:bg-honey-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
