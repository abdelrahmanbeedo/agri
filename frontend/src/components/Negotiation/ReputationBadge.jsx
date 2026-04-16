import { Star, BadgeCheck, AlertTriangle } from 'lucide-react';

export default function ReputationBadge({ profile, size = 'normal' }) {
  const sizeClasses = {
    small: 'text-xs',
    normal: 'text-sm',
    large: 'text-base'
  };

  const iconSize = {
    small: 'w-3 h-3',
    normal: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const badgeSize = {
    small: 'px-1.5 py-0.5 text-xs',
    normal: 'px-2 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm'
  };

  const rating = profile.rating || 4.5;
  const totalDeals = profile.totalDeals || 0;
  const isVerified = profile.verified || false;
  const disputes = profile.disputes || 0;

  const getRatingColor = () => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-sage-600';
    if (rating >= 3.0) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex flex-col gap-1 ${sizeClasses[size]}`}>
      <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
        <span className="font-medium text-sage-900">{profile.name}</span>
        {isVerified && (
          <BadgeCheck className={`${iconSize[size]} text-blue-500`} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1 ${getRatingColor()}`}>
          <Star className={`${iconSize[size]} fill-current`} />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
        
        <span className="text-sage-500">
          {totalDeals} deals
        </span>

        {disputes > 0 && (
          <div className={`flex items-center gap-1 text-red-500 ${badgeSize[size]} bg-red-50 rounded-full`}>
            <AlertTriangle className={iconSize[size]} />
            <span>{disputes} disputes</span>
          </div>
        )}

        {isVerified && (
          <span className={`${badgeSize[size]} bg-blue-50 text-blue-600 rounded-full font-medium`}>
            Verified
          </span>
        )}
      </div>
    </div>
  );
}
