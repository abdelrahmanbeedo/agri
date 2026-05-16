import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Star, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ReviewForm({ productId, orderId, onClose, onSubmit }) {
  const { t, isRTL } = useLanguage();
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/reviews`, { product_id: productId, order_id: orderId, rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSubmit(); onClose();
    } catch (err) { setError(err.response?.data?.error || 'Failed to submit review'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('review.leaveReview')}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">{t('review.rating')}</p>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-all hover:scale-110">
                    <Star className={`w-9 h-9 ${(hoverRating || rating) >= star
                      ? 'text-honey-500 fill-honey-500 drop-shadow-sm'
                      : 'text-gray-200 hover:text-honey-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{t('review.comment')}</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder={t('review.commentPlaceholder')} rows={3} className="input resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="btn btn-primary btn-lg w-full bg-gradient-to-r from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700 border-none">
              {loading ? t('review.submitting') : t('review.submitReview')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
