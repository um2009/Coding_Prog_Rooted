import { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock, Heart, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Business, Review } from '@/app/types/business';
import { formatDistanceToNow } from 'date-fns';
import { DealModal } from '@/app/components/deal-modal';
import { dataService } from '@/app/services/dataService';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Deal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  code?: string;
  expiry_date: string;
  active: boolean;
}

interface BusinessDetailProps {
  business: Business;
  reviews: Review[];
  isBookmarked: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
  onAddReview: () => void;
  user: { name: string; email: string } | null;
  onSignInClick: () => void;
}

export function BusinessDetail({
  business,
  reviews,
  isBookmarked,
  onBack,
  onToggleBookmark,
  onAddReview,
  user,
  onSignInClick
}: BusinessDetailProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'highest' | 'lowest'>('all');

  // Sort reviews based on filter
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewFilter === 'highest') {
      return b.rating - a.rating;
    } else if (reviewFilter === 'lowest') {
      return a.rating - b.rating;
    }
    return 0; // 'all' - keep original order
  });

  const displayReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  // Track page view interaction whenever a business detail page is opened
  useEffect(() => {
    const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a`;
    fetch(`${API_BASE}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ businessId: business.id })
    }).catch(() => {}); // fire-and-forget, silent failure
  }, [business.id]);

  // Load deals when component mounts or business changes
  useEffect(() => {
    if (business.has_deal) {
      loadDeals();
    }
  }, [business.id]);

  const loadDeals = async () => {
    setLoadingDeals(true);
    try {
      const dealsData = await dataService.getDeals(business.id);
      setDeals(dealsData);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleDealClick = () => {
    setShowDealsModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back to browse"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Back to Browse</span>
        </button>

        {/* Hero Image */}
        <div className="relative h-80 rounded-lg overflow-hidden mb-6 bg-muted">
          <img
            src={business.image_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          {business.has_deal && (
            <button
              onClick={handleDealClick}
              className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
              aria-label="View active deals"
            >
              <Tag className="w-5 h-5" aria-hidden="true" />
              <div>
                <div className="font-semibold">Active Deal!</div>
                <div className="text-sm opacity-90">Click to view details</div>
              </div>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{business.name}</h1>
              <div className="flex items-center gap-2">
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {business.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" aria-hidden="true" />
                  <span className="font-semibold">{business.rating}</span>
                  <span className="text-muted-foreground">({business.review_count} reviews)</span>
                </div>
              </div>
            </div>

            <button
              onClick={user ? onToggleBookmark : onSignInClick}
              className={`p-3 rounded-lg transition-colors ${
                user && isBookmarked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-label={user ? (isBookmarked ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to favorite'}
              aria-pressed={user && isBookmarked}
              title={user ? undefined : 'Sign in to add favorites'}
            >
              <Heart
                className="w-6 h-6"
                fill={user && isBookmarked ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
          </div>

          <p className="text-muted-foreground mb-6">{business.description}</p>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{business.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{business.phone}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {business.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm text-muted-foreground">Website</div>
                    <a href={`https://${business.website}`} className="font-medium text-primary hover:underline">
                      {business.website}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                  <div className="font-medium">{business.hours}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
            <button
              onClick={onAddReview}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              aria-label="Write a review"
            >
              Leave a Review
            </button>
          </div>

          {/* Filter Dropdown - Only show if there are reviews */}
          {reviews.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="review-filter" className="text-sm font-medium text-muted-foreground">
                Sort by:
              </label>
              <select
                id="review-filter"
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value as 'all' | 'highest' | 'lowest')}
                className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Filter reviews"
              >
                <option value="all">All Reviews</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No reviews yet. Be the first to review this business!</p>
              <button
                onClick={onAddReview}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                aria-label="Be the first to review"
              >
                Write First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayReviews.map((review) => (
                <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{review.user_name}</span>
                        {review.verified && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-600 fill-yellow-600'
                              : 'text-gray-300 fill-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}

              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full mt-4 flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  aria-label={showAllReviews ? 'Show fewer reviews' : 'Show all reviews'}
                  aria-expanded={showAllReviews}
                >
                  <span>
                    {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                  </span>
                  {showAllReviews ? (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Deal Modal */}
        {showDealsModal && (
          <DealModal
            deals={deals}
            businessName={business.name}
            user={user}
            onSignInClick={onSignInClick}
            onClose={() => setShowDealsModal(false)}
          />
        )}
      </div>
    </div>
  );
}