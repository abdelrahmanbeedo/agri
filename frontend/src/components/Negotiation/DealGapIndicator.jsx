export default function DealGapIndicator({ askPrice, offerPrice, benchmarkPrice }) {
  const minPrice = Math.min(askPrice, offerPrice || askPrice, benchmarkPrice) * 0.9;
  const maxPrice = Math.max(askPrice, offerPrice || askPrice, benchmarkPrice) * 1.1;
  const range = maxPrice - minPrice;

  const askPosition = ((askPrice - minPrice) / range) * 100;
  const offerPosition = offerPrice ? ((offerPrice - minPrice) / range) * 100 : null;
  const benchmarkPosition = ((benchmarkPrice - minPrice) / range) * 100;

  const gap = offerPrice ? Math.abs(askPrice - offerPrice) : 0;
  const gapPercent = ((gap / askPrice) * 100).toFixed(1);

  const getPositionColor = () => {
    if (!offerPrice) return 'bg-sage-300';
    const diff = Math.abs(askPrice - offerPrice) / askPrice;
    if (diff <= 0.05) return 'bg-green-500';
    if (diff <= 0.15) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLabelColor = () => {
    if (!offerPrice) return 'text-sage-600';
    const diff = Math.abs(askPrice - offerPrice) / askPrice;
    if (diff <= 0.05) return 'text-green-600';
    if (diff <= 0.15) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-sage-100 p-5">
      <h3 className="font-semibold text-sage-900 mb-4">Deal Gap</h3>
      
      <div className="relative h-8 mb-6">
        <div className="absolute inset-0 bg-sage-100 rounded-full" />
        
        {offerPosition !== null && (
          <div 
            className="absolute top-0 h-full transition-all duration-500"
            style={{ 
              left: `${Math.min(askPosition, offerPosition)}%`,
              width: `${Math.abs(offerPosition - askPosition)}%`
            }}
          >
            <div className={`absolute inset-0 ${getPositionColor()} opacity-30 rounded-full`} />
          </div>
        )}

        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-sage-600 rounded-full border-2 border-white shadow"
          style={{ left: `calc(${askPosition}% - 8px)` }}
          title={`Farmer Ask: ${askPrice}`}
        />
        
        {offerPosition !== null && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-honey-500 rounded-full border-2 border-white shadow"
            style={{ left: `calc(${offerPosition}% - 8px)` }}
            title={`Trader Offer: ${offerPrice}`}
          />
        )}

        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"
          style={{ left: `calc(${benchmarkPosition}% - 4px)` }}
          title={`Market Avg: ${benchmarkPrice}`}
        />
      </div>

      <div className="flex justify-between text-xs text-sage-500 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-sage-600 rounded-full" />
          <span>Farmer Ask</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span>Market Avg</span>
        </div>
        {offerPrice && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-honey-500 rounded-full" />
            <span>Your Offer</span>
          </div>
        )}
      </div>

      {offerPrice && (
        <div className={`text-center p-3 rounded-xl ${getLabelColor()} bg-opacity-10`}>
          <p className="font-semibold">
            Gap: {gap.toFixed(2)} EGP ({gapPercent}%)
          </p>
          {parseFloat(gapPercent) <= 5 && (
            <p className="text-sm mt-1">Very close to a deal!</p>
          )}
        </div>
      )}
    </div>
  );
}
