// Core React and page component imports for routing and application view management
import { useState, useEffect } from 'react';
import { Navigation } from './components/navigation';
import { HomePage } from './components/home-page';
import { BrowsePage } from './components/browse-page';
import { BusinessDetail } from './components/business-detail';
import { ReviewForm } from './components/review-form';
import { FavoritesPage } from './components/favorites-page';
import { MyBusinessesPage } from './components/my-businesses-page';
import { HelpPage } from './components/help-page';
import { AccessibilityPage } from './components/accessibility-page';
import { AccessibilityDemoGuide } from './components/accessibility-demo-guide';
import { SkipLink } from './components/skip-link';
import { AuthModal } from './components/auth-modal';
import { BusinessForm } from './components/business-form';
import { DealManager } from './components/deal-manager';
import { ConfirmationDialog } from './components/confirmation-dialog';
import { dataService, Deal } from './services/dataService';
import { authService, User } from './services/authService';
import type { Business, Review } from './types/business';

type Page = 'home' | 'browse' | 'favorites' | 'my-businesses' | 'help' | 'accessibility' | 'accessibility-demo';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // My Businesses state
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [managingDealsForBusinessId, setManagingDealsForBusinessId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    businessId: string;
    businessName: string;
  } | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const initAuth = async () => {
      // Wait for session to be restored/validated
      await authService.waitForSessionRestore();
      const currentUser = authService.getCurrentUser();
      
      // Only set user if session was successfully validated
      if (currentUser) {
        setUser(currentUser);
        console.log('Restored user session:', currentUser.email);
      } else {
        // Ensure user is null if session validation failed
        setUser(null);
        console.log('No valid session found');
      }
    };
    
    initAuth();
  }, []);

  // Periodic sync check: ensure React state matches authService state
  // This runs less frequently to avoid log spam
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const authUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      // If React thinks we have a user but authService says we don't
      if (user && !isAuth) {
        console.warn('State desync detected! React has user but authService does not.');
        console.warn('   This likely means the session was cleared due to validation failure.');
        console.warn('   Clearing React state to match...');
        setUser(null);
        setBookmarks([]);
      }
      
      // If authService has a user but React doesn't
      if (!user && isAuth && authUser) {
        console.warn('State desync detected! authService has user but React does not. Syncing...');
        setUser(authUser);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(syncInterval);
  }, [user]);

  // Load data after database is initialized
  useEffect(() => {
    loadData();
  }, []);

  // Load bookmarks when user changes
  useEffect(() => {
    if (user) {
      console.log('User logged in - loading bookmarks...');
      loadBookmarks();
    } else {
      console.log('User logged out - clearing bookmarks...');
      setBookmarks([]);
    }
  }, [user]);

  // Listen for custom navigation events from accessibility pages
  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ page: string }>;
      if (customEvent.detail?.page) {
        handlePageChange(customEvent.detail.page);
      }
    };

    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading businesses...');
      const businessesData = await dataService.getBusinesses();
      setBusinesses(businessesData);
      console.log(`Loaded ${businessesData.length} businesses`);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    // Check if user is authenticated via authService directly
    // Don't rely on React state which might not be updated yet
    if (!authService.isAuthenticated()) {
      console.log('loadBookmarks: Not authenticated, clearing bookmarks');
      setBookmarks([]);
      return;
    }
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.log('loadBookmarks: No current user, clearing bookmarks');
      setBookmarks([]);
      return;
    }
    
    try {
      console.log('loadBookmarks: Fetching for user:', currentUser.email);
      const bookmarksData = await dataService.getBookmarks();
      setBookmarks(bookmarksData);
      console.log(`Loaded ${bookmarksData.length} bookmarks for user ${currentUser.email}`);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarks([]);
    }
  };

  const loadBusinessReviews = async (businessId: string) => {
    try {
      const reviewsData = await dataService.getReviews(businessId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedBusinessId(null);
    setShowReviewForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBusinessClick = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setShowReviewForm(false);
    loadBusinessReviews(businessId);
  };

  const handleBackToBrowse = () => {
    setSelectedBusinessId(null);
    setShowReviewForm(false);
  };

  const handleToggleBookmark = async (businessId: string) => {
    // Require sign-in for bookmarking
    if (!user) {
      console.log('handleToggleBookmark: No user in React state, showing auth modal');
      setShowAuthModal(true);
      return;
    }
    
    // Double-check with authService to ensure session is still valid
    if (!authService.isAuthenticated()) {
      console.log('Session expired - clearing React state and showing auth modal');
      
      // Sync React state with authService - clear the stale React user
      setUser(null);
      setBookmarks([]);
      setShowAuthModal(true);
      return;
    }
    
    try {
      const wasBookmarked = bookmarks.includes(businessId);
      const newBookmarks = wasBookmarked
        ? bookmarks.filter(id => id !== businessId)
        : [...bookmarks, businessId];
      
      console.log(`${wasBookmarked ? 'Removed from' : 'Added to'} favorites:`, businessId);
      
      // Update local state optimistically
      setBookmarks(newBookmarks);
      
      // Save to server
      console.log('About to call dataService.saveBookmarks...');
      await dataService.saveBookmarks(newBookmarks);
      
      console.log('Bookmarks updated successfully. Total:', newBookmarks.length);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Check if this is a session expired error
      if (error instanceof Error && error.message.includes('Session expired')) {
        console.log('Session expired during bookmark save - showing auth modal');
        // Session was cleared by dataService, sync React state
        setUser(null);
        setBookmarks([]);
        setShowAuthModal(true);
        return;
      }
      
      // For other errors, show alert
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      alert(`Failed to save bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Revert optimistic update on error
      console.log('Reverting optimistic update, reloading bookmarks from server...');
      loadBookmarks();
    }
  };

  const handleAddReview = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (reviewData: { rating: number; comment: string }) => {
    if (!selectedBusinessId || !user) return;

    try {
      console.log('Submitting review...', { businessId: selectedBusinessId, userId: user.id, rating: reviewData.rating });
      
      const newReview = await dataService.addReview(
        selectedBusinessId,
        reviewData.rating,
        reviewData.comment
      );

      if (newReview) {
        console.log('Review submitted successfully:', newReview);
        setReviews(prev => [newReview, ...prev]);
        // Reload businesses to update ratings
        await loadData();
        // Also reload user businesses if on My Businesses page
        if (currentPage === 'my-businesses' && user) {
          await loadUserBusinesses();
        }
      }
      
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Show detailed error message
      let errorMessage = 'Failed to submit review. Please try again.';
      if (error instanceof Error) {
        // Check if this is a JWT/authentication error
        if (error.message.includes('401') || error.message.includes('JWT') || error.message.includes('Unauthorized')) {
          errorMessage = 'Your session has expired or is invalid. Please sign out and sign back in to continue.';
          
          // Optionally auto-signout
          if (confirm(errorMessage + '\n\nWould you like to sign out now?')) {
            await authService.signOut();
            setUser(null);
            setShowAuthModal(true);
            setShowReviewForm(false);
            return;
          }
        } else {
          errorMessage += `\n\nDetails: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleAuthSuccess = async (newUser: User) => {
    console.log('Auth success, setting user:', newUser.email);
    setUser(newUser);
    setShowAuthModal(false);
    
    // Wait a moment and verify auth state before loading bookmarks
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Loading bookmarks after successful auth...');
    console.log('Auth verification:', {
      userState: !!newUser,
      isAuthenticated: authService.isAuthenticated(),
      currentUser: authService.getCurrentUser()?.email,
      hasToken: !!authService.getAccessToken()
    });
    
    // Double check that we're authenticated before loading
    if (authService.isAuthenticated()) {
      await loadBookmarks();
    } else {
      console.error('User signed in but authService reports not authenticated!');
      console.error('This indicates a critical state synchronization issue');
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setBookmarks([]);
      // Optionally redirect to home
      setCurrentPage('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // My Businesses handlers
  const loadUserBusinesses = async () => {
    if (!user) return;
    try {
      const userBiz = await dataService.getUserBusinesses();
      setUserBusinesses(userBiz);
      
      // Load deals for all user businesses
      const deals = await dataService.getDeals();
      setAllDeals(deals);
    } catch (error) {
      console.error('Error loading user businesses:', error);
    }
  };

  useEffect(() => {
    if (user && currentPage === 'my-businesses') {
      loadUserBusinesses();
    }
  }, [user, currentPage]);

  const handleAddBusinessClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setEditingBusiness(null);
    setShowBusinessForm(true);
  };

  const handleEditBusinessClick = (business: Business) => {
    setEditingBusiness(business);
    setShowBusinessForm(true);
  };

  const handleDeleteBusinessClick = (businessId: string) => {
    const business = userBusinesses.find(b => b.id === businessId);
    if (business) {
      setDeleteConfirmation({
        businessId,
        businessName: business.name
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await dataService.deleteBusiness(deleteConfirmation.businessId);
      await loadUserBusinesses();
      await loadData(); // Reload all businesses
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business. Please try again.');
    }
  };

  const handleBusinessFormSubmit = async (businessData: Partial<Business>) => {
    try {
      if (editingBusiness) {
        await dataService.updateBusiness(editingBusiness.id, businessData);
      } else {
        await dataService.addBusiness(businessData as Omit<Business, 'id' | 'rating' | 'review_count' | 'has_deal'>);
      }
      await loadUserBusinesses();
      await loadData(); // Reload all businesses
      setShowBusinessForm(false);
      setEditingBusiness(null);
    } catch (error) {
      console.error('Error saving business:', error);
      alert('Failed to save business. Please try again.');
    }
  };

  const handleManageDealsClick = (businessId: string) => {
    setManagingDealsForBusinessId(businessId);
  };

  const handleAddDeal = async (dealData: Omit<Deal, 'id' | 'business_id'>) => {
    if (!managingDealsForBusinessId) return;
    
    try {
      console.log('Adding deal for business:', managingDealsForBusinessId);
      console.log('Deal data:', dealData);
      await dataService.addDeal(managingDealsForBusinessId, dealData);
      await loadUserBusinesses();
      await loadData(); // Reload all businesses to update has_deal flags
      console.log('Deal added successfully');
    } catch (error) {
      console.error('Error adding deal:', error);
      alert(`Failed to add deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateDeal = async (dealId: string, dealData: Partial<Deal>) => {
    try {
      console.log('Updating deal:', dealId);
      console.log('Deal data:', dealData);
      await dataService.updateDeal(dealId, dealData);
      await loadUserBusinesses();
      await loadData();
      console.log('Deal updated successfully');
    } catch (error) {
      console.error('Error updating deal:', error);
      alert(`Failed to update deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      console.log('Deleting deal:', dealId);
      await dataService.deleteDeal(dealId);
      await loadUserBusinesses();
      await loadData();
      console.log('Deal deleted successfully');
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert(`Failed to delete deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedBusiness = selectedBusinessId
    ? businesses.find(b => b.id === selectedBusinessId)
    : null;

  const bookmarkedBusinesses = businesses.filter(b => bookmarks.includes(b.id));

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Rooted...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to Main Content Link */}
      <SkipLink />
      
      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main id="main-content" className="pt-16" tabIndex={-1}>
        {/* Home Page */}
        {currentPage === 'home' && !selectedBusinessId && (
          <HomePage onNavigate={handlePageChange} businesses={businesses} />
        )}

        {/* Browse Page */}
        {currentPage === 'browse' && !selectedBusinessId && (
          <BrowsePage
            businesses={businesses}
            onBusinessClick={handleBusinessClick}
          />
        )}

        {/* Business Detail - Show on browse page when business is selected */}
        {currentPage === 'browse' && selectedBusinessId && selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            reviews={reviews}
            isBookmarked={bookmarks.includes(selectedBusinessId)}
            onBack={handleBackToBrowse}
            onToggleBookmark={() => handleToggleBookmark(selectedBusinessId)}
            onAddReview={handleAddReview}
            user={user}
            onSignInClick={() => setShowAuthModal(true)}
          />
        )}

        {/* Favorites Page */}
        {currentPage === 'favorites' && !selectedBusinessId && (
          <FavoritesPage
            businesses={bookmarkedBusinesses}
            onBusinessClick={handleBusinessClick}
            user={user}
            onSignInClick={() => setShowAuthModal(true)}
          />
        )}

        {/* Business Detail - Show on favorites page when business is selected */}
        {currentPage === 'favorites' && selectedBusinessId && selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            reviews={reviews}
            isBookmarked={bookmarks.includes(selectedBusinessId)}
            onBack={handleBackToBrowse}
            onToggleBookmark={() => handleToggleBookmark(selectedBusinessId)}
            onAddReview={handleAddReview}
            user={user}
            onSignInClick={() => setShowAuthModal(true)}
          />
        )}

        {/* My Businesses Page */}
        {currentPage === 'my-businesses' && !selectedBusinessId && (
          <MyBusinessesPage
            businesses={userBusinesses}
            deals={allDeals}
            user={user}
            onSignInClick={() => setShowAuthModal(true)}
            onBusinessClick={handleBusinessClick}
            onAddBusiness={handleAddBusinessClick}
            onEditBusiness={handleEditBusinessClick}
            onDeleteBusiness={handleDeleteBusinessClick}
            onManageDeals={handleManageDealsClick}
          />
        )}

        {/* Business Detail - Show on my businesses page when business is selected */}
        {currentPage === 'my-businesses' && selectedBusinessId && selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            reviews={reviews}
            isBookmarked={bookmarks.includes(selectedBusinessId)}
            onBack={handleBackToBrowse}
            onToggleBookmark={() => handleToggleBookmark(selectedBusinessId)}
            onAddReview={handleAddReview}
            user={user}
            onSignInClick={() => setShowAuthModal(true)}
          />
        )}

        {/* Help Page */}
        {currentPage === 'help' && (
          <HelpPage />
        )}

        {/* Accessibility Page */}
        {currentPage === 'accessibility' && (
          <AccessibilityPage />
        )}

        {/* Accessibility Demo Guide */}
        {currentPage === 'accessibility-demo' && (
          <AccessibilityDemoGuide />
        )}
      </main>

      {/* Auth Modal - You'll need to create this component */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedBusiness && user && (
        <ReviewForm
          businessName={selectedBusiness.name}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Business Form Modal */}
      {showBusinessForm && user && (
        <BusinessForm
          business={editingBusiness}
          onSubmit={handleBusinessFormSubmit}
          onCancel={() => setShowBusinessForm(false)}
        />
      )}

      {/* Deal Manager Modal */}
      {managingDealsForBusinessId && user && (
        <DealManager
          businessId={managingDealsForBusinessId}
          deals={allDeals.filter(d => d.business_id === managingDealsForBusinessId)}
          onAddDeal={handleAddDeal}
          onUpdateDeal={handleUpdateDeal}
          onDeleteDeal={handleDeleteDeal}
          onCancel={() => setManagingDealsForBusinessId(null)}
        />
      )}

      {/* Confirmation Dialog */}
      {deleteConfirmation && (
        <ConfirmationDialog
          title="Delete Business"
          message={`Are you sure you want to delete "${deleteConfirmation.businessName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
}
