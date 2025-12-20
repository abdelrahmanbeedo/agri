import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // all, buyer, seller
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter, statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") {
        params.role = filter;
      }

      const res = await axios.get(`${API_URL}/api/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      let filtered = res.data;
      if (statusFilter !== "all") {
        filtered = filtered.filter(order => order.status === statusFilter);
      }

      setOrders(filtered);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View As
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="all">All Orders</option>
                  <option value="buyer">My Purchases</option>
                  <option value="seller">My Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/products/${order.product_id._id}`}
                          className="font-semibold text-lg text-gray-900 hover:text-green-600"
                        >
                          {order.product_id.title}
                        </Link>
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {filter === "buyer" || (filter === "all" && order.buyer_id._id === user.id)
                          ? `Seller: ${order.seller_id.name}`
                          : `Buyer: ${order.buyer_id.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {order.total_price.toLocaleString()} EGP
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.quantity} {order.product_id.unit} × {order.unit_price} EGP
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {order.delivery_address && (
                      <div>
                        <p className="text-gray-500">Delivery Address</p>
                        <p className="font-medium">{order.delivery_address}</p>
                      </div>
                    )}
                  </div>

                  {order.buyer_notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-900 mb-1">Buyer Notes:</p>
                      <p className="text-sm text-blue-800">{order.buyer_notes}</p>
                    </div>
                  )}

                  {order.seller_notes && (
                    <div className="mb-4 p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-900 mb-1">Seller Notes:</p>
                      <p className="text-sm text-green-800">{order.seller_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm transition"
                    >
                      View Details
                    </Link>
                    {order.status === "pending" && order.seller_id._id === user.id && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "accepted")}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm transition"
                      >
                        Accept
                      </button>
                    )}
                    {order.status === "pending" && order.seller_id._id === user.id && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "rejected")}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm transition"
                      >
                        Reject
                      </button>
                    )}
                    {order.status === "pending" && order.buyer_id._id === user.id && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "cancelled")}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm transition"
                      >
                        Cancel
                      </button>
                    )}
                    {order.status === "accepted" && order.seller_id._id === user.id && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "completed")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm transition"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  async function handleUpdateStatus(orderId, status) {
    if (!window.confirm(`Are you sure you want to ${status} this order?`)) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOrders();
    } catch (err) {
      console.error("Update order status error:", err);
      alert(err.response?.data?.msg || "Failed to update order status");
    }
  }
}

