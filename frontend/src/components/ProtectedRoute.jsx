import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role && user.role !== role) {
    if (user.role === "farmer") {
      return <Navigate to="/farmer" replace />;
    } else if (user.role === "trader") {
      return <Navigate to="/trader" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/trader" replace />;
    }
  }

  return children;
}
