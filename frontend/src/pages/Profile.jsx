import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { User, Mail, Phone, MapPin, Calendar, Lock, Save, Camera, X, Leaf, BadgeCheck } from 'lucide-react';

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

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data);
      setForm({ name: res.data.name, phone: res.data.phone || '', location: res.data.location || '' });
    } catch { setError('Failed to load profile'); }
    finally { setLoading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await axios.put(`${API_URL}/api/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data); login(res.data, token);
      setEditing(false); setSuccess(t('profile.profileUpdated'));
    } catch (err) { setError(err.response?.data?.error || 'Failed to update profile'); }
    finally { setSaving(false); }
  }

  async function handleChangePassword(e) {
    e.preventDefault(); setError(''); setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) { setError(t('profile.passwordMismatch')); return; }
    setPasswordSaving(true);
    try {
      await axios.put(`${API_URL}/api/profile/password`, {
        currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(t('profile.passwordChanged')); setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) { setError(err.response?.data?.error || 'Failed to change password'); }
    finally { setPasswordSaving(false); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      await axios.put(`${API_URL}/api/profile`, { avatar: res.data.url }, { headers: { Authorization: `Bearer ${token}` } });
      const profileRes = await axios.get(`${API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(profileRes.data); login(profileRes.data, token);
    } catch { setError(t('upload.uploadFailed')); }
    finally { setUploading(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-sage-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card overflow-hidden animate-slideUp">
          <div className="p-6 sm:p-8">
            {/* Avatar & Header */}
            <div className="flex items-center gap-5 mb-8">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-50 overflow-hidden flex items-center justify-center border-2 border-sage-200">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-400 to-sage-600">
                      <span className="text-2xl font-bold text-white">{profile?.name?.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
                {uploading && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-sage-600 rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                  <BadgeCheck className="w-5 h-5 text-sage-500" />
                </div>
                <p className="text-gray-500 text-sm capitalize">{profile?.role}</p>
                <p className="text-gray-400 text-xs mt-0.5">{profile?.email}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {!editing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-sage-50/60 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <User className="w-4 h-4" /> {t('auth.name')}
                    </div>
                    <p className="text-gray-900 font-medium">{profile?.name}</p>
                  </div>
                  <div className="p-4 bg-sage-50/60 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Mail className="w-4 h-4" /> {t('auth.email')}
                    </div>
                    <p className="text-gray-900 font-medium">{profile?.email}</p>
                  </div>
                  <div className="p-4 bg-sage-50/60 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Phone className="w-4 h-4" /> {t('profile.phone')}
                    </div>
                    <p className="text-gray-900 font-medium">{profile?.phone || '—'}</p>
                  </div>
                  <div className="p-4 bg-sage-50/60 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <MapPin className="w-4 h-4" /> {t('profile.location')}
                    </div>
                    <p className="text-gray-900 font-medium">{profile?.location || '—'}</p>
                  </div>
                </div>
                <div className="p-4 bg-sage-50/60 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" /> {t('profile.memberSince')}
                  </div>
                  <p className="text-gray-900 font-medium">
                    {new Date(profile?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setEditing(true)} className="btn btn-primary">
                    <Save className="w-4 h-4" /> {t('profile.editProfile')}
                  </button>
                  <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="btn btn-secondary">
                    <Lock className="w-4 h-4" /> {t('profile.changePassword')}
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="mt-6 p-5 bg-sage-50/60 rounded-xl border border-sage-100 space-y-4 animate-slideDown">
                    <h3 className="font-semibold text-gray-900">{t('profile.changePassword')}</h3>
                    <input type="password" placeholder={t('profile.currentPassword')} className="input" value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                    <input type="password" placeholder={t('profile.newPassword')} className="input" value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                    <input type="password" placeholder={t('profile.confirmNewPassword')} className="input" value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} required minLength={6} />
                    <div className="flex gap-3">
                      <button type="submit" disabled={passwordSaving} className="btn btn-primary">
                        {passwordSaving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('profile.saving')}</span> : t('profile.saveChanges')}
                      </button>
                      <button type="button" onClick={() => setShowPasswordForm(false)} className="btn btn-secondary">
                        <X className="w-4 h-4" /> {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="label">{t('auth.name')}</label>
                  <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">{t('profile.phone')}</label>
                  <input type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">{t('profile.location')}</label>
                  <input type="text" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    <Save className="w-4 h-4" /> {saving ? t('profile.saving') : t('profile.saveChanges')}
                  </button>
                  <button type="button" onClick={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone || '', location: profile.location || '' }); }}
                    className="btn btn-secondary">
                    <X className="w-4 h-4" /> {t('common.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
