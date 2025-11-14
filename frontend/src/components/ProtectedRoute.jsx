import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to={user.role === "farmer" ? "/farmer" : "/trader"} replace />;
  }

  return children;
}
