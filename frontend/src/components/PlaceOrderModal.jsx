import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { X, Package, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PlaceOrderModal({ product, isOpen, onClose }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const maxQuantity = product.quantity;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (quantity > maxQuantity) {
      setError(`Maximum quantity available: ${maxQuantity} ${product.unit}`);
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/orders`,
        {
          product_id: product._id,
          quantity: Number(quantity),
          delivery_address: deliveryAddress,
          buyer_notes: buyerNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onClose();
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.response?.data?.msg || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const totalPrice = (product.price_per_unit * quantity).toLocaleString();

  return (
    <div className="fixed inset-0 bg-sage-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-sage-100">
          <h2 className="text-lg font-bold text-sage-900">Place Order</h2>
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
                  {product.price_per_unit} EGP per {product.unit}
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

          <form onSubmit={handlePlaceOrder} className="space-y-4">
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
              <p className="text-xs text-sage-500 mt-1.5">Maximum: {maxQuantity} {product.unit}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Delivery Address (Optional)
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
                rows="2"
                placeholder="Enter delivery address..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
                rows="2"
                placeholder="Any special instructions..."
              />
            </div>

            <div className="p-4 bg-honey-50 rounded-xl border border-honey-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sage-700">Total</span>
                <span className="text-2xl font-bold text-sage-900">{totalPrice} EGP</span>
              </div>
              <p className="text-sm text-sage-500 mt-1">
                {quantity} {product.unit} × {product.price_per_unit} EGP
              </p>
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
                className="flex-1 px-4 py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Placing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
