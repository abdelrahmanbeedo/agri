import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Package, ArrowUpDown, Check, X, Clock, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Orders() {
  const { t, isRTL } = useLanguage();
  const STATUS_CONFIG = {
    pending: { bg: "bg-honey-50", text: "text-honey-700", border: "border-honey-200", label: t('orders.pending') },
    accepted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: t('orders.accepted') },
    rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: t('orders.rejected') },
    completed: { bg: "bg-sage-50", text: "text-sage-700", border: "border-sage-200", label: t('orders.completed') },
    cancelled: { bg: "bg-earth-100", text: "text-earth-600", border: "border-earth-200", label: t('orders.cancelled') },
  };
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter, statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") {
        params.role = filter;
      }

      const res = await axios.get(`${API_URL}/api/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      let filtered = res.data;
      if (statusFilter !== "all") {
        filtered = filtered.filter(order => order.status === statusFilter);
      }

      setOrders(filtered);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(orderId, status) {
    if (!window.confirm(`${t('orders.confirmStatus')} ${status} ${t('orders.thisOrder')}`)) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOrders();
    } catch (err) {
      console.error("Update order status error:", err);
      alert(err.response?.data?.msg || t('orders.updateFailed'));
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-earth-50 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-sage-900">{t('orders.orders')}</h1>
            <p className="text-sage-600 mt-1">{t('orders.manageOrders')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-sage-100 p-5 mb-6 shadow-soft">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-sage-700 mb-2">{t('orders.viewAs')}</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="all">{t('orders.allOrders')}</option>
                  <option value="buyer">{t('orders.myPurchases')}</option>
                  <option value="seller">{t('orders.mySales')}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-sage-700 mb-2">{t('orders.status')}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
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
            <div className="bg-white rounded-2xl border border-sage-100 p-12 text-center">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-sage-400" />
              </div>
              <h3 className="text-lg font-medium text-sage-900 mb-2">{t('orders.noOrders')}</h3>
              <p className="text-sage-500">{t('orders.noOrdersDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const isBuyer = order.buyer_id._id === user.id;
                
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-sage-100 p-5 hover:border-sage-200 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Link
                            to={`/products/${order.product_id._id}`}
                            className="font-semibold text-sage-900 hover:text-sage-700"
                          >
                            {order.product_id.title}
                          </Link>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-sage-600 mb-2">
                          {isBuyer ? `${t('orders.seller')} ${order.seller_id.name}` : `${t('orders.buyer')} ${order.buyer_id.name}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-sage-500">
                            {order.quantity} {order.product_id.unit} × {order.unit_price} EGP
                          </span>
                          <span className="text-sage-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          {order.delivery_address && (
                            <span className="text-sage-500 truncate max-w-[200px]">{order.delivery_address}</span>
                          )}
                        </div>
                        {order.buyer_notes && (
                          <p className="text-sm text-sage-500 mt-2 italic">"{order.buyer_notes}"</p>
                        )}
                      </div>
                      <div className="flex lg:flex-col items-center lg:items-end gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-sage-900">{order.total_price.toLocaleString()} EGP</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/orders/${order._id}`}
                            className="px-4 py-2 text-sage-700 border border-sage-200 rounded-xl text-sm font-medium hover:bg-sage-50 transition-colors"
                          >
                            {t('orders.view')}
                          </Link>
                          {order.status === "pending" && order.seller_id._id === user.id && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order._id, "accepted")}
                                className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-colors"
                              >
                                <Check className="w-4 h-4" /> {t('orders.accept')}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order._id, "rejected")}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" /> {t('orders.reject')}
                              </button>
                            </>
                          )}
                          {order.status === "pending" && order.buyer_id._id === user.id && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, "cancelled")}
                              className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                              <X className="w-4 h-4" /> {t('orders.cancel')}
                            </button>
                          )}
                          {order.status === "accepted" && order.seller_id._id === user.id && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, "completed")}
                              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-colors"
                            >
                              <Check className="w-4 h-4" /> {t('orders.complete')}
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
    </>
  );
}
