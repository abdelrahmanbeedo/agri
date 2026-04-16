import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from '../components/Navbar';
import MarketBenchmarkWidget from '../components/Negotiation/MarketBenchmarkWidget';
import DealGapIndicator from '../components/Negotiation/DealGapIndicator';
import OfferCard from '../components/Negotiation/OfferCard';
import ReputationBadge from '../components/Negotiation/ReputationBadge';
import { 
  ArrowLeft, Package, Clock, Check, X, Send, AlertTriangle, 
  Zap, ChevronRight, Calendar, CreditCard
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NegotiationPage() {
  const { negotiationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { isRTL } = useLanguage();

  const [negotiation, setNegotiation] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [nudge, setNudge] = useState(null);

  const [offerForm, setOfferForm] = useState({
    price_per_unit: '',
    quantity: '',
    delivery_date: '',
    payment_terms: 'cash',
    special_conditions: '',
    notes: ''
  });

  const [counterForm, setCounterForm] = useState({
    counter_price: '',
    counter_quantity: '',
    counter_delivery_date: '',
    counter_payment_terms: 'cash',
    message: ''
  });

  useEffect(() => {
    fetchNegotiation();
  }, [negotiationId]);

  async function fetchNegotiation() {
    try {
      const res = await axios.get(`${API_URL}/api/negotiations/${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNegotiation(res.data.negotiation);
      setMarketData(res.data.marketData);
      setLastAnalysis(res.data.lastOffer?.analysis);

      if (res.data.lastOffer && user?.id === res.data.negotiation?.farmer_id?._id) {
        setShowOfferForm(false);
      }
    } catch (err) {
      console.error('Fetch negotiation error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function submitOffer(e) {
    e.preventDefault();
    setSubmitting(true);
    setNudge(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/negotiations/${negotiationId}/offer`,
        offerForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.requireAcknowledgment) {
        const confirmed = window.confirm(res.data.message);
        if (confirmed) {
          await axios.post(
            `${API_URL}/api/negotiations/${negotiationId}/offer`,
            { ...offerForm, acknowledged: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      setLastAnalysis(res.data.analysis);
      setShowOfferForm(false);
      resetOfferForm();
      fetchNegotiation();
    } catch (err) {
      console.error('Submit offer error:', err);
      alert(err.response?.data?.error || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  }

  async function respondToOffer(action) {
    setSubmitting(true);

    try {
      if (action === 'counter') {
        const res = await axios.post(
          `${API_URL}/api/negotiations/${negotiationId}/respond`,
          { action: 'counter', ...counterForm },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.nudge) {
          setNudge(res.data.nudge);
        }

        setShowCounterForm(false);
        resetCounterForm();
      } else if (action === 'accept') {
        const res = await axios.post(
          `${API_URL}/api/negotiations/${negotiationId}/respond`,
          { action: 'accept' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.early_bonus) {
          setNudge({ type: 'early_bonus', message: res.data.message });
        }
      } else if (action === 'reject') {
        if (!window.confirm('Are you sure you want to decline this offer?')) {
          setSubmitting(false);
          return;
        }
        await axios.post(
          `${API_URL}/api/negotiations/${negotiationId}/respond`,
          { action: 'reject' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchNegotiation();
    } catch (err) {
      console.error('Respond error:', err);
      alert(err.response?.data?.error || 'Failed to respond');
    } finally {
      setSubmitting(false);
    }
  }

  function resetOfferForm() {
    setOfferForm({
      price_per_unit: '',
      quantity: negotiation?.farmer_ask_quantity || '',
      delivery_date: '',
      payment_terms: 'cash',
      special_conditions: '',
      notes: ''
    });
  }

  function resetCounterForm() {
    const lastOffer = negotiation?.offers[negotiation.offers.length - 1];
    setCounterForm({
      counter_price: negotiation?.farmer_ask_price || '',
      counter_quantity: lastOffer?.quantity || '',
      counter_delivery_date: lastOffer?.delivery_date || '',
      counter_payment_terms: 'cash',
      message: ''
    });
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

  if (!negotiation) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-earth-50 flex items-center justify-center">
          <p className="text-sage-500">Negotiation not found</p>
        </div>
      </>
    );
  }

  const isTrader = user?.id === negotiation.trader_id?._id;
  const isFarmer = user?.id === negotiation.farmer_id?._id;
  const isMyTurn = (negotiation.current_turn === 'trader' && isTrader) || 
                    (negotiation.current_turn === 'farmer' && isFarmer);
  const roundsRemaining = negotiation.max_rounds - negotiation.current_round;
  const lastOffer = negotiation.offers.length > 0 ? negotiation.offers[negotiation.offers.length - 1] : null;
  const isDealConfirmed = negotiation.status === 'accepted';
  const isClosed = negotiation.status !== 'active';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            Back
          </button>

          {isDealConfirmed && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-800">Deal Confirmed!</h2>
                  <p className="text-green-700">Deal ID: {negotiation.deal_id}</p>
                  {negotiation.early_agreement_bonus && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Early Agreement Bonus: +5 reputation points!
                    </p>
                  )}
                </div>
              </div>
              <Link
                to={`/orders/${negotiation.deal_id}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                View Order <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {isClosed && !isDealConfirmed && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800">Session Closed</h2>
                  <p className="text-red-700">
                    {negotiation.closed_reason === 'rejected' ? 'Offer was declined' : 'Session expired'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isRTL ? 'text-right' : ''}`}>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-sage-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-sage-900">Negotiation Session</h1>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    isMyTurn && !isClosed ? 'bg-honey-50 text-honey-700' : 'bg-sage-50 text-sage-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {isClosed ? 'Closed' : isMyTurn ? 'Your Turn' : 'Waiting...'}
                    </span>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-6 mb-6 ${isRTL ? '' : ''}`}>
                  <div className="p-4 bg-sage-50 rounded-xl">
                    <p className="text-sm text-sage-500 mb-1">Farmer</p>
                    <ReputationBadge profile={negotiation.farmer_id} />
                  </div>
                  <div className="p-4 bg-honey-50 rounded-xl">
                    <p className="text-sm text-honey-600 mb-1">Trader</p>
                    <ReputationBadge profile={negotiation.trader_id} />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-sage-50 rounded-xl mb-6">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                    {negotiation.product_id?.images?.[0] ? (
                      <img src={negotiation.product_id.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-sage-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sage-900">{negotiation.product_id?.title}</h3>
                    <p className="text-sm text-sage-500">{negotiation.product_id?.category}</p>
                    <p className="text-sm text-sage-600 mt-1">
                      Asking: <span className="font-bold text-sage-900">{negotiation.farmer_ask_price} EGP</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-sage-600">Round {negotiation.current_round} of {negotiation.max_rounds}</span>
                  <span className="text-sage-600">{roundsRemaining} rounds remaining</span>
                </div>
              </div>

              {nudge && (
                <div className="bg-honey-50 border border-honey-200 rounded-xl p-4 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-honey-600 mt-0.5" />
                  <p className="text-honey-800 font-medium">{nudge.message}</p>
                </div>
              )}

              {negotiation.offers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sage-900">Offer History</h3>
                  {negotiation.offers.map((offer, index) => (
                    <OfferCard
                      key={index}
                      offer={offer}
                      party={offer.party.toString() === negotiation.farmer_id._id.toString() ? 'farmer' : 'trader'}
                      isLatest={index === negotiation.offers.length - 1}
                      analysis={index === negotiation.offers.length - 1 ? lastAnalysis : null}
                    />
                  ))}
                </div>
              )}

              {isMyTurn && !isClosed && !isDealConfirmed && (
                <div className="bg-white rounded-2xl border border-sage-100 p-6">
                  {negotiation.current_turn === 'trader' && isTrader && !showOfferForm && (
                    <button
                      onClick={() => setShowOfferForm(true)}
                      className="w-full py-4 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Submit Offer
                    </button>
                  )}

                  {showOfferForm && (
                    <form onSubmit={submitOffer} className="space-y-4">
                      <h3 className="font-semibold text-sage-900">Your Offer</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1">Price per Unit (EGP)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={offerForm.price_per_unit}
                            onChange={(e) => setOfferForm({...offerForm, price_per_unit: e.target.value})}
                            className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={offerForm.quantity}
                            onChange={(e) => setOfferForm({...offerForm, quantity: e.target.value})}
                            className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Delivery Date
                          </label>
                          <input
                            type="date"
                            value={offerForm.delivery_date}
                            onChange={(e) => setOfferForm({...offerForm, delivery_date: e.target.value})}
                            className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1">
                            <CreditCard className="w-4 h-4 inline mr-1" />
                            Payment Terms
                          </label>
                          <select
                            value={offerForm.payment_terms}
                            onChange={(e) => setOfferForm({...offerForm, payment_terms: e.target.value})}
                            className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
                          >
                            <option value="cash">Cash on Delivery</option>
                            <option value="credit">Credit (Later Payment)</option>
                            <option value="escrow">Escrow Protected</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1">Notes (Optional)</label>
                        <textarea
                          value={offerForm.notes}
                          onChange={(e) => setOfferForm({...offerForm, notes: e.target.value})}
                          className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500 resize-none"
                          rows="2"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowOfferForm(false)}
                          className="flex-1 py-3 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Offer'}
                        </button>
                      </div>
                    </form>
                  )}

                  {negotiation.current_turn === 'farmer' && isFarmer && lastOffer && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sage-900">Respond to Offer</h3>
                      
                      {showCounterForm ? (
                        <form onSubmit={(e) => { e.preventDefault(); respondToOffer('counter'); }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-sage-700 mb-1">Counter Price</label>
                              <input
                                type="number"
                                step="0.01"
                                value={counterForm.counter_price}
                                onChange={(e) => setCounterForm({...counterForm, counter_price: e.target.value})}
                                className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-sage-700 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={counterForm.counter_quantity}
                                onChange={(e) => setCounterForm({...counterForm, counter_quantity: e.target.value})}
                                className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-sage-700 mb-1">Message</label>
                            <textarea
                              value={counterForm.message}
                              onChange={(e) => setCounterForm({...counterForm, message: e.target.value})}
                              className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500 resize-none"
                              rows="2"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setShowCounterForm(false)}
                              className="flex-1 py-3 border border-sage-200 text-sage-700 rounded-xl font-medium hover:bg-sage-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 py-3 bg-honey-500 text-white rounded-xl font-medium hover:bg-honey-600 disabled:opacity-50"
                            >
                              {submitting ? 'Sending...' : 'Send Counter'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => respondToOffer('accept')}
                            disabled={submitting}
                            className="flex-1 py-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            Accept Offer
                          </button>
                          <button
                            onClick={() => { resetCounterForm(); setShowCounterForm(true); }}
                            disabled={submitting}
                            className="flex-1 py-4 bg-honey-500 text-white rounded-xl font-medium hover:bg-honey-600 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Zap className="w-5 h-5" />
                            Counter
                          </button>
                          <button
                            onClick={() => respondToOffer('reject')}
                            disabled={submitting}
                            className="px-6 py-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {marketData && (
                <MarketBenchmarkWidget 
                  marketData={marketData}
                  offerPrice={lastOffer?.price_per_unit}
                />
              )}

              {marketData && (
                <DealGapIndicator
                  askPrice={negotiation.farmer_ask_price}
                  offerPrice={lastOffer?.price_per_unit}
                  benchmarkPrice={marketData.avg}
                />
              )}

              <div className="bg-white rounded-2xl border border-sage-100 p-5">
                <h3 className="font-semibold text-sage-900 mb-4">Session Rules</h3>
                <ul className="space-y-3 text-sm text-sage-600">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-xs font-medium text-sage-600 shrink-0">1</span>
                    <span>Maximum 3 rounds to reach agreement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-xs font-medium text-sage-600 shrink-0">2</span>
                    <span>Early agreements earn +5 reputation bonus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-xs font-medium text-sage-600 shrink-0">3</span>
                    <span>Offers 40%+ below market will be flagged</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
