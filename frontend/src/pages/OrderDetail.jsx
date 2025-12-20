import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        {
          payment_method: "cash",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Order not found</p>
        </div>
      </>
    );
  }

  const isBuyer = order.buyer_id._id === user.id;
  const isSeller = order.seller_id._id === user.id;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/orders")}
            className="mb-6 text-gray-600 hover:text-green-600 flex items-center"
          >
            ← Back to Orders
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
                <span className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  order.status === "accepted" ? "bg-blue-100 text-blue-800" :
                  order.status === "rejected" ? "bg-red-100 text-red-800" :
                  order.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">
                  {order.total_price.toLocaleString()} EGP
                </p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Product</h3>
                <Link
                  to={`/products/${order.product_id._id}`}
                  className="text-green-600 hover:underline"
                >
                  {order.product_id.title}
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  {order.quantity} {order.product_id.unit} × {order.unit_price} EGP
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  {isBuyer ? "Seller" : "Buyer"}
                </h3>
                <p className="text-gray-900">
                  {isBuyer ? order.seller_id.name : order.buyer_id.name}
                </p>
                <p className="text-sm text-gray-600">
                  {isBuyer ? order.seller_id.email : order.buyer_id.email}
                </p>
              </div>
            </div>

            {order.delivery_address && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Delivery Address</h3>
                <p className="text-gray-900">{order.delivery_address}</p>
              </div>
            )}

            {order.buyer_notes && (
              <div className="mb-6 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Buyer Notes</h3>
                <p className="text-blue-800">{order.buyer_notes}</p>
              </div>
            )}

            {order.seller_notes && (
              <div className="mb-6 p-4 bg-green-50 rounded">
                <h3 className="font-semibold text-green-900 mb-2">Seller Notes</h3>
                <p className="text-green-800">{order.seller_notes}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex gap-2">
                {order.status === "pending" && isSeller && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus("accepted")}
                      disabled={actionLoading}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={actionLoading}
                      className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Reject Order
                    </button>
                  </>
                )}
                {order.status === "pending" && isBuyer && (
                  <button
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={actionLoading}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                )}
                {order.status === "accepted" && isSeller && (
                  <button
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark as Completed
                  </button>
                )}
                {order.status === "accepted" && isBuyer && !order.transaction_id && (
                  <button
                    onClick={handleCreateTransaction}
                    disabled={actionLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Create Transaction
                  </button>
                )}
              </div>
            </div>
          </div>

          {order.transaction_id && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold">{order.transaction_id.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold">{order.transaction_id.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-green-600">
                    {order.transaction_id.amount.toLocaleString()} EGP
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold">
                    {new Date(order.transaction_id.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

