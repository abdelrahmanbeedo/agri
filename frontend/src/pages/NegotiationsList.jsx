import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from '../components/Navbar';
import { Package, Clock, Check, X, MessageSquare, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NegotiationsList() {
  const { token } = useAuth();
  const { isRTL } = useLanguage();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNegotiations();
  }, [filter]);

  async function fetchNegotiations() {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get(`${API_URL}/api/negotiations`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setNegotiations(res.data);
    } catch (err) {
      console.error('Fetch negotiations error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-honey-50 text-honey-700 text-xs font-medium rounded-full">Active</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Deal Made</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">Declined</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full">Expired</span>;
      default:
        return <span className="px-2 py-1 bg-sage-50 text-sage-700 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-sage-900">Negotiations</h1>
              <p className="text-sage-600 mt-1">Manage your active deals and offers</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {['all', 'active', 'accepted', 'rejected', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-sage-600 text-white'
                    : 'bg-white border border-sage-200 text-sage-700 hover:bg-sage-50'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
            </div>
          ) : negotiations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sage-100 p-12 text-center">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-sage-400" />
              </div>
              <h3 className="text-lg font-medium text-sage-900 mb-2">No negotiations yet</h3>
              <p className="text-sage-500">Start a negotiation from a product page</p>
            </div>
          ) : (
            <div className="space-y-4">
              {negotiations.map((neg) => (
                <Link
                  key={neg._id}
                  to={`/negotiation/${neg._id}`}
                  className="block bg-white rounded-2xl border border-sage-100 p-5 hover:border-sage-200 hover:shadow-soft transition-all"
                >
                  <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-16 h-16 bg-sage-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {neg.product?.images?.[0] ? (
                        <img src={neg.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-sage-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-semibold text-sage-900 truncate">{neg.product?.title}</h3>
                        {getStatusBadge(neg.status)}
                      </div>
                      
                      <p className="text-sm text-sage-500 mb-2">
                        {neg.user_role === 'farmer' ? 'Buyer' : 'Seller'}: {neg.user_role === 'farmer' ? neg.trader?.name : neg.farmer?.name}
                      </p>

                      <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sage-600">
                          Ask: <span className="font-medium text-sage-900">{neg.farmer_ask_price} EGP</span>
                        </span>
                        {neg.last_offer && (
                          <span className="text-sage-600">
                            Latest: <span className="font-medium text-honey-600">{neg.last_offer.price_per_unit} EGP</span>
                          </span>
                        )}
                        <span className="text-sage-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(neg.last_activity)}
                        </span>
                      </div>

                      {neg.deal_id && (
                        <p className="text-xs text-sage-400 mt-1">Deal ID: {neg.deal_id}</p>
                      )}
                    </div>

                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <ArrowRight className={`w-5 h-5 text-sage-400 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
