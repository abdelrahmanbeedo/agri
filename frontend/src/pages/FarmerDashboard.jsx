import { useAuth } from "../context/AuthContext";

export default function FarmerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-3xl">Farmer Dashboard</h1>
      <p className="mt-2">Welcome, {user.name}</p>

      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
