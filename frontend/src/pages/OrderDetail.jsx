import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { ArrowLeft, Check, X, CreditCard, MapPin, User, Package } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_CONFIG = {
  pending: { bg: "bg-honey-50", text: "text-honey-700", label: "Pending" },
  accepted: { bg: "bg-blue-50", text: "text-blue-700", label: "Accepted" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
  completed: { bg: "bg-sage-50", text: "text-sage-700", label: "Completed" },
  cancelled: { bg: "bg-earth-100", text: "text-earth-600", label: "Cancelled" },
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      console.error("Fetch order error:", err);
      if (err.response?.status === 403) {
        alert("You don't have permission to view this order");
        navigate("/orders");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(status) {
    if (!window.confirm(`Are you sure you want to ${status} this order?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrder();
    } catch (err) {
      console.error("Update order status error:", err);
      alert(err.response?.data?.msg || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateTransaction() {
    if (!window.confirm("Create transaction for this order?")) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/orders/${orderId}/transaction`,
        { payment_method: "cash" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrder();
      alert("Transaction created successfully!");
    } catch (err) {
      console.error("Create transaction error:", err);
      alert(err.response?.data?.msg || "Failed to create transaction");
    } finally {
      setActionLoading(false);
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

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-earth-50 flex items-center justify-center">
          <p className="text-sage-500">Order not found</p>
        </div>
      </>
    );
  }

  const isBuyer = order.buyer_id._id === user.id;
  const isSeller = order.seller_id._id === user.id;
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>

          <div className="bg-white rounded-2xl border border-sage-100 shadow-soft overflow-hidden">
            <div className="px-6 py-5 border-b border-sage-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-sage-900">Order Details</h1>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-sage-900">{order.total_price.toLocaleString()} EGP</p>
                <p className="text-sm text-sage-500">Total Amount</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sage-500 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">Product</span>
                  </div>
                  <Link
                    to={`/products/${order.product_id._id}`}
                    className="font-semibold text-sage-900 hover:text-sage-700"
                  >
                    {order.product_id.title}
                  </Link>
                  <p className="text-sm text-sage-600 mt-1">
                    {order.quantity} {order.product_id.unit} × {order.unit_price} EGP
                  </p>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sage-500 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{isBuyer ? "Seller" : "Buyer"}</span>
                  </div>
                  <p className="font-semibold text-sage-900">
                    {isBuyer ? order.seller_id.name : order.buyer_id.name}
                  </p>
                  <p className="text-sm text-sage-600">
                    {isBuyer ? order.seller_id.email : order.buyer_id.email}
                  </p>
                </div>
              </div>

              {order.delivery_address && (
                <div>
                  <div className="flex items-center gap-2 text-sage-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Delivery Address</span>
                  </div>
                  <p className="text-sage-700">{order.delivery_address}</p>
                </div>
              )}

              {order.buyer_notes && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-blue-800 mb-1">Buyer Notes</p>
                  <p className="text-blue-700">{order.buyer_notes}</p>
                </div>
              )}

              {order.seller_notes && (
                <div className="p-4 bg-sage-50 rounded-xl">
                  <p className="text-sm font-medium text-sage-800 mb-1">Seller Notes</p>
                  <p className="text-sage-700">{order.seller_notes}</p>
                </div>
              )}

              {order.transaction_id && (
                <div className="p-5 bg-earth-50 rounded-xl border border-earth-100">
                  <div className="flex items-center gap-2 text-sage-700 mb-3">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">Transaction</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-sage-500">Status</p>
                      <p className="font-medium text-sage-900 capitalize">{order.transaction_id.status}</p>
                    </div>
                    <div>
                      <p className="text-sage-500">Payment Method</p>
                      <p className="font-medium text-sage-900 capitalize">{order.transaction_id.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sage-500">Amount</p>
                      <p className="font-medium text-sage-900">{order.transaction_id.amount.toLocaleString()} EGP</p>
                    </div>
                    <div>
                      <p className="text-sage-500">Created</p>
                      <p className="font-medium text-sage-900">{new Date(order.transaction_id.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t border-sage-100 bg-sage-50/50">
              <div className="flex flex-wrap gap-3">
                {order.status === "pending" && isSeller && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus("accepted")}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {order.status === "pending" && isBuyer && (
                  <button
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
                {order.status === "accepted" && isSeller && (
                  <button
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Mark Complete
                  </button>
                )}
                {order.status === "accepted" && isBuyer && !order.transaction_id && (
                  <button
                    onClick={handleCreateTransaction}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Create Transaction
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
