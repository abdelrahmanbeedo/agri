import { useLanguage } from '../i18n/LanguageContext';
import { Star, User, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ReviewList({ reviews, onDelete }) {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  async function handleDelete(reviewId) {
    if (!window.confirm(t('review.deleteReview'))) return;
    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(reviewId);
    } catch (err) {
      console.error('Delete review error:', err);
    }
  }

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="p-4 bg-sage-50 rounded-xl border border-sage-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sage-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-sage-500" />
              </div>
              <div>
                <p className="font-medium text-sage-900 text-sm">{review.reviewer_id?.name || 'Unknown'}</p>
                <p className="text-xs text-sage-400">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {review.reviewer_id?._id === user?.id && (
              <button onClick={() => handleDelete(review._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-honey-500 fill-honey-500' : 'text-sage-200'}`} />
            ))}
          </div>
          {review.comment && <p className="text-sm text-sage-700">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}
