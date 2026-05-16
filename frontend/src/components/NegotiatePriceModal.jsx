import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { X, Package, AlertCircle, BadgeDollarSign } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NegotiatePriceModal({ product, isOpen, onClose }) {
  const { token } = useAuth();
  const { t, isRTL } = useLanguage();
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
    if (!proposedPrice || Number(proposedPrice) <= 0) { setError(t('modals.negotiatePrice.validPrice')); return; }
    if (quantity > maxQuantity || quantity <= 0) { setError(t('modals.negotiatePrice.quantityRange').replace('{max}', maxQuantity).replace('{unit}', product.unit)); return; }
    setLoading(true);
    try {
      const convRes = await axios.post(`${API_URL}/api/messages/conversation/${product.farmer_id._id}`,
        { product_id: product._id }, { headers: { Authorization: `Bearer ${token}` } });
      const negotiationText = `Price Negotiation Offer:\n\nProduct: ${product.title}\nProposed Price: ${proposedPrice} EGP per ${product.unit}\nQuantity: ${quantity} ${product.unit}\nTotal: ${(Number(proposedPrice) * quantity).toLocaleString()} EGP\n\n${message ? `Message: ${message}` : "Interested in negotiating the price."}`;
      await axios.post(`${API_URL}/api/messages/conversation/${convRes.data._id}/message`,
        { content: negotiationText }, { headers: { Authorization: `Bearer ${token}` } });
      onClose(); navigate(`/messages?conversation=${convRes.data._id}`);
    } catch (err) { setError(err.response?.data?.msg || t('modals.negotiatePrice.failedSend')); }
    finally { setLoading(false); }
  }

  const currentTotal = (product.price_per_unit * quantity).toLocaleString();
  const proposedTotal = (Number(proposedPrice || 0) * quantity).toLocaleString();
  const discount = product.price_per_unit - Number(proposedPrice || 0);
  const discountPercent = ((discount / product.price_per_unit) * 100).toFixed(1);
  const hasDiscount = proposedPrice && Number(proposedPrice) < product.price_per_unit;

  return (
    <div className="modal-overlay" onClick={onClose} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-honey-100 rounded-lg flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5 text-honey-600" />
            </div>
            <h2>{t('modals.negotiatePrice.title')}</h2>
          </div>
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
                <p className="text-sm text-gray-500 mt-0.5">{t('modals.negotiatePrice.current')} <span className="font-semibold">{Number(product.price_per_unit).toLocaleString()} EGP/{product.unit}</span></p>
                <p className="text-sm text-gray-400">{t('modals.negotiatePrice.available')} {maxQuantity.toLocaleString()} {product.unit}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendNegotiation} className="space-y-4">
            <div>
              <label className="label">{t('modals.negotiatePrice.yourOffer').replace('{unit}', product.unit)}</label>
              <input type="number" step="0.01" min="0" value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)} className="input" required />
              {hasDiscount && <p className="text-sm text-honey-600 mt-1.5">{discountPercent}{t('modals.negotiatePrice.belowAsking')}</p>}
            </div>
            <div>
              <label className="label">{t('modals.negotiatePrice.quantity').replace('{unit}', product.unit)}</label>
              <input type="number" min="1" max={maxQuantity} value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))} className="input" required />
            </div>
            <div>
              <label className="label">{t('modals.negotiatePrice.message')}</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                className="input resize-none" rows="3" placeholder={t('modals.negotiatePrice.messagePlaceholder')} />
            </div>

            <div className="p-4 bg-sage-50/60 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('modals.negotiatePrice.originalTotal')}</span>
                <span className="font-medium text-gray-900">{currentTotal} EGP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('modals.negotiatePrice.yourOfferLabel')}</span>
                <span className={`font-semibold ${hasDiscount ? 'text-honey-600' : 'text-gray-900'}`}>{proposedTotal} EGP</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500">{t('modals.negotiatePrice.yourSavings')}</span>
                  <span className="font-semibold text-honey-600">{((product.price_per_unit - Number(proposedPrice)) * quantity).toLocaleString()} EGP</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">{t('common.cancel')}</button>
              <button type="submit" disabled={loading} className="btn flex-1 bg-gradient-to-r from-honey-500 to-honey-600 text-white hover:from-honey-600 hover:to-honey-700 border-none shadow-sm">
                {loading ? t('modals.negotiatePrice.sending') : t('modals.negotiatePrice.sendOffer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
