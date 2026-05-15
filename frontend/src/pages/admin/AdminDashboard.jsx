import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Navbar from '../../components/Navbar';
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { token } = useAuth();
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
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

  const cards = [
    { label: t('admin.totalUsers'), value: stats?.users?.total || 0, icon: Users, color: 'bg-blue-50 text-blue-600', sub: `${stats?.users?.farmers || 0} ${t('admin.farmers')}, ${stats?.users?.traders || 0} ${t('admin.traders')}` },
    { label: t('admin.totalProducts'), value: stats?.products?.total || 0, icon: Package, color: 'bg-sage-50 text-sage-600', sub: `${stats?.products?.active || 0} ${t('admin.activeProducts')}` },
    { label: t('common.orders'), value: stats?.orders?.total || 0, icon: ShoppingCart, color: 'bg-honey-50 text-honey-600', sub: `${stats?.orders?.pending || 0} ${t('admin.pendingOrders')}` },
    { label: t('admin.negotiations'), value: stats?.negotiations?.total || 0, icon: Zap, color: 'bg-purple-50 text-purple-600', sub: `${stats?.negotiations?.active || 0} ${t('admin.activeNegotiations')}` },
    { label: t('common.messages'), value: stats?.messages?.total || 0, icon: MessageSquare, color: 'bg-rose-50 text-rose-600', sub: `${stats?.messages?.unread || 0} ${t('admin.unreadMessages')}` },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="w-8 h-8 text-sage-600" />
            <h1 className="text-2xl font-bold text-sage-900">{t('admin.dashboard')}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sage-100 p-6 hover:shadow-soft transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-sage-900 mb-1">{card.value}</p>
                <p className="text-sm text-sage-600">{card.label}</p>
                <p className="text-xs text-sage-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-sage-100 p-6">
              <h2 className="font-semibold text-sage-900 mb-4">{t('admin.recentOrders')}</h2>
              {stats?.recentOrders?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-sage-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sage-900 text-sm">{order.product_id?.title || 'Order'}</p>
                        <p className="text-xs text-sage-500">{order.buyer_id?.name} → {order.seller_id?.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'completed' ? 'bg-green-50 text-green-700' : order.status === 'pending' ? 'bg-honey-50 text-honey-700' : 'bg-sage-50 text-sage-600'}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sage-400 text-sm">{t('admin.noData')}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-sage-100 p-6">
              <h2 className="font-semibold text-sage-900 mb-4">{t('admin.recentUsers')}</h2>
              {stats?.recentUsers?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-sage-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sage-900 text-sm">{u.name}</p>
                        <p className="text-xs text-sage-500">{u.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === 'farmer' ? 'bg-sage-50 text-sage-700' : u.role === 'trader' ? 'bg-honey-50 text-honey-700' : 'bg-blue-50 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sage-400 text-sm">{t('admin.noData')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
