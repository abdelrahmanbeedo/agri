import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from '../components/Navbar';
import { User, Mail, Phone, MapPin, Calendar, Lock, Save, Camera, X, Leaf } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
  const { t, isRTL } = useLanguage();
  const { token, user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ name: '', phone: '', location: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setForm({ name: res.data.name, phone: res.data.phone || '', location: res.data.location || '' });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.put(`${API_URL}/api/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      login(res.data, token);
      setEditing(false);
      setSuccess(t('profile.profileUpdated'));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError(t('profile.passwordMismatch'));
      return;
    }

    setPasswordSaving(true);
    try {
      await axios.put(`${API_URL}/api/profile/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(t('profile.passwordChanged'));
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      await axios.put(`${API_URL}/api/profile`, { avatar: res.data.url }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileRes = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileRes.data);
      login(profileRes.data, token);
    } catch (err) {
      setError(t('upload.uploadFailed'));
    } finally {
      setUploading(false);
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
      <div className="min-h-screen bg-earth-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-sage-100 shadow-soft overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative group">
                  <div className="w-20 h-20 bg-sage-100 rounded-full overflow-hidden flex items-center justify-center">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-sage-400" />
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                  {uploading && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-sage-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sage-900">{t('profile.title')}</h1>
                  <p className="text-sage-500 text-sm capitalize">{profile?.role}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm">{success}</div>
              )}

              {!editing ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-sage-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sage-500 text-sm mb-1">
                        <User className="w-4 h-4" /> {t('auth.name')}
                      </div>
                      <p className="text-sage-900 font-medium">{profile?.name}</p>
                    </div>
                    <div className="p-4 bg-sage-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sage-500 text-sm mb-1">
                        <Mail className="w-4 h-4" /> {t('auth.email')}
                      </div>
                      <p className="text-sage-900 font-medium">{profile?.email}</p>
                    </div>
                    <div className="p-4 bg-sage-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sage-500 text-sm mb-1">
                        <Phone className="w-4 h-4" /> {t('profile.phone')}
                      </div>
                      <p className="text-sage-900 font-medium">{profile?.phone || '—'}</p>
                    </div>
                    <div className="p-4 bg-sage-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sage-500 text-sm mb-1">
                        <MapPin className="w-4 h-4" /> {t('profile.location')}
                      </div>
                      <p className="text-sage-900 font-medium">{profile?.location || '—'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-sage-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sage-500 text-sm mb-1">
                      <Calendar className="w-4 h-4" /> {t('profile.memberSince')}
                    </div>
                    <p className="text-sage-900 font-medium">
                      {new Date(profile?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-colors">
                      <Save className="w-4 h-4" /> {t('profile.editProfile')}
                    </button>
                    <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="flex items-center gap-2 px-5 py-2.5 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50 transition-colors">
                      <Lock className="w-4 h-4" /> {t('profile.changePassword')}
                    </button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-6 p-5 bg-earth-50 rounded-xl border border-earth-100 space-y-4">
                      <h3 className="font-semibold text-sage-900">{t('profile.changePassword')}</h3>
                      <div>
                        <input type="password" placeholder={t('profile.currentPassword')} className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                      </div>
                      <div>
                        <input type="password" placeholder={t('profile.newPassword')} className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                      </div>
                      <div>
                        <input type="password" placeholder={t('profile.confirmNewPassword')} className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500" value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} required minLength={6} />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" disabled={passwordSaving} className="px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 transition-colors">
                          {passwordSaving ? '...' : t('profile.saveChanges')}
                        </button>
                        <button type="button" onClick={() => setShowPasswordForm(false)} className="px-5 py-2.5 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50 transition-colors">
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">{t('auth.name')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">{t('profile.phone')}</label>
                    <input type="tel" className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">{t('profile.location')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 transition-colors">
                      <Save className="w-4 h-4" /> {saving ? '...' : t('profile.saveChanges')}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone || '', location: profile.location || '' }); }} className="px-5 py-2.5 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50 transition-colors">
                      <X className="w-4 h-4" /> {t('common.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
