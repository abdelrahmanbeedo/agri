import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import MarketBenchmarkWidget from '../components/Negotiation/MarketBenchmarkWidget';
import DealGapIndicator from '../components/Negotiation/DealGapIndicator';
import OfferCard from '../components/Negotiation/OfferCard';
import ReputationBadge from '../components/Negotiation/ReputationBadge';
import {
  ArrowLeft, Package, Clock, Check, X, Send, AlertTriangle,
  Zap, ChevronRight, Calendar, CreditCard, Timer
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NegotiationPage() {
  const { negotiationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, isRTL } = useLanguage();

  const [negotiation, setNegotiation] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [nudge, setNudge] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [offerForm, setOfferForm] = useState({
    price_per_unit: '', quantity: '', delivery_date: '', payment_terms: 'cash', special_conditions: '', notes: ''
  });

  const [counterForm, setCounterForm] = useState({
    counter_price: '', counter_quantity: '', counter_delivery_date: '', counter_payment_terms: 'cash', message: ''
  });

  useEffect(() => { fetchNegotiation(); }, [negotiationId]);

  useEffect(() => {
    if (!negotiation?.expires_at || negotiation.status !== 'active') return;
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(negotiation.expires_at);
      const diff = expiry - now;
      if (diff <= 0) { setTimeLeft(0); fetchNegotiation(); clearInterval(interval); }
      else { setTimeLeft(diff); }
    }, 1000);
    return () => clearInterval(interval);
  }, [negotiation?.expires_at, negotiation?.status]);

  async function fetchNegotiation() {
    try {
      const res = await axios.get(`${API_URL}/api/negotiations/${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNegotiation(res.data.negotiation);
      setMarketData(res.data.marketData);
      setLastAnalysis(res.data.lastOffer?.analysis);
      if (res.data.lastOffer && user?.id === res.data.negotiation?.farmer_id?._id) setShowOfferForm(false);
    } catch (err) { console.error('Fetch negotiation error:', err); }
    finally { setLoading(false); }
  }

  async function submitOffer(e) {
    e.preventDefault();
    setSubmitting(true); setNudge(null);
    try {
      const res = await axios.post(`${API_URL}/api/negotiations/${negotiationId}/offer`, offerForm,
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.requireAcknowledgment) {
        const confirmed = window.confirm(res.data.message);
        if (confirmed) await axios.post(`${API_URL}/api/negotiations/${negotiationId}/offer`,
          { ...offerForm, acknowledged: true }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setLastAnalysis(res.data.analysis);
      setShowOfferForm(false);
      resetOfferForm();
      fetchNegotiation();
    } catch (err) {
      console.error('Submit offer error:', err);
      alert(err.response?.data?.error || err.response?.data?.msg || err.message || 'Failed to submit offer');
    } finally { setSubmitting(false); }
  }

  async function respondToOffer(action) {
    setSubmitting(true);
    try {
      if (action === 'counter') {
        const res = await axios.post(`${API_URL}/api/negotiations/${negotiationId}/respond`,
          { action: 'counter', ...counterForm }, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.nudge) setNudge(res.data.nudge);
        setShowCounterForm(false);
        resetCounterForm();
      } else if (action === 'accept') {
        const res = await axios.post(`${API_URL}/api/negotiations/${negotiationId}/respond`,
          { action: 'accept' }, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.early_bonus) setNudge({ type: 'early_bonus', message: res.data.message });
      } else if (action === 'reject') {
        if (!window.confirm('Are you sure you want to decline this offer?')) { setSubmitting(false); return; }
        await axios.post(`${API_URL}/api/negotiations/${negotiationId}/respond`,
          { action: 'reject' }, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchNegotiation();
    } catch (err) {
      console.error('Respond error:', err);
      alert(err.response?.data?.error || 'Failed to respond');
    } finally { setSubmitting(false); }
  }

  function resetOfferForm() {
    setOfferForm({ price_per_unit: '', quantity: negotiation?.farmer_ask_quantity || '',
      delivery_date: '', payment_terms: 'cash', special_conditions: '', notes: '' });
  }

  function resetCounterForm() {
    const lastOffer = negotiation?.offers[negotiation.offers.length - 1];
    setCounterForm({ counter_price: negotiation?.farmer_ask_price || '',
      counter_quantity: lastOffer?.quantity || '', counter_delivery_date: lastOffer?.delivery_date || '',
      counter_payment_terms: 'cash', message: '' });
  }

  if (loading) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-sage-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <p className="text-gray-500">Negotiation not found</p>
    </div>
  );

  const isTrader = user?.id === negotiation.trader_id?._id;
  const isFarmer = user?.id === negotiation.farmer_id?._id;
  const isMyTurn = (negotiation.current_turn === 'trader' && isTrader) || (negotiation.current_turn === 'farmer' && isFarmer);
  const roundsRemaining = negotiation.max_rounds - negotiation.current_round;
  const lastOffer = negotiation.offers.length > 0 ? negotiation.offers[negotiation.offers.length - 1] : null;
  const isDealConfirmed = negotiation.status === 'accepted';
  const isClosed = negotiation.status !== 'active';

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          {t('common.back')}
        </button>

        {isDealConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">{t('negotiation.dealConfirmed')}</h2>
                <p className="text-green-700">{t('negotiation.dealId')}: {negotiation.deal_id}</p>
                {negotiation.early_agreement_bonus && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> {t('negotiation.earlyBonus')}
                  </p>
                )}
              </div>
            </div>
            <Link to={`/orders/${negotiation.deal_id}`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
              {t('negotiation.viewOrder')} <ChevronRight className="w-4 h-4" />
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
                <h2 className="text-xl font-bold text-red-800">{t('negotiation.sessionClosed')}</h2>
                <p className="text-red-700">{negotiation.closed_reason === 'rejected' ? t('negotiation.offerDeclined') : t('negotiation.sessionExpired')}</p>
              </div>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isRTL ? 'text-right' : ''}`}>
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900">{t('negotiation.title')}</h1>
                <div className="flex items-center gap-3">
                  {timeLeft !== null && !isClosed && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${timeLeft < 300000 ? 'bg-red-50 text-red-600' : 'bg-sage-50/60 text-gray-600'}`}>
                      <Timer className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {timeLeft >= 3600000 && <>{Math.floor(timeLeft / 3600000)}{t('negotiation.hours')} </>}
                        {Math.floor((timeLeft % 3600000) / 60000)}{t('negotiation.minutes')} {Math.floor((timeLeft % 60000) / 1000)}{t('negotiation.seconds')}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isMyTurn && !isClosed ? 'bg-honey-50 text-honey-700' : 'bg-sage-50/60 text-gray-600'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{isClosed ? t('common.closed') : isMyTurn ? t('common.yourTurn') : t('common.waiting')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-sage-50/60 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">{t('negotiation.farmer')}</p>
                  <ReputationBadge profile={negotiation.farmer_id} />
                </div>
                <div className="p-4 bg-honey-50 rounded-xl">
                  <p className="text-sm text-honey-600 mb-1">{t('negotiation.trader')}</p>
                  <ReputationBadge profile={negotiation.trader_id} />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-sage-50/60 rounded-xl mb-6">
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                  {negotiation.product_id?.images?.[0] ? (
                    <img src={negotiation.product_id.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{negotiation.product_id?.title}</h3>
                  <p className="text-sm text-gray-500">{negotiation.product_id?.category}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('negotiation.asking')}: <span className="font-bold text-gray-900">{negotiation.farmer_ask_price} EGP</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('negotiation.round')} {negotiation.current_round} {t('negotiation.of')} {negotiation.max_rounds}</span>
                <span className="text-gray-600">{roundsRemaining} {t('negotiation.roundsRemaining')}</span>
              </div>
            </div>

            {/* Nudge */}
            {nudge && (
              <div className="bg-honey-50 border border-honey-200 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-honey-600 mt-0.5" />
                <p className="text-honey-800 font-medium">{nudge.message}</p>
              </div>
            )}

            {/* Offer history */}
            {negotiation.offers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t('negotiation.offerHistory')}</h3>
                {negotiation.offers.map((offer, index) => (
                  <OfferCard key={index} offer={offer}
                    party={offer.party.toString() === negotiation.farmer_id._id.toString() ? 'farmer' : 'trader'}
                    isLatest={index === negotiation.offers.length - 1}
                    analysis={index === negotiation.offers.length - 1 ? lastAnalysis : null} />
                ))}
              </div>
            )}

            {/* Action panel */}
            {isMyTurn && !isClosed && !isDealConfirmed && (
              <div className="card p-6">
                {negotiation.current_turn === 'trader' && isTrader && !showOfferForm && (
                  <button onClick={() => setShowOfferForm(true)}
                    className="w-full py-4 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> {t('negotiation.submitOffer')}
                  </button>
                )}

                {showOfferForm && (
                  <form onSubmit={submitOffer} className="space-y-4">
                    <h3 className="font-semibold text-gray-900">{t('negotiation.yourOffer')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('negotiation.pricePerUnit')} (EGP)</label>
                        <input type="number" step="0.01" value={offerForm.price_per_unit}
                          onChange={(e) => setOfferForm({ ...offerForm, price_per_unit: e.target.value })}
                          className="input" required />
                      </div>
                      <div>
                        <label className="label">{t('negotiation.quantity')}</label>
                        <input type="number" value={offerForm.quantity}
                          onChange={(e) => setOfferForm({ ...offerForm, quantity: e.target.value })}
                          className="input" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('negotiation.deliveryDate')}</label>
                        <input type="date" value={offerForm.delivery_date}
                          onChange={(e) => setOfferForm({ ...offerForm, delivery_date: e.target.value })}
                          className="input" required />
                      </div>
                      <div>
                        <label className="label">{t('negotiation.paymentTerms')}</label>
                        <select value={offerForm.payment_terms}
                          onChange={(e) => setOfferForm({ ...offerForm, payment_terms: e.target.value })}
                          className="select">
                          <option value="cash">{t('negotiation.cashOnDelivery')}</option>
                          <option value="credit">{t('negotiation.credit')}</option>
                          <option value="escrow">{t('negotiation.escrow')}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">{t('negotiation.notes')}</label>
                      <textarea value={offerForm.notes}
                        onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                        className="input resize-none" rows="2" />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowOfferForm(false)} className="btn btn-secondary flex-1">{t('common.cancel')}</button>
                      <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                        {submitting ? t('negotiation.submitting') : t('negotiation.submitOfferBtn')}
                      </button>
                    </div>
                  </form>
                )}

                {negotiation.current_turn === 'farmer' && isFarmer && lastOffer && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">{t('negotiation.responding')}</h3>
                    {showCounterForm ? (
                      <form onSubmit={(e) => { e.preventDefault(); respondToOffer('counter'); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">{t('negotiation.counterPrice')}</label>
                            <input type="number" step="0.01" value={counterForm.counter_price}
                              onChange={(e) => setCounterForm({ ...counterForm, counter_price: e.target.value })}
                              className="input" required />
                          </div>
                          <div>
                            <label className="label">{t('negotiation.quantity')}</label>
                            <input type="number" value={counterForm.counter_quantity}
                              onChange={(e) => setCounterForm({ ...counterForm, counter_quantity: e.target.value })}
                              className="input" />
                          </div>
                        </div>
                        <div>
                          <label className="label">{t('negotiation.notes')}</label>
                          <textarea value={counterForm.message}
                            onChange={(e) => setCounterForm({ ...counterForm, message: e.target.value })}
                            className="input resize-none" rows="2" />
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setShowCounterForm(false)} className="btn btn-secondary flex-1">{t('common.cancel')}</button>
                          <button type="submit" disabled={submitting} className="btn flex-1 bg-honey-500 text-white hover:bg-honey-600 border-none">
                            {submitting ? t('negotiation.sending') : t('negotiation.sendCounter')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => respondToOffer('accept')} disabled={submitting}
                          className="btn flex-1 bg-green-600 text-white hover:bg-green-700 border-none shadow-sm">
                          <Check className="w-5 h-5" /> {t('negotiation.acceptOffer')}
                        </button>
                        <button onClick={() => { resetCounterForm(); setShowCounterForm(true); }} disabled={submitting}
                          className="btn flex-1 bg-honey-500 text-white hover:bg-honey-600 border-none shadow-sm">
                          <Zap className="w-5 h-5" /> {t('negotiation.counter')}
                        </button>
                        <button onClick={() => respondToOffer('reject')} disabled={submitting}
                          className="btn btn-danger">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {marketData && <MarketBenchmarkWidget marketData={marketData} offerPrice={lastOffer?.price_per_unit} />}
            {marketData && (
              <DealGapIndicator askPrice={negotiation.farmer_ask_price} offerPrice={lastOffer?.price_per_unit} benchmarkPrice={marketData.avg} />
            )}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">{t('negotiation.sessionRules')}</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">1</span>
                  <span>{t('negotiation.maxRounds')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">2</span>
                  <span>{t('negotiation.earlyBonusRule')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">3</span>
                  <span>{t('negotiation.flaggedOffers')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
