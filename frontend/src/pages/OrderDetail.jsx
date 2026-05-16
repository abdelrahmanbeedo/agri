import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { ArrowLeft, Check, X, CreditCard, MapPin, User, Package, Star, Clock } from "lucide-react";
import ReviewForm from "../components/ReviewForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STYLES = {
  pending: "badge-warning", accepted: "badge-info", rejected: "badge-error",
  completed: "badge-success", cancelled: "badge-neutral",
};

export default function OrderDetail() {
  const { t, isRTL } = useLanguage();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => { fetchOrder(); }, [orderId]);

  async function fetchOrder() {
    try {
      const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 403) { alert(t('orderDetail.noPermission')); navigate("/orders"); }
    } finally { setLoading(false); }
  }

  async function handleUpdateStatus(status) {
    if (!window.confirm(`${t('orders.confirmStatus')} ${status} ${t('orders.thisOrder')}`)) return;
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status },
        { headers: { Authorization: `Bearer ${token}` } });
      fetchOrder();
    } catch (err) { alert(err.response?.data?.msg || t('orders.updateFailed')); }
    finally { setActionLoading(false); }
  }

  async function handleCreateTransaction() {
    if (!window.confirm(t('orderDetail.confirmTransaction'))) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/api/orders/${orderId}/transaction`, { payment_method: "cash" },
        { headers: { Authorization: `Bearer ${token}` } });
      fetchOrder();
      alert(t('orderDetail.transactionCreated'));
    } catch (err) { alert(err.response?.data?.msg || t('orderDetail.transactionFailed')); }
    finally { setActionLoading(false); }
  }

  const actionBtn = (loading) => `btn ${loading ? 'opacity-50 pointer-events-none' : ''}`;

  if (loading) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-sage-600 rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <p className="text-gray-500">{t('orderDetail.orderNotFound')}</p>
    </div>
  );

  const isBuyer = order.buyer_id._id === user.id;
  const isSeller = order.seller_id._id === user.id;

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t('orderDetail.backToOrders')}
        </button>

        <div className="card overflow-hidden animate-scaleIn">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('orderDetail.orderDetails')}</h1>
                <span className={`badge mt-2 ${STATUS_STYLES[order.status] || 'badge-neutral'}`}>
                  {t(`orders.${order.status}`)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{Number(order.total_price).toLocaleString()} EGP</p>
                <p className="text-sm text-gray-500">{t('orderDetail.totalAmount')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('orderDetail.product')}</span>
                </div>
                <Link to={`/products/${order.product_id._id}`}
                  className="font-semibold text-gray-900 hover:text-sage-700 transition-colors">
                  {order.product_id.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {order.quantity.toLocaleString()} {order.product_id.unit} &times; {Number(order.unit_price).toLocaleString()} EGP
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{isBuyer ? t('orderDetail.seller') : t('orderDetail.buyer')}</span>
                </div>
                <p className="font-semibold text-gray-900">{isBuyer ? order.seller_id.name : order.buyer_id.name}</p>
                <p className="text-sm text-gray-500">{isBuyer ? order.seller_id.email : order.buyer_id.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>{t('orderDetail.placedOn')} {new Date(order.created_at).toLocaleDateString()}</span>
            </div>

            {order.delivery_address && (
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('orderDetail.deliveryAddress')}</span>
                </div>
                <p className="text-gray-700">{order.delivery_address}</p>
              </div>
            )}

            {order.buyer_notes && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-800 mb-1">{t('orderDetail.buyerNotes')}</p>
                <p className="text-blue-700 text-sm">{order.buyer_notes}</p>
              </div>
            )}

            {order.seller_notes && (
              <div className="p-4 bg-sage-50 rounded-xl border border-sage-100">
                <p className="text-sm font-medium text-sage-800 mb-1">{t('orderDetail.sellerNotes')}</p>
                <p className="text-sage-700 text-sm">{order.seller_notes}</p>
              </div>
            )}

            {order.transaction_id && (
              <div className="p-5 bg-sage-50/60 rounded-xl border border-sage-100">
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold">{t('orderDetail.transaction')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">{t('orderDetail.status')}</p>
                    <p className="font-medium text-gray-900 capitalize">{order.transaction_id.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('orderDetail.paymentMethod')}</p>
                    <p className="font-medium text-gray-900 capitalize">{order.transaction_id.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('orderDetail.amount')}</p>
                    <p className="font-medium text-gray-900">{Number(order.transaction_id.amount).toLocaleString()} EGP</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('orderDetail.created')}</p>
                    <p className="font-medium text-gray-900">{new Date(order.transaction_id.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-sage-100 bg-sage-50/50 flex flex-wrap gap-3">
            {order.status === "pending" && isSeller && (
              <>
                <button onClick={() => handleUpdateStatus("accepted")} disabled={actionLoading}
                  className="btn bg-sage-600 text-white hover:bg-sage-700 border-none shadow-sm">
                  <Check className="w-4 h-4" /> {t('orders.accept')}
                </button>
                <button onClick={() => handleUpdateStatus("rejected")} disabled={actionLoading}
                  className="btn bg-red-600 text-white hover:bg-red-700 border-none shadow-sm">
                  <X className="w-4 h-4" /> {t('orders.reject')}
                </button>
              </>
            )}
            {order.status === "pending" && isBuyer && (
              <button onClick={() => handleUpdateStatus("cancelled")} disabled={actionLoading}
                className="btn btn-danger">
                <X className="w-4 h-4" /> {t('orders.cancel')}
              </button>
            )}
            {order.status === "accepted" && isSeller && (
              <button onClick={() => handleUpdateStatus("completed")} disabled={actionLoading}
                className="btn bg-sage-600 text-white hover:bg-sage-700 border-none shadow-sm">
                <Check className="w-4 h-4" /> {t('orderDetail.markComplete')}
              </button>
            )}
            {order.status === "accepted" && isBuyer && !order.transaction_id && (
              <button onClick={handleCreateTransaction} disabled={actionLoading}
                className="btn bg-sage-600 text-white hover:bg-sage-700 border-none shadow-sm">
                <CreditCard className="w-4 h-4" /> {t('orderDetail.createTransaction')}
              </button>
            )}
            {order.status === "completed" && isBuyer && (
              <button onClick={() => setShowReviewForm(true)}
                className="btn bg-gradient-to-r from-honey-500 to-honey-600 text-white hover:from-honey-600 hover:to-honey-700 border-none shadow-sm">
                <Star className="w-4 h-4" /> {t('review.leaveReview')}
              </button>
            )}
          </div>
        </div>
      </div>
      {showReviewForm && order && (
        <ReviewForm productId={order.product_id?._id} orderId={order._id}
          onClose={() => setShowReviewForm(false)} onSubmit={() => {}} />
      )}
    </div>
  );
}
