import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PlaceOrderModal({ product, isOpen, onClose }) {
  const { user, token } = useAuth();
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Place Order</h2>
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
            {product.price_per_unit} EGP per {product.unit}
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

        <form onSubmit={handlePlaceOrder} className="space-y-4">
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
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {maxQuantity} {product.unit}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address (Optional)
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows="3"
              placeholder="Enter delivery address..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows="3"
              placeholder="Any special instructions or notes..."
            />
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                {totalPrice} EGP
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {quantity} {product.unit} × {product.price_per_unit} EGP
            </p>
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
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

