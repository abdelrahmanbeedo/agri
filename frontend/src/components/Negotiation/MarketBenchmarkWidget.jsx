import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MarketBenchmarkWidget({ marketData, offerPrice }) {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const offerVsMarket = offerPrice 
    ? (((offerPrice - marketData.avg) / marketData.avg) * 100).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-sage-100 p-5">
      <h3 className="font-semibold text-sage-900 mb-4">Market Benchmark</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-sage-50 rounded-xl">
          <div>
            <p className="text-sm text-sage-500">Today's Avg Price</p>
            <p className="text-xl font-bold text-sage-900">
              {marketData.avg} EGP/{marketData.unit}
            </p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getTrendColor(marketData.trend)}`}>
            {getTrendIcon(marketData.trend)}
            <span className="text-sm font-medium">{marketData.trendPercent}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-sage-100 rounded-xl">
            <p className="text-xs text-sage-500 mb-1">Min</p>
            <p className="font-semibold text-sage-700">{marketData.min}</p>
          </div>
          <div className="p-3 border border-sage-100 rounded-xl">
            <p className="text-xs text-sage-500 mb-1">Max</p>
            <p className="font-semibold text-sage-700">{marketData.max}</p>
          </div>
        </div>

        {offerPrice && (
          <div className={`p-3 rounded-xl ${offerVsMarket > 0 ? 'bg-green-50' : offerVsMarket < 0 ? 'bg-red-50' : 'bg-sage-50'}`}>
            <p className="text-xs text-sage-500 mb-1">Your Offer vs Market</p>
            <p className={`font-semibold ${offerVsMarket > 0 ? 'text-green-600' : offerVsMarket < 0 ? 'text-red-600' : 'text-sage-700'}`}>
              {offerVsMarket > 0 ? '+' : ''}{offerVsMarket}% {offerVsMarket > 0 ? 'above' : 'below'} average
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-sage-100">
          <p className="text-xs text-sage-400">
            Source: {marketData.source || 'Regional Market Average'}
          </p>
        </div>
      </div>
    </div>
  );
}
