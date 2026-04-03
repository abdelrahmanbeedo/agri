import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Plus, Package, Trash2, ExternalLink, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Dairy", "Livestock", "Other"];
const UNITS = ["kg", "ton", "crate", "piece", "bag", "liter", "dozen"];

export default function FarmerDashboard() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    price_per_unit: "",
    quantity: "",
    category: "",
    unit: "kg",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);

  async function fetchProducts() {
    try {
      const res = await axios.get(`${API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Product fetch error:", err);
      setError("Failed to load products.");
    }
  }

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  async function handleAddProduct(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.price_per_unit || !formData.quantity || !formData.category || !formData.unit) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (Number(formData.price_per_unit) <= 0 || Number(formData.quantity) <= 0) {
      setError("Price and quantity must be greater than 0.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/products`,
        {
          title: formData.title,
          price_per_unit: Number(formData.price_per_unit),
          quantity: Number(formData.quantity),
          category: formData.category,
          unit: formData.unit,
          description: formData.description || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts([res.data, ...products]);
      setFormData({
        title: "",
        price_per_unit: "",
        quantity: "",
        category: "",
        unit: "kg",
        description: "",
      });
      setFormExpanded(false);
      setError("");
    } catch (err) {
      console.error("Product creation error:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Could not create product.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-sage-900">My Products</h1>
              <p className="text-sage-600 mt-1">Manage your product listings</p>
            </div>
            <button
              onClick={() => setFormExpanded(!formExpanded)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-colors shadow-lg shadow-sage-600/20"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {formExpanded && (
            <div className="bg-white rounded-2xl border border-sage-100 p-6 mb-6 shadow-soft">
              <h2 className="text-lg font-semibold text-sage-900 mb-5">Add New Product</h2>

              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Fresh Tomatoes"
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Price per Unit (EGP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    >
                      {UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    placeholder="Add details about your product..."
                    rows="3"
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormExpanded(false)}
                    className="px-6 py-3 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-sage-100 shadow-soft">
            <div className="px-6 py-4 border-b border-sage-100 flex items-center justify-between">
              <h2 className="font-semibold text-sage-900">Your Listings</h2>
              <span className="text-sm text-sage-500">
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-sage-400" />
                </div>
                <h3 className="text-lg font-medium text-sage-900 mb-2">No products yet</h3>
                <p className="text-sage-500 mb-5">Add your first product to start selling</p>
                <button
                  onClick={() => setFormExpanded(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </div>
            ) : (
              <div className="divide-y divide-sage-100">
                {products.map((p) => (
                  <div key={p._id} className="p-5 hover:bg-sage-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 bg-sage-100 rounded-xl overflow-hidden shrink-0">
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-sage-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sage-900 truncate">{p.title}</h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              p.status === "active" 
                                ? "bg-sage-100 text-sage-700" 
                                : "bg-earth-100 text-earth-600"
                            }`}>
                              {p.status}
                            </span>
                          </div>
                          <p className="text-sm text-sage-500">{p.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-sage-700">
                              <span className="font-medium text-sage-900">{p.price_per_unit}</span> EGP/{p.unit}
                            </span>
                            <span className="text-sage-500">{p.quantity} {p.unit}</span>
                            <span className="text-sage-500">
                              Total: <span className="font-medium text-sage-700">{(p.quantity * p.price_per_unit).toLocaleString()} EGP</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:shrink-0">
                        <Link
                          to={`/products/${p._id}`}
                          className="flex items-center gap-1.5 px-4 py-2 text-sage-700 border border-sage-200 rounded-xl text-sm font-medium hover:bg-sage-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
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
    </>
  );
}
