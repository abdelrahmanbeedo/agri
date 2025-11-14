export default function TraderDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Trader Dashboard</h1>

      <p className="text-gray-700">
        Welcome, Trader! This is your simple dashboard for the MVP.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Browse Listings</h2>
          <p className="text-gray-600 text-sm">
            View all available products from farmers.
          </p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Your Requests</h2>
          <p className="text-gray-600 text-sm">
            Manage product requests you've posted.
          </p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Messages</h2>
          <p className="text-gray-600 text-sm">
            Chat with farmers and negotiate deals.
          </p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Account Reviews</h2>
          <p className="text-gray-600 text-sm">
            View your ratings and feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
