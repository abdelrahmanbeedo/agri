import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import TraderDashboard from "./pages/TraderDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
    </Routes>
  );
}
