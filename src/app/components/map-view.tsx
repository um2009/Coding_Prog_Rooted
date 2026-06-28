import { MapPin, Navigation } from 'lucide-react';
import { Business } from '@/app/types/business';

interface MapViewProps {
  businesses: Business[];
  onBusinessClick: (businessId: string) => void;
}

// Define the 9 districts in a 3x3 grid
const DISTRICTS = [
  ['Northwest', 'North', 'Northeast'],
  ['West', 'Downtown', 'East'],
  ['Southwest', 'South', 'Southeast']
];

export function MapView({ businesses, onBusinessClick }: MapViewProps) {
  // Group businesses by district
  const businessesByDistrict = businesses.reduce((acc, business) => {
    const district = business.district || 'Downtown';
    if (!acc[district]) acc[district] = [];
    acc[district].push(business);
    return acc;
  }, {} as Record<string, Business[]>);

  return (
    <div className="relative w-full bg-gray-50 rounded-lg border border-border overflow-hidden">
      {/* Map Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Brookhaven District Map</h2>
            <p className="text-sm text-muted-foreground">Explore businesses by neighborhood</p>
          </div>
          <button
            className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-border"
            aria-label="Center map on current location"
          >
            <Navigation className="w-5 h-5 text-foreground" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 3x3 Grid Map */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 max-w-5xl mx-auto">
          {DISTRICTS.flat().map((district, index) => {
            const districtBusinesses = businessesByDistrict[district] || [];
            const hasDeals = districtBusinesses.some(b => b.has_deal);
            const totalBusinesses = districtBusinesses.length;
            
            return (
              <div
                key={district}
                className="relative bg-white border-2 border-border rounded-lg p-4 hover:border-primary/50 transition-all aspect-square flex flex-col"
              >
                {/* District Header */}
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground text-sm">{district}</h3>
                  <p className="text-xs text-muted-foreground">
                    {totalBusinesses} {totalBusinesses === 1 ? 'business' : 'businesses'}
                  </p>
                </div>

                {/* Business Pins */}
                <div className="flex-1 relative min-h-0">
                  {districtBusinesses.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 h-full content-start">
                      {districtBusinesses.slice(0, 9).map((business) => (
                        <button
                          key={business.id}
                          onClick={() => onBusinessClick(business.id)}
                          className="group relative flex items-center justify-center"
                          aria-label={`View details for ${business.name}`}
                          title={business.name}
                        >
                          <MapPin
                            className={`w-6 h-6 transition-all group-hover:scale-125 ${
                              business.has_deal ? 'text-primary' : 'text-blue-600'
                            }`}
                            fill="currentColor"
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                      {districtBusinesses.length > 9 && (
                        <div className="col-span-3 text-center text-xs text-muted-foreground mt-1">
                          +{districtBusinesses.length - 9} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-muted-foreground italic">No businesses</p>
                    </div>
                  )}
                </div>

                {/* Deal Badge */}
                {hasDeals && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Deal!
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-border p-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-semibold text-foreground mb-2">Legend</div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" fill="currentColor" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">Has Active Deal</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" fill="currentColor" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">Standard Business</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}