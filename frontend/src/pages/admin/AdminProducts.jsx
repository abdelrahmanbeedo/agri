import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Navbar from '../../components/Navbar';
import { Package, Search, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminProducts() {
  const { token } = useAuth();
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, search]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await axios.get(`${API_URL}/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.products);
    } catch (err) {
      console.error('Admin products error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId) {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await axios.delete(`${API_URL}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-sage-600" />
            <h1 className="text-2xl font-bold text-sage-900">{t('admin.products')}</h1>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.search')}
                className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-sage-200 rounded-xl"
            >
              <option value="all">{t('admin.status')}: {t('common.all')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="sold">Sold</option>
              <option value="removed">Removed</option>
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
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Farmer</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.status')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">Price</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-sage-50 hover:bg-sage-50/50">
                      <td className="p-4 text-sm text-sage-900 font-medium">{p.title}</td>
                      <td className="p-4 text-sm text-sage-600">{p.farmer_id?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-50 text-green-700' : p.status === 'sold' ? 'bg-sage-50 text-sage-600' : 'bg-red-50 text-red-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-sage-900">{p.price_per_unit} EGP/{p.unit}</td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t('admin.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <p className="text-center py-8 text-sage-400">{t('admin.noData')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
