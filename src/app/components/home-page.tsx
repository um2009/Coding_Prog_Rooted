import { MapPin, Star, Users, Tag, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { Business } from '@/app/types/business';

interface HomePageProps {
  onNavigate: (page: string) => void;
  businesses: Business[];
}

export function HomePage({ onNavigate, businesses }: HomePageProps) {
  // Calculate real stats from businesses data
  const totalBusinesses = businesses.length;
  const totalReviews = businesses.reduce((sum, business) => sum + business.review_count, 0);
  const totalActiveDeals = businesses.filter(business => business.has_deal).length;

  const stats = [
    { label: 'Local Businesses', value: totalBusinesses > 0 ? `${totalBusinesses}+` : '0' },
    { label: 'User Reviews', value: totalReviews > 0 ? (totalReviews >= 1000 ? `${(totalReviews / 1000).toFixed(1)}K+` : `${totalReviews}+`) : '0' },
    { label: 'Active Deals', value: totalActiveDeals > 0 ? `${totalActiveDeals}+` : '0' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-green-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">Supporting Businesses Since 2026</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold">
              Stay Rooted In
              <br />
              <span className="text-accent">Your Community</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Rooted helps you find, explore, and connect with small businesses in your community. 
              Support local, discover deals, and make your neighborhood thrive.
            </p>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => onNavigate('browse')}
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg"
                aria-label="Start browsing businesses"
              >
                Start Browsing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to plant your own root?</h2>
          <p className="text-lg mb-8 text-white/90">
            Add your business to Rooted and connect with your local community
          </p>
          <button
            onClick={() => onNavigate('my-businesses')}
            className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg"
            aria-label="Add your business"
          >
            Add Your Business
          </button>
        </div>
      </div>
    </div>
  );
}