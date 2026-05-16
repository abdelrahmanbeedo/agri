import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Star, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ReviewForm({ productId, orderId, onClose, onSubmit }) {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/reviews`, { product_id: productId, order_id: orderId, rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSubmit();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-sage-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-sage-900">{t('review.leaveReview')}</h2>
          <button onClick={onClose} className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-sage-600 mb-3">{t('review.rating')}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-honey-500 fill-honey-500' : 'text-sage-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">{t('review.comment')}</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder={t('review.commentPlaceholder')} rows={3}
              className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-honey-500 text-white rounded-xl font-medium hover:bg-honey-600 disabled:opacity-50 transition-colors">
            {loading ? '...' : t('review.submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
}
