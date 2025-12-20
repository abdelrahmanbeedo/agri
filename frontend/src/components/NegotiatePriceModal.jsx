import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NegotiatePriceModal({ product, isOpen, onClose }) {
  const { user, token } = useAuth();
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
      // Create or get conversation
      const convRes = await axios.post(
        `${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Send negotiation message
      const negotiationText = `💰 Price Negotiation Offer:\n\n` +
        `Product: ${product.title}\n` +
        `Proposed Price: ${proposedPrice} EGP per ${product.unit}\n` +
        `Quantity: ${quantity} ${product.unit}\n` +
        `Total: ${(Number(proposedPrice) * quantity).toLocaleString()} EGP\n\n` +
        (message ? `Message: ${message}` : "Interested in negotiating the price.");

      await axios.post(
        `${API_URL}/api/messages/conversation/${convRes.data._id}/message`,
        { content: negotiationText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Negotiate Price</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded">
          <p className="font-semibold text-gray-900">{product.title}</p>
          <p className="text-sm text-gray-600">
            Current Price: <span className="font-semibold">{product.price_per_unit} EGP/{product.unit}</span>
          </p>
          <p className="text-sm text-gray-600">
            Available: {maxQuantity} {product.unit}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSendNegotiation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposed Price per {product.unit} (EGP)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            {proposedPrice && Number(proposedPrice) < product.price_per_unit && (
              <p className="text-xs text-green-600 mt-1">
                You're asking for {discountPercent}% discount ({discount.toFixed(2)} EGP less per {product.unit})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({product.unit})
            </label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows="3"
              placeholder="Add any additional notes or reasons for negotiation..."
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Total:</span>
              <span className="font-semibold">{currentTotal} EGP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Proposed Total:</span>
              <span className="font-semibold text-green-600">{proposedTotal} EGP</span>
            </div>
            {proposedPrice && Number(proposedPrice) < product.price_per_unit && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Potential Savings:</span>
                <span className="font-semibold text-green-600">
                  {((product.price_per_unit - Number(proposedPrice)) * quantity).toLocaleString()} EGP
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Send Negotiation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

