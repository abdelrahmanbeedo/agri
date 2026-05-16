import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { X, Package, AlertCircle } from "lucide-react";

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

  return (
    <div className="modal-overlay" onClick={onClose} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.placeOrder.title')}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>
        <div className="modal-body">
          <div className="p-4 bg-sage-50/60 rounded-xl mb-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center shrink-0 border border-sage-100">
                <Package className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{product.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{Number(product.price_per_unit).toLocaleString()} EGP per {product.unit}</p>
                <p className="text-sm text-gray-400">{t('modals.placeOrder.available')}: {maxQuantity.toLocaleString()} {product.unit}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="label">{t('modals.placeOrder.quantity')} ({product.unit})</label>
              <input type="number" min="1" max={maxQuantity} value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))} className="input" required />
              <p className="text-xs text-gray-400 mt-1.5">{t('modals.placeOrder.maximum')}: {maxQuantity.toLocaleString()} {product.unit}</p>
            </div>
            <div>
              <label className="label">{t('modals.placeOrder.deliveryAddress')}</label>
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                className="input resize-none" rows="2" placeholder={t('modals.placeOrder.deliveryPlaceholder')} />
            </div>
            <div>
              <label className="label">{t('modals.placeOrder.notes')}</label>
              <textarea value={buyerNotes} onChange={(e) => setBuyerNotes(e.target.value)}
                className="input resize-none" rows="2" placeholder={t('modals.placeOrder.notesPlaceholder')} />
            </div>

            <div className="p-4 bg-honey-50 rounded-xl border border-honey-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{t('modals.placeOrder.total')}</span>
                <span className="text-2xl font-bold text-gray-900">{totalPrice} EGP</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{quantity} {product.unit} × {product.price_per_unit} EGP</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">{t('common.cancel')}</button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? t('modals.placeOrder.placing') : t('modals.placeOrder.placeOrder')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
