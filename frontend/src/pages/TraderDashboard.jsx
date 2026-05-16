import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import ProductCard from "../components/ProductCard";
import { Search, SlidersHorizontal, Leaf, X, Grid3X3, List, ArrowUpDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function TraderDashboard() {
  const { t, isRTL } = useLanguage();
  useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
      setError("");
    } catch { setError(t('farmer.failedLoad')); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchProducts(); }, []);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const q = searchTerm.toLowerCase();
      return (p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
        && (selectedCategory === "all" || p.category === selectedCategory) && p.status === "active";
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price_per_unit - b.price_per_unit;
        case "price-high": return b.price_per_unit - a.price_per_unit;
        case "quantity-high": return b.quantity - a.quantity;
        default: return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const hasFilters = searchTerm || selectedCategory !== "all" || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('trader.browseProducts')}</h1>
            <p className="text-gray-500 mt-1">{t('trader.discoverProducts')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t('trader.searchProducts')} value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="select min-w-[150px]">
                <option value="all">{t('trader.allCategories')}</option>
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="select min-w-[140px]">
                <option value="newest">{t('trader.newest')}</option>
                <option value="price-low">{t('trader.priceLow')}</option>
                <option value="price-high">{t('trader.priceHigh')}</option>
                <option value="quantity-high">{t('trader.mostStock')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {t('trader.showing')} <span className="font-semibold text-gray-900">{filteredProducts.length}</span> {t('trader.of')} {products.length} {t('trader.products')}
            </p>
            {hasFilters && (
              <button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSortBy("newest"); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <X className="w-3.5 h-3.5" />
                {t('trader.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card p-0 overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-5 skeleton w-3/4" />
                  <div className="h-4 skeleton w-1/2" />
                  <div className="h-8 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-6">
            <div className="flex items-start gap-3 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state card p-16">
            <Leaf className="w-12 h-12 text-gray-300" />
            <h3>{t('trader.noProductsFound')}</h3>
            <p>{hasFilters ? t('trader.adjustFilters') : t('trader.noProductsAvailable')}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card divide-y divide-gray-100 overflow-hidden">
            {filteredProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
