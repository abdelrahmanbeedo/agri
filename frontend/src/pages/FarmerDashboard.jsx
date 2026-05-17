import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Plus, Package, Trash2, ExternalLink, AlertCircle, ImageUp, X, TrendingUp, DollarSign, BarChart3, Eye } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ML_API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";
const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Dairy", "Livestock", "Other"];
const UNITS = ["kg", "ton", "crate", "piece", "bag", "liter", "dozen"];

export default function FarmerDashboard() {
  const { t, isRTL } = useLanguage();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: "", price_per_unit: "", quantity: "", category: "", unit: "kg", description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageGrades, setImageGrades] = useState({});
  const [gradingImage, setGradingImage] = useState(false);

  async function fetchProducts() {
    try {
      const res = await axios.get(`${API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch { setError(t('farmer.failedLoad')); }
  }

  useEffect(() => { if (token) fetchProducts(); }, [token]);

  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price_per_unit), 0);
  const activeCount = products.filter(p => p.status === "active").length;
  const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);

  async function handleAddProduct(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!formData.title || !formData.price_per_unit || !formData.quantity || !formData.category) {
      setError(t('farmer.fillRequired')); setLoading(false); return;
    }
    if (Number(formData.price_per_unit) <= 0 || Number(formData.quantity) <= 0) {
      setError(t('farmer.priceQuantityPositive')); setLoading(false); return;
    }
    const firstGrade = uploadedImages.length > 0 ? imageGrades[uploadedImages[0]] : null;
    try {
      const res = await axios.post(`${API_URL}/api/products`, {
        title: formData.title, price_per_unit: Number(formData.price_per_unit),
        quantity: Number(formData.quantity), category: formData.category,
        unit: formData.unit, description: formData.description || "", images: uploadedImages,
        ai_grade_id: firstGrade?._id || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProducts([res.data, ...products]);
      setFormData({ title: "", price_per_unit: "", quantity: "", category: "", unit: "kg", description: "" });
      setUploadedImages([]); setImageGrades({}); setFormExpanded(false); setError("");
    } catch (err) {
      setError(err.response?.data?.msg || t('farmer.createError'));
    } finally { setLoading(false); }
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm(t('farmer.deleteConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p._id !== productId));
    } catch { alert(t('farmer.deleteFailed')); }
  }

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('farmer.myProducts')}</h1>
            <p className="text-gray-500 mt-1">{t('farmer.manageListings')}</p>
          </div>
          <button onClick={() => setFormExpanded(!formExpanded)}
            className="btn btn-primary btn-lg">
            <Plus className="w-5 h-5" />
            {t('farmer.addProduct')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: t('farmer.totalProducts'), value: products.length },
            { icon: Eye, label: t('farmer.activeListings'), value: activeCount },
            { icon: BarChart3, label: t('farmer.totalQuantity'), value: `${totalQty.toLocaleString()} ${t('farmer.units')}` },
            { icon: TrendingUp, label: t('farmer.totalValue'), value: `${totalValue.toLocaleString()} EGP` },
          ].map((stat, i) => (
            <div key={i} className="stat-card animate-slideUp" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-100 to-sage-50 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-sage-600" />
                </div>
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Product Form */}
        {formExpanded && (
          <div className="card p-6 mb-8 animate-slideDown">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('farmer.addNewProduct')}</h2>
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleAddProduct} className="space-y-5">
              <div>
                <label className="label">{t('farmer.productTitle')} <span className="text-red-400">*</span></label>
                <input type="text" placeholder={t('farmer.titlePlaceholder')} className="input" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">{t('farmer.pricePerUnitEGP')} <span className="text-red-400">*</span></label>
                  <input type="number" step="0.01" min="0" placeholder={t('farmer.pricePlaceholder')} className="input"
                    value={formData.price_per_unit} onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })} required />
                </div>
                <div>
                  <label className="label">{t('farmer.quantity')} <span className="text-red-400">*</span></label>
                  <input type="number" min="1" placeholder={t('farmer.quantityPlaceholder')} className="input"
                    value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
                <div>
                  <label className="label">{t('farmer.unit')} <span className="text-red-400">*</span></label>
                  <select className="select" value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required>
                    {UNITS.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{t('farmer.category')} <span className="text-red-400">*</span></label>
                <select className="select" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">{t('farmer.selectCategory')}</option>
                  {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div>
                <label className="label">{t('farmer.description')}</label>
                <textarea placeholder={t('farmer.descriptionPlaceholder')} rows="3" className="input resize-none"
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="label">{t('upload.uploadImage')}</label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {uploadedImages.map((url, i) => {
                    const grade = imageGrades[url];
                    return (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group/image">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {grade && (
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm ${grade.grade === "Grade A" ? "bg-emerald-500" : "bg-red-500"}`}>
                            {grade.grade === "Grade A" ? "A" : "C"}
                          </div>
                        )}
                        <button type="button" onClick={() => { setUploadedImages(uploadedImages.filter((_, j) => j !== i)); const g = {...imageGrades}; delete g[url]; setImageGrades(g); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    );
                  })}
                  {uploadedImages.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-sage-400 hover:bg-sage-50/30 transition-all duration-200">
                      <ImageUp className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">{uploadingImage ? '...' : t('upload.uploadImage')}</span>
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingImage || gradingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          setUploadingImage(true);
                          const fd = new FormData(); fd.append('image', file);
                          try {
                            const res = await axios.post(`${API_URL}/api/upload`, fd, {
                              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                            });
                            const imgUrl = res.data.url;
                            setUploadedImages([...uploadedImages, imgUrl]);
                            setUploadingImage(false);
                            setGradingImage(true);
                            try {
                              const gradeFd = new FormData(); gradeFd.append('image', file);
                              const gradeRes = await axios.post(`${ML_API_URL}/predict`, gradeFd, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              setImageGrades(prev => ({ ...prev, [imgUrl]: gradeRes.data }));
                            } catch { /* grading non-blocking */ }
                            finally { setGradingImage(false); }
                          } catch { setError(t('upload.uploadFailed')); }
                          finally { if (uploadingImage) setUploadingImage(false); }
                        }} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-400">{t('upload.maxSize')}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setFormExpanded(false); setUploadedImages([]); setImageGrades({}); }}
                  className="btn btn-secondary">{t('common.cancel')}</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('farmer.adding')}</span> : t('farmer.addProduct')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-sage-100">
            <h2 className="font-semibold text-gray-900">{t('farmer.yourListings')}</h2>
            <span className="text-sm text-gray-500">{products.length} {products.length === 1 ? t('farmer.productCount') : t('farmer.productCountPlural')}</span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <Package className="w-12 h-12 text-gray-300" />
              <h3>{t('farmer.noProducts')}</h3>
              <p>{t('farmer.noProductsDesc')}</p>
              <button onClick={() => setFormExpanded(true)} className="btn btn-primary mt-6">
                <Plus className="w-4 h-4" /> {t('farmer.addProduct')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-sage-100">
              {products.map((p, i) => (
                <div key={p._id} className="p-5 hover:bg-sage-50/40 transition-colors animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-sage-50 rounded-xl overflow-hidden shrink-0 border border-sage-100 relative">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-sage-300" />
                          </div>
                        )}
                        {p.ai_grade_id && (
                          <div className={`absolute top-1 left-1 px-2 py-0.5 rounded-md text-white text-xs font-bold shadow-md flex items-center gap-1 ${p.ai_grade_id.grade === "Grade A" ? "bg-emerald-500" : "bg-red-500"}`}
                               title={`${p.ai_grade_id.grade} — ${p.ai_grade_id.fruit} (${(p.ai_grade_id.confidence * 100).toFixed(0)}%)`}>
                            <span>{p.ai_grade_id.grade === "Grade A" ? "A" : "C"}</span>
                            <span className="opacity-80 font-normal">{p.ai_grade_id.grade === "Grade A" ? "Fresh" : "Rotten"}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                          <span className={`badge ${p.status === "active" ? "badge-success" : "badge-neutral"}`}>{p.status}</span>
                        </div>
                        <p className="text-sm text-gray-400">{p.category}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-700 font-medium">{Number(p.price_per_unit).toLocaleString()} <span className="text-gray-500 font-normal">EGP/{p.unit}</span></span>
                          <span className="text-gray-500">{p.quantity.toLocaleString()} {p.unit}</span>
                          <span className="text-gray-600">{(p.quantity * p.price_per_unit).toLocaleString()} EGP</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <Link to={`/products/${p._id}`} className="btn btn-secondary btn-sm">
                        <Eye className="w-3.5 h-3.5" />
                        {t('common.view')}
                      </Link>
                      <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger btn-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
