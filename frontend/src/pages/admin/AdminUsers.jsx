import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Navbar from '../../components/Navbar';
import { Users, Search, Trash2, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const { token } = useAuth();
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (search) params.set('search', search);
      const res = await axios.get(`${API_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Admin users error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
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
            <Users className="w-6 h-6 text-sage-600" />
            <h1 className="text-2xl font-bold text-sage-900">{t('admin.users')}</h1>
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-sage-200 rounded-xl"
            >
              <option value="all">{t('admin.role')}: {t('common.all')}</option>
              <option value="farmer">{t('auth.farmer')}</option>
              <option value="trader">{t('auth.trader')}</option>
              <option value="admin">Admin</option>
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
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('auth.name')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('auth.email')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.role')}</th>
                    <th className="text-left p-4 text-sm font-medium text-sage-700">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-sage-50 hover:bg-sage-50/50">
                      <td className="p-4 text-sm text-sage-900 font-medium">{u.name}</td>
                      <td className="p-4 text-sm text-sage-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === 'farmer' ? 'bg-sage-50 text-sage-700' : u.role === 'trader' ? 'bg-honey-50 text-honey-700' : 'bg-blue-50 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(u._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t('admin.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center py-8 text-sage-400">{t('admin.noData')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
