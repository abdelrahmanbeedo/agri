import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { X, AlertCircle, Minus, Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PlaceOrderModal({ product, isOpen, onClose }) {
  const { t, isRTL } = useLanguage();
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
    if (quantity > maxQuantity) { setError(`${t('modals.placeOrder.maxQuantityError')} ${maxQuantity} ${product.unit}`); return; }
    if (quantity <= 0) { setError(t('modals.placeOrder.quantityPositive')); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/orders`,
        { product_id: product._id, quantity: Number(quantity), delivery_address: deliveryAddress, buyer_notes: buyerNotes },
        { headers: { Authorization: `Bearer ${token}` } });
      onClose();
      navigate(`/orders/${res.data._id}`);
    } catch (err) { setError(err.response?.data?.msg || t('modals.placeOrder.failedOrder')); }
    finally { setLoading(false); }
  }

  const totalPrice = (product.price_per_unit * quantity).toLocaleString();

  const decQty = () => setQuantity(Math.max(1, quantity - 1));
  const incQty = () => setQuantity(Math.min(maxQuantity, quantity + 1));

  return (
    <div className="modal-overlay" onClick={onClose} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-lg font-semibold">{product.title}</h2>
            <p className="text-sm text-gray-500">{product.price_per_unit.toLocaleString()} EGP / {product.unit}</p>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-5">
            {/* Quantity stepper */}
            <div>
              <label className="label">{t('modals.placeOrder.quantity')} ({product.unit})</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={decQty} disabled={quantity <= 1}
                  className="w-12 h-12 flex items-center justify-center rounded-xl border border-sage-200 text-gray-600 hover:bg-sage-50 disabled:opacity-30 transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <input type="number" min="1" max={maxQuantity} value={quantity}
                  onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value) || 1)))}
                  className="input text-center text-xl font-bold w-24" required />
                <button type="button" onClick={incQty} disabled={quantity >= maxQuantity}
                  className="w-12 h-12 flex items-center justify-center rounded-xl border border-sage-200 text-gray-600 hover:bg-sage-50 disabled:opacity-30 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{t('modals.placeOrder.available')}: {maxQuantity.toLocaleString()} {product.unit}</p>
            </div>

            {/* Optional fields */}
            <details className="group">
              <summary className="text-sm font-medium text-sage-600 cursor-pointer py-1 select-none list-none flex items-center gap-1.5">
                <span className="group-open:rotate-90 transition-transform text-lg">▶</span>
                {t('modals.placeOrder.deliveryAddress')}
              </summary>
              <div className="mt-3 space-y-3">
                <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="input resize-none" rows="2" placeholder={t('modals.placeOrder.deliveryPlaceholder')} />
                <textarea value={buyerNotes} onChange={(e) => setBuyerNotes(e.target.value)}
                  className="input resize-none" rows="2" placeholder={t('modals.placeOrder.notesPlaceholder')} />
              </div>
            </details>

            {/* Total */}
            <div className="p-4 bg-honey-50 rounded-xl border border-honey-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{t('modals.placeOrder.total')}</span>
                <span className="text-2xl font-bold text-gray-900">{totalPrice} EGP</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{quantity} {product.unit} × {product.price_per_unit.toLocaleString()} EGP</p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
              {loading ? t('modals.placeOrder.placing') : t('modals.placeOrder.placeOrder')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
