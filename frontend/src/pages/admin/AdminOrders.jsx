import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ShoppingCart, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOrders() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await axios.get(`${API_URL}/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Admin orders error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, newStatus) {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  }

  return (
      <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-sage-600" />
            <h1 className="text-2xl font-bold text-sage-900">{t('admin.orders')}</h1>
          </div>

          <div className="flex gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-sage-200 rounded-xl"
            >
              <option value="all">{t('admin.status')}: {t('common.all')}</option>
              <option value="pending">{t('admin.pendingOrders')}</option>
              <option value="accepted">Accepted</option>
              <option value="completed">{t('admin.completedOrders')}</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-100 bg-sage-50">
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Buyer</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Seller</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Total</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.status')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-sage-50 hover:bg-sage-50/50">
                      <td className="p-4 text-sm text-sage-900 font-medium">{order.product_id?.title || 'N/A'}</td>
                      <td className="p-4 text-sm text-sage-600">{order.buyer_id?.name || 'N/A'}</td>
                      <td className="p-4 text-sm text-sage-600">{order.seller_id?.name || 'N/A'}</td>
                      <td className="p-4 text-sm text-sage-900">{order.total_price} EGP</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed' ? 'bg-green-50 text-green-700' :
                          order.status === 'pending' ? 'bg-honey-50 text-honey-700' :
                          order.status === 'accepted' ? 'bg-blue-50 text-blue-700' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-sage-50 text-sage-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="px-2 py-1 border border-sage-200 rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p className="text-center py-8 text-sage-400">{t('admin.noData')}</p>
              )}
            </div>
          )}
        </div>
      </div>
  );
}
