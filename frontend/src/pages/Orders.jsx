import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Package, Check, X, Clock, AlertCircle, ChevronRight, Filter } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STYLES = {
  pending: "badge-warning",
  accepted: "badge-info",
  rejected: "badge-error",
  completed: "badge-success",
  cancelled: "badge-neutral",
};

export default function Orders() {
  const { t, isRTL } = useLanguage();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [filter, statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.role = filter;
      const res = await axios.get(`${API_URL}/api/orders`, { params, headers: { Authorization: `Bearer ${token}` } });
      let filtered = res.data;
      if (statusFilter !== "all") filtered = filtered.filter(o => o.status === statusFilter);
      setOrders(filtered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleUpdateStatus(orderId, status) {
    if (!window.confirm(`${t('orders.confirmStatus')} ${status} ${t('orders.thisOrder')}`)) return;
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status },
        { headers: { Authorization: `Bearer ${token}` } });
      fetchOrders();
    } catch (err) { alert(err.response?.data?.msg || t('orders.updateFailed')); }
  }

  if (loading) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-sage-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-container">
        <div className="page-header">
          <h1>{t('orders.orders')}</h1>
          <p>{t('orders.manageOrders')}</p>
        </div>

        <div className="card p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="label">{t('orders.viewAs')}</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select">
                <option value="all">{t('orders.allOrders')}</option>
                <option value="buyer">{t('orders.myPurchases')}</option>
                <option value="seller">{t('orders.mySales')}</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="label">{t('orders.status')}</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
                <option value="all">{t('orders.allStatuses')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="accepted">{t('orders.accepted')}</option>
                <option value="rejected">{t('orders.rejected')}</option>
                <option value="completed">{t('orders.completed')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state card p-16">
            <Package className="w-12 h-12 text-gray-300" />
            <h3>{t('orders.noOrders')}</h3>
            <p>{t('orders.noOrdersDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const isBuyer = order.buyer_id._id === user.id;
              return (
                <div key={order._id} className="card p-5 animate-slideUp" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link to={`/products/${order.product_id._id}`}
                          className="font-semibold text-gray-900 hover:text-sage-700 transition-colors truncate">
                          {order.product_id.title}
                        </Link>
                        <span className={`badge shrink-0 ${STATUS_STYLES[order.status] || 'badge-neutral'}`}>
                          {t(`orders.${order.status}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {isBuyer
                          ? `${t('orders.seller')} ${order.seller_id.name}`
                          : `${t('orders.buyer')} ${order.buyer_id.name}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>{order.quantity.toLocaleString()} {order.product_id.unit} &times; {Number(order.unit_price).toLocaleString()} EGP</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        {order.delivery_address && <span className="truncate max-w-[200px]">{order.delivery_address}</span>}
                      </div>
                      {order.buyer_notes && <p className="text-sm text-gray-400 mt-2 italic truncate">&ldquo;{order.buyer_notes}&rdquo;</p>}
                    </div>
                    <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:min-w-[180px]">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{Number(order.total_price).toLocaleString()} EGP</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                          {t('orders.view')}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        {order.status === "pending" && order.seller_id._id === user.id && (
                          <>
                            <button onClick={() => handleUpdateStatus(order._id, "accepted")}
                              className="btn btn-sm bg-sage-600 text-white hover:bg-sage-700 border-none shadow-sm">
                              <Check className="w-3.5 h-3.5" /> {t('orders.accept')}
                            </button>
                            <button onClick={() => handleUpdateStatus(order._id, "rejected")}
                              className="btn btn-sm bg-red-600 text-white hover:bg-red-700 border-none shadow-sm">
                              <X className="w-3.5 h-3.5" /> {t('orders.reject')}
                            </button>
                          </>
                        )}
                        {order.status === "pending" && order.buyer_id._id === user.id && (
                          <button onClick={() => handleUpdateStatus(order._id, "cancelled")}
                            className="btn btn-sm btn-danger">
                            <X className="w-3.5 h-3.5" /> {t('orders.cancel')}
                          </button>
                        )}
                        {order.status === "accepted" && order.seller_id._id === user.id && (
                          <button onClick={() => handleUpdateStatus(order._id, "completed")}
                            className="btn btn-sm bg-sage-600 text-white hover:bg-sage-700 border-none shadow-sm">
                            <Check className="w-3.5 h-3.5" /> {t('orders.complete')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
