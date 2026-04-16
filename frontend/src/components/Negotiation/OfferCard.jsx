import { Calendar, MapPin, CreditCard, Package, Clock, FileText } from 'lucide-react';

export default function OfferCard({ offer, party, isLatest = false, analysis = null }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentLabel = (terms) => {
    switch (terms) {
      case 'cash': return 'Cash on Delivery';
      case 'credit': return 'Credit (Later Payment)';
      case 'escrow': return 'Escrow Protected';
      default: return terms;
    }
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all ${isLatest ? 'bg-sage-50 border-sage-300' : 'bg-white border-sage-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            party === 'trader' ? 'bg-honey-500' : 'bg-sage-500'
          }`}>
            {party === 'trader' ? 'T' : 'F'}
          </div>
          <div>
            <p className="font-medium text-sage-900 capitalize">{party}</p>
            <p className="text-xs text-sage-500">{formatDate(offer.submitted_at)}</p>
          </div>
        </div>
        {isLatest && (
          <span className="px-2 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full">
            Latest
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-sage-500 mb-1">Price per Unit</p>
          <p className="text-xl font-bold text-sage-900">{offer.price_per_unit} EGP</p>
        </div>
        <div>
          <p className="text-sm text-sage-500 mb-1">Total Value</p>
          <p className="text-xl font-bold text-honey-600">{offer.total_value.toLocaleString()} EGP</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-sage-600">
          <Package className="w-4 h-4 text-sage-400" />
          <span>{offer.quantity} units</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-600">
          <Calendar className="w-4 h-4 text-sage-400" />
          <span>Delivery: {formatDate(offer.delivery_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-600">
          <CreditCard className="w-4 h-4 text-sage-400" />
          <span>{getPaymentLabel(offer.payment_terms)}</span>
        </div>
        {offer.delivery_address && (
          <div className="flex items-center gap-2 text-sm text-sage-600">
            <MapPin className="w-4 h-4 text-sage-400" />
            <span className="truncate">{offer.delivery_address}</span>
          </div>
        )}
        {offer.notes && (
          <div className="flex items-start gap-2 text-sm text-sage-600 pt-2 border-t border-sage-100">
            <FileText className="w-4 h-4 text-sage-400 mt-0.5" />
            <span>{offer.notes}</span>
          </div>
        )}
      </div>

      {analysis && (
        <div className={`p-4 rounded-xl ${
          analysis.isLowBall 
            ? 'bg-red-50 border border-red-100' 
            : analysis.position === 'very_close'
            ? 'bg-green-50 border border-green-100'
            : analysis.position === 'close'
            ? 'bg-amber-50 border border-amber-100'
            : 'bg-blue-50 border border-blue-100'
        }`}>
          <div className="flex items-start gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              analysis.isLowBall 
                ? 'bg-red-100 text-red-600' 
                : analysis.position === 'very_close'
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {analysis.isLowBall ? '!' : analysis.position === 'very_close' ? '✓' : 'i'}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                analysis.isLowBall ? 'text-red-800' : 'text-blue-800'
              }`}>
                {analysis.isLowBall ? 'Low Ball Offer' : 
                 analysis.position === 'very_close' ? 'Very Close to Agreement!' : 
                 'AI Analysis'}
              </p>
              <p className={`text-sm ${analysis.isLowBall ? 'text-red-700' : 'text-blue-700'}`}>
                {analysis.suggestion}
              </p>
              {analysis.position !== 'very_close' && !analysis.isLowBall && (
                <p className="text-xs text-blue-600 mt-1">
                  Suggested midpoint: {analysis.midpoint.toFixed(2)} EGP
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
