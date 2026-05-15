import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Navbar from '../../components/Navbar';
import { Zap, Clock, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminNegotiations() {
  const { token } = useAuth();
  const { t, isRTL } = useLanguage();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchNegotiations();
  }, [statusFilter]);

  async function fetchNegotiations() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await axios.get(`${API_URL}/api/admin/negotiations?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNegotiations(res.data.negotiations);
    } catch (err) {
      console.error('Admin negotiations error:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-sage-600" />
            <h1 className="text-2xl font-bold text-sage-900">{t('admin.negotiations')}</h1>
          </div>

          <div className="flex gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-sage-200 rounded-xl"
            >
              <option value="all">{t('admin.status')}: {t('common.all')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="accepted">{t('negotiation.dealMade')}</option>
              <option value="rejected">{t('negotiation.declined')}</option>
              <option value="expired">{t('negotiation.expired')}</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sage-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-100 bg-sage-50">
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Farmer</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Trader</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('negotiation.round')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.status')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {negotiations.map((neg) => (
                    <tr key={neg._id} className="border-b border-sage-50 hover:bg-sage-50/50">
                      <td className="p-4 text-sm text-sage-900 font-medium">{neg.product_id?.title || 'N/A'}</td>
                      <td className="p-4 text-sm text-sage-600">{neg.farmer_id?.name || 'N/A'}</td>
                      <td className="p-4 text-sm text-sage-600">{neg.trader_id?.name || 'N/A'}</td>
                      <td className="p-4 text-sm text-sage-900">{neg.current_round}/{neg.max_rounds}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          neg.status === 'active' ? 'bg-honey-50 text-honey-700' :
                          neg.status === 'accepted' ? 'bg-green-50 text-green-700' :
                          neg.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-sage-50 text-sage-600'
                        }`}>
                          {neg.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link to={`/negotiation/${neg._id}`} className="px-3 py-1.5 bg-sage-600 text-white text-xs rounded-lg hover:bg-sage-700">
                          {t('admin.view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {negotiations.length === 0 && (
                <p className="text-center py-8 text-sage-400">{t('admin.noData')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
