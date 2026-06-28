import { Star, MapPin, DollarSign, Tag } from 'lucide-react';
import { Business } from '@/app/types/business';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  return (
    <div
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${business.name}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={business.image_url}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {business.has_deal && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
            <Tag className="w-4 h-4" aria-hidden="true" />
            <span>Deal</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {business.name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
            <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" aria-hidden="true" />
            <span className="text-sm font-semibold text-yellow-900">{business.rating}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {business.description}
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>{business.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">~${business.avg_price}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs bg-secondary px-3 py-1 rounded-full text-secondary-foreground font-medium">
            {business.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {business.review_count === 0 ? 'No reviews' : `${business.review_count} review${business.review_count === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>
    </div>
  );
}