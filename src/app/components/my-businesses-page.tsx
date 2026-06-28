import { Building2, Plus, Pencil, Trash2, Tag, Star, BarChart2 } from 'lucide-react';
import { Business } from '@/app/types/business';
import { Deal } from '@/app/services/dataService';
import { User } from '@/app/services/authService';
import { ContextualHelp } from './contextual-help';
import { BusinessAnalyticsModal } from './business-analytics-modal';
import { useState } from 'react';

interface MyBusinessesPageProps {
  businesses: Business[];
  deals: Deal[];
  user: User | null;
  onSignInClick: () => void;
  onBusinessClick: (businessId: string) => void;
  onAddBusiness: () => void;
  onEditBusiness: (business: Business) => void;
  onDeleteBusiness: (businessId: string) => void;
  onManageDeals: (businessId: string) => void;
}

export function MyBusinessesPage({
  businesses,
  deals,
  user,
  onSignInClick,
  onBusinessClick,
  onAddBusiness,
  onEditBusiness,
  onDeleteBusiness,
  onManageDeals
}: MyBusinessesPageProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to manage your businesses and deals
          </p>
          <button
            onClick={onSignInClick}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-primary" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-foreground">My Businesses</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your {businesses.length} business{businesses.length !== 1 ? 'es' : ''} and deals
            </p>
          </div>
          <div className="flex gap-2">
            {businesses.length > 0 && (
              <button
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="View business analytics"
              >
                <BarChart2 className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            )}
            <button
              onClick={onAddBusiness}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Add new business"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Add Business</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            <strong>Business Management:</strong> Add your small business to the Rooted directory. Share your story, 
            create special deals, and connect with the local community. All changes sync automatically to the database.
          </p>
        </div>

        {/* Empty State */}
        {businesses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Businesses Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by adding your first business to the Rooted directory
            </p>
            <button
              onClick={onAddBusiness}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span>Add Your First Business</span>
            </button>
          </div>
        ) : (
          /* Business List */
          <div className="space-y-4">
            {businesses.map((business) => {
              const businessDeals = deals.filter(d => d.business_id === business.id);
              
              return (
                <div
                  key={business.id}
                  className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="md:w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={business.image_url}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {business.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                              {business.category}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {business.district}
                            </span>
                            {business.has_deal && (
                              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                                <Tag className="w-3 h-3" aria-hidden="true" />
                                Active Deal
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditBusiness(business)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label={`Edit ${business.name}`}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onDeleteBusiness(business.id)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label={`Delete ${business.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Business Info */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" aria-hidden="true" />
                          <span className="font-semibold">{business.rating}</span>
                          <span>({business.review_count} reviews)</span>
                        </div>
                        <span>~${business.avg_price}</span>
                        <span>{business.hours}</span>
                      </div>

                      {/* Deals Section */}
                      <div className="bg-accent/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" aria-hidden="true" />
                          <span className="text-sm font-semibold">
                            {businessDeals.length} Active Deal{businessDeals.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => onManageDeals(business.id)}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Manage Deals
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contextual Help */}
        <ContextualHelp
          title="My Businesses Help"
          items={[
            'Click \"Add Business\" to register your small business in the Rooted directory',
            'Fill out all required fields: name, description, category, address ending with \"Brookhaven\", phone, and hours',
            'Use the edit icon (pencil) to update business information at any time',
            'Click \"Analytics\" to view page views, ratings, deals, and reviews for your businesses',
            'Click \"Manage Deals\" to create promotional offers for your business',
            'All changes are saved automatically to the database and appear immediately',
            'Delete a business using the trash icon - this action cannot be undone'
          ]}
        />
      </div>

      {showAnalytics && (
        <BusinessAnalyticsModal
          businesses={businesses}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
}