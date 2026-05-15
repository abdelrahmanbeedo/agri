import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import FarmerDashboard from "./pages/FarmerDashboard";
import TraderDashboard from "./pages/TraderDashboard";
import ProductDetail from "./pages/ProductDetail";
import Messages from "./pages/Messages";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import BananaClassifier from "./pages/BananaClassifier";
import NegotiationPage from "./pages/NegotiationPage";
import NegotiationsList from "./pages/NegotiationsList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminNegotiations from "./pages/admin/AdminNegotiations";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public product detail page */}
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/classify" element={<BananaClassifier />} />

      <Route
        path="/farmer"
        element={
          <ProtectedRoute role="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trader"
        element={
          <ProtectedRoute role="trader">
            <TraderDashboard />
          </ProtectedRoute>
        }
      />

      {/* Messages - accessible to all logged in users */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* Orders - accessible to all logged in users */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />

      {/* Negotiations */}
      <Route
        path="/negotiations"
        element={
          <ProtectedRoute>
            <NegotiationsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/negotiation/:negotiationId"
        element={
          <ProtectedRoute>
            <NegotiationPage />
          </ProtectedRoute>
        }
      />
      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute role="admin">
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute role="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/negotiations"
        element={
          <ProtectedRoute role="admin">
            <AdminNegotiations />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
