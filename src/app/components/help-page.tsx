import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, Mail, Phone, BookOpen, X, Send, Eye } from 'lucide-react';

export function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'navigation'>('overview');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: 'Hi! I\'m your Rooted assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const navigateToAccessibility = () => {
    // Trigger navigation to accessibility page
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'accessibility' } }));
  };

  // Extensive keyword-response database
  const keywordResponses: Array<{ keywords: string[], response: string }> = [
    // Finding & Browsing
    { keywords: ['find', 'search', 'look', 'locate', 'where', 'discover', 'explore', 'browse', 'searching', 'looking for', 'how to find', 'where can i', 'locate a', 'find a', 'lookup', 'seek'], response: 'To find businesses, go to the Browse page. You can use the search bar, apply filters by category, district, price range, or rating, and toggle between Map View and List View to find exactly what you\'re looking for!' },
    { keywords: ['map', 'location', 'pin', 'navigate', 'directions', 'where is', 'locations', 'places', 'pins', 'map view', 'geographical', 'gps', 'coordinates', 'address'], response: 'Our interactive map shows all business locations. Green pins indicate businesses with active deals, while blue pins are standard businesses. Click any pin to see business details!' },
    { keywords: ['filter', 'sort', 'category', 'organize', 'narrow', 'refine', 'order by', 'arrange', 'filtering', 'sorting', 'categories', 'organize by', 'narrow down', 'refine search', 'search options'], response: 'Use our powerful filtering system on the Browse page! Filter by categories (Food, Retail, Health, Entertainment, Personal Care, Services, Home, Other), districts (9 districts available), price ranges ($0-10, $10-20, $20-35, $35+), and minimum rating. You can also sort by highest rated, most reviewed, or deals.' },
    { keywords: ['district', 'area', 'neighborhood', 'zone', 'region', 'districts', 'areas', 'neighborhoods', 'zones', 'regions', 'location area', 'part of town', 'side of town'], response: 'Rooted covers 9 districts in Brookhaven: Downtown, North, South, East, West, Northeast, Northwest, Southeast, and Southwest. Filter by district on the Browse page to find businesses in your preferred area!' },
    
    // Reviews & Ratings
    { keywords: ['review', 'rating', 'star', 'comment', 'feedback', 'write review', 'post review', 'leave review', 'add review', 'submit review', 'rate', 'rate business', 'give rating', 'write a review', 'post a review', 'provide feedback', 'share opinion', 'tell about', 'experience', 'testimonial'], response: 'To leave a review: 1) Click on any business to view its detail page, 2) Click the \"Leave a Review\" button, 3) Select a star rating (1-5 stars), 4) Write your review (minimum 10 characters), and 5) Check the verification checkbox. Your reviews are linked to your account and help the community!' },
    { keywords: ['edit review', 'change review', 'update review', 'delete review', 'modify review', 'remove review', 'erase review', 'fix review', 'revise review', 'alter review'], response: 'Currently, reviews cannot be edited or deleted after submission. Please make sure your review is accurate before submitting. Contact support if you need assistance with a review.' },
    { keywords: ['rating system', 'stars', '5 star', 'how rating works', 'star rating', 'ratings work', 'rating scale', 'what do stars mean', 'star system'], response: 'Our rating system uses a 5-star scale where 1 star = poor, 2 stars = fair, 3 stars = good, 4 stars = very good, and 5 stars = excellent. The overall business rating is calculated as the average of all user reviews.' },
    
    // Favorites
    { keywords: ['favorite', 'save', 'bookmark', 'like', 'heart', 'favorites', 'saving', 'bookmarking', 'liking', 'love', 'loved', 'liked', 'saved', 'bookmarked', 'favoriting', 'add to favorites', 'mark as favorite', 'keep', 'store', 'remember', 'save for later', 'want to remember', 'like a business', 'heart a business'], response: 'To save a business to your favorites, click the heart icon on the business detail page. The heart will turn red to show it\'s saved. Access all your favorites from the Favorites page in the navigation menu. Favorites are stored in your account and persist across sessions!' },
    { keywords: ['remove favorite', 'unfavorite', 'delete favorite', 'unlike', 'unsave', 'remove from favorites', 'take out of favorites', 'delete from favorites', 'remove like', 'unheart', 'remove bookmark'], response: 'To remove a favorite, click the filled red heart icon on the business detail page or in your Favorites list. The heart will become hollow, indicating the business has been removed from your favorites.' },
    { keywords: ['favorites page', 'saved businesses', 'my favorites', 'liked businesses', 'bookmarked businesses', 'my saved', 'my likes', 'favorited businesses', 'what i saved', 'what i liked', 'see favorites', 'view favorites', 'access favorites'], response: 'The Favorites page shows all businesses you\'ve saved. You can quickly access this page from the navigation menu. Your favorites are synced with your account and available on any device where you\'re signed in!' },
    
    // Deals
    { keywords: ['deal', 'deals', 'discount', 'discounts', 'offer', 'offers', 'promotion', 'promotions', 'special', 'specials', 'sale', 'coupon', 'coupons', 'savings', 'promo'], response: 'Check out the Deals page to see all active promotions and special offers from local businesses! You can filter deals by category and see expiration dates. Businesses with active deals also appear with a green tag on the Browse page and green pins on the map!' },
    { keywords: ['add deal', 'create deal', 'post deal', 'upload deal', 'make deal', 'new deal', 'manage deal', 'edit deal', 'delete deal', 'remove deal'], response: 'Business owners can add and manage deals from the My Businesses page! Click on your business, then use the Deal Manager to create, edit, or delete promotional offers. Each deal includes a description and expiration date!' },
    { keywords: ['find deals', 'see deals', 'where deals', 'active deals', 'current deals', 'available deals', 'deals near me', 'deals nearby', 'how to find deals'], response: 'You can find active deals in three ways: 1) Visit the Deals page to see all current offers, 2) Look for the green "Active Deal" tags on business cards in the Browse page, or 3) Check the map view where green pins indicate businesses with active deals!' },
    { keywords: ['expiration', 'expire', 'expires', 'expired', 'expiration date', 'valid until', 'deal ends', 'when expire', 'how long', 'deal expiration'], response: 'Each deal shows its expiration date so you know how long you have to take advantage of the offer! Expired deals are automatically hidden from the Deals page. Business owners can set custom expiration dates when creating or editing deals.' },
    { keywords: ['deals page', 'view all deals', 'all deals', 'deals list', 'browse deals', 'deal categories'], response: 'The Deals page shows all active promotions across all businesses in Brookhaven! Use the category filter to narrow down deals by type (Food, Retail, Health, etc.). Click on any deal to see the full business details!' },
    
    // Account & Authentication
    { keywords: ['sign in', 'login', 'log in', 'sign up', 'register', 'account', 'create account', 'signin', 'signup', 'logging in', 'signing up', 'registration', 'join', 'joining', 'new account', 'make account', 'get account', 'user account', 'profile', 'membership'], response: 'Create an account or sign in by clicking the \"Sign In\" button in the navigation bar. You\'ll need to provide your name, email, and password. Having an account lets you save favorites, leave reviews, and manage your businesses!' },
    { keywords: ['logout', 'sign out', 'log out', 'signout', 'logging out', 'signing out', 'leave', 'exit', 'close account', 'end session'], response: 'To sign out, click on your profile name in the navigation bar and select \"Sign Out\" from the dropdown menu. Your favorites and account data will be saved and available when you sign back in.' },
    { keywords: ['forgot password', 'reset password', 'password recovery', 'forgotten password', 'lost password', 'recover password', 'cant remember password', 'password help', 'retrieve password'], response: 'To reset your password, click the \"Forgot Password?\" link on the sign-in page. Enter your email address and you\'ll receive instructions to create a new password. Make sure to check your spam folder if you don\'t see the email!' },
    { keywords: ['change password', 'update password', 'new password', 'modify password', 'edit password', 'set new password'], response: 'To change your password, go to your Account Settings page and click \"Change Password.\" You\'ll need to enter your current password and your new password twice for confirmation.' },
    
    // My Businesses (Business Owners)
    { keywords: ['add business', 'my business', 'upload business', 'create business', 'list business', 'my businesses', 'add a business', 'submit business', 'post business', 'register business', 'own business', 'business owner', 'i own', 'i have a business', 'listing', 'business listing', 'put my business', 'get listed'], response: 'Business owners can add their business via the \"My Businesses\" page! Click \"Add New Business\" and fill out the form with your business details including name, category, description, contact info, hours, and pricing. You can also upload photos and create deals!' },
    { keywords: ['edit business', 'update business', 'change business info', 'modify business', 'update info', 'change info', 'edit info', 'change details', 'update details', 'edit details', 'fix business info'], response: 'To edit your business, go to the My Businesses page, find your business in the list, and click the \"Edit\" button. You can update any information including photos, hours, contact details, and deals.' },
    { keywords: ['delete business', 'remove business', 'erase business', 'take down business', 'unlist business', 'delist business', 'remove listing'], response: 'To delete a business listing, go to My Businesses, click the three-dot menu next to your business, and select \"Delete.\" This action is permanent and will remove all associated reviews and data.' },
    { keywords: ['upload image', 'add photo', 'business photo', 'picture', 'upload photo', 'add image', 'add picture', 'photos', 'images', 'pictures', 'upload pictures', 'business image', 'business pictures'], response: 'When adding or editing a business, you can upload photos from your computer. Click the \"Upload Image\" button, select your image file (JPG, PNG, or GIF), and it will be stored securely with your business listing!' },
    { keywords: ['business hours', 'operating hours', 'open hours', 'schedule', 'opening hours', 'hours of operation', 'when open', 'opening time', 'closing time', 'work hours', 'store hours'], response: 'You can add your business operating hours when creating or editing your business. Specify hours for each day of the week. Customers can see your hours on your business detail page to know when you\'re open!' },
    
    // Categories
    { keywords: ['food', 'restaurant', 'cafe', 'dining', 'eat', 'coffee', 'bakery', 'breakfast', 'lunch', 'dinner', 'eating', 'restaurants', 'cafes', 'eatery', 'eateries'], response: 'The Food category includes restaurants, cafes, coffee shops, bakeries, and other dining establishments. Filter by \"Food\" on the Browse page to see all food businesses!' },
    { keywords: ['retail', 'shop', 'store', 'shopping', 'boutique', 'stores', 'shops', 'boutiques', 'buy', 'purchase', 'shopping center'], response: 'The Retail category includes shops, boutiques, stores, and other retail establishments. Browse retail businesses by selecting \"Retail\" in the category filter!' },
    { keywords: ['health', 'wellness', 'medical', 'doctor', 'fitness', 'gym', 'healthcare', 'medicine', 'clinic', 'hospital', 'doctors', 'gyms', 'exercise', 'workout'], response: 'The Health category covers medical services, wellness centers, gyms, fitness studios, and healthcare providers. Filter by \"Health\" to find health and wellness businesses!' },
    { keywords: ['entertainment', 'fun', 'activities', 'events', 'recreation', 'things to do', 'activity', 'event', 'play', 'enjoy'], response: 'Entertainment businesses include venues for activities, events, recreation, and fun experiences. Use the \"Entertainment\" filter to discover entertainment options!' },
    { keywords: ['personal care', 'salon', 'spa', 'barber', 'beauty', 'hair', 'nails', 'haircut', 'hairstyle', 'manicure', 'pedicure', 'massage'], response: 'Personal Care includes salons, spas, barbershops, nail salons, and other beauty and grooming services. Filter by \"Personal Care\" to find these businesses!' },
    { keywords: ['service', 'services', 'repair', 'professional', 'fix', 'fixing', 'repairs', 'professionals', 'professional services'], response: 'The Services category covers professional services, repairs, and specialized service providers. Select \"Services\" in the filter to see service businesses!' },
    { keywords: ['home', 'furniture', 'decor', 'household', 'house', 'furnishing', 'decoration', 'interior', 'home improvement', 'home goods'], response: 'The Home category includes furniture stores, home decor, household goods, and home improvement businesses. Filter by \"Home\" to browse these options!' },
    
    // Price & Budget
    { keywords: ['price', 'cost', 'expensive', 'cheap', 'affordable', 'budget', 'pricing', 'costs', 'prices', 'how much', 'money', 'spend', 'spending', 'inexpensive', 'low cost', 'high cost', 'price range'], response: 'We use average price ranges to help you budget: $0-10 (budget-friendly), $10-20 (moderate), $20-35 (upscale), and $35+ (premium). Filter by price range on the Browse page to find businesses that fit your budget!' },
    { keywords: ['dollar sign', 'pricing', 'how much', '$', 'dollars', 'price tag', 'what does it cost'], response: 'Average prices are shown on each business card (e.g., ~$15). This represents the typical cost per person for that business. You can filter by specific price ranges to find businesses within your budget!' },
    
    // Comparison
    { keywords: ['compare', 'comparison', 'versus', 'vs', 'difference', 'comparing', 'compare businesses', 'side by side', 'which is better', 'difference between', 'similarities', 'contrast'], response: 'Use the Compare feature on the Browse page! Click the \"Compare\" button, select two businesses from the dropdowns, and view side-by-side comparisons of ratings, reviews, prices, and more. You can even export the comparison as a PDF!' },
    { keywords: ['pdf', 'export', 'download', 'save comparison', 'print', 'export pdf', 'download pdf', 'save as pdf', 'create pdf', 'generate pdf'], response: 'You can export PDFs in three places: 1) After comparing two businesses on the Browse page, click \"Export as PDF\" to download a comparison report. 2) On the Favorites page, click \"Export PDF\" to download a list of all your favorite businesses. 3) On the My Businesses page, click \"Export PDF\" to download your business portfolio with all active deals!' },
    { keywords: ['export favorites', 'download favorites', 'save favorites', 'favorites pdf', 'print favorites', 'export my favorites'], response: 'On the Favorites page, you\'ll find an \"Export PDF\" button in the Favorites Summary section. This downloads a professional PDF report containing all your saved businesses with their ratings, reviews, descriptions, addresses, and deal information!' },
    { keywords: ['export businesses', 'export my businesses', 'download my businesses', 'business portfolio', 'print businesses', 'my business pdf'], response: 'On the My Businesses page, click the \"Export PDF\" button in the header to download your complete business portfolio. The PDF includes all your business listings with details, contact information, and active deals - perfect for sharing or record keeping!' },
    
    // Navigation & Pages
    { keywords: ['home page', 'homepage', 'main page', 'start', 'starting page', 'home screen', 'main screen', 'landing page'], response: 'The Home page is your starting point! It features highlighted businesses, active deals, and quick category access. Click \"Home\" in the navigation menu to return to the homepage anytime.' },
    { keywords: ['browse page', 'browse', 'explore', 'all businesses', 'business list', 'see all', 'view all', 'full list'], response: 'The Browse page lets you explore all businesses with powerful filters and sorting. Toggle between Map View and List View, use filters, and click any business to see full details!' },
    { keywords: ['navigation', 'menu', 'navbar', 'how to navigate', 'navigate', 'get around', 'move around', 'navigation bar', 'top menu'], response: 'Use the navigation bar at the top to access: Home, Browse, Deals, Favorites, My Businesses, and Help. Click your profile name to access Account Settings or Sign Out!' },
    
    // Technical & Support
    { keywords: ['bug', 'error', 'not working', 'broken', 'problem', 'issue', 'glitch', 'crash', 'crashed', 'freeze', 'frozen', 'stuck', 'doesnt work', 'wont work', 'cant', 'cannot'], response: 'I\'m sorry you\'re experiencing an issue! Please try refreshing the page first. If the problem persists, contact our support team with details about what\'s not working, and we\'ll help you resolve it quickly.' },
    { keywords: ['security', 'privacy', 'data', 'safe', 'secure', 'protected', 'protection', 'private', 'confidential', 'safety', 'is it safe', 'secure data'], response: 'Your data is secure! Favorites and reviews are stored securely with your account using Supabase authentication. We don\'t share your personal information, and all form inputs are validated for security.' },
    { keywords: ['mobile', 'phone', 'tablet', 'responsive', 'smartphone', 'iphone', 'android', 'ipad', 'cell phone', 'mobile device'], response: 'Rooted is fully responsive and works great on mobile phones, tablets, and desktop computers! The layout automatically adjusts for your device screen size for the best experience.' },
    { keywords: ['browser', 'chrome', 'firefox', 'safari', 'edge', 'browsers', 'web browser', 'internet explorer', 'which browser'], response: 'Rooted works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, make sure you\'re using the latest version of your browser!' },
    
    // Contact & Help
    { keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach', 'contact us', 'get help', 'customer support', 'customer service', 'assistance', 'assist', 'need help'], response: 'For additional support, check the FAQs on this Help page, browse the App Instructions, or contact our support team. We\'re here to help you make the most of Rooted!' },
    { keywords: ['hours', 'support hours', 'when available', 'availability', 'when can i', 'available when', 'support availability'], response: 'Our chatbot is available 24/7 to answer your questions! For human support, our team is available Monday-Friday, 9 AM - 5 PM EST. We typically respond to emails within 24 hours.' },
    
    // Miscellaneous
    { keywords: ['brookhaven', 'city', 'location', 'where', 'town', 'what city', 'which city', 'area served', 'coverage'], response: 'Rooted serves the Brookhaven community with 9 districts covering the entire city. All businesses listed are local to Brookhaven!' },
    { keywords: ['local', 'community', 'small business', 'support local', 'local business', 'neighborhood', 'locally owned', 'independent', 'mom and pop', 'small businesses'], response: 'Rooted\'s mission is to help you discover and support small, local businesses in Brookhaven! By using Rooted, you\'re helping strengthen your community and support independent business owners.' },
    { keywords: ['new', 'updates', 'features', "what's new", 'latest', 'recent', 'newest', 'update', 'new features', 'what changed', 'changes', 'improvements'], response: 'We regularly update Rooted with new features! Recent additions include the business comparison tool with PDF export, the interactive map with district filtering, and enhanced business owner tools for uploading businesses and managing deals.' },
    { keywords: ['thanks', 'thank you', 'awesome', 'great', 'helpful', 'appreciate', 'appreciated', 'perfect', 'excellent', 'wonderful'], response: 'You\'re very welcome! I\'m glad I could help. Feel free to ask if you have any other questions about Rooted!' },
    { keywords: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'yo', 'sup', 'whats up'], response: 'Hello! Welcome to Rooted\'s Interactive Q&A. I\'m here to answer any questions you have about using the app, finding businesses, leaving reviews, managing favorites, or anything else. What would you like to know?' },
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find matching response based on keywords
    for (const entry of keywordResponses) {
      if (entry.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return entry.response;
      }
    }
    
    // Default response if no keywords match
    return 'I\'m not sure I understand. Could you try rephrasing your question? You can ask about finding businesses, leaving reviews, saving favorites, viewing deals, managing your business, comparing businesses, or any other feature of Rooted!';
  };

  const faqs = [
    {
      question: 'How do I find businesses near me?',
      answer: 'Navigate to the Browse page using the navigation menu. You can switch between Map View and List View. The Map View shows business locations with pins - green pins indicate businesses with active deals, and blue pins are standard businesses. Click any pin or business card to see more details.'
    },
    {
      question: 'How do I filter and sort businesses?',
      answer: 'On the Browse page, click the \"Filters\" button to access sorting and filtering options. You can filter by category (Food, Retail, Services, Health, Entertainment) and sort by highest rated, most reviewed, or category. All filters update the results in real-time.'
    },
    {
      question: 'How do I leave a review?',
      answer: 'Click on any business to view its detail page, then click the \"Leave a Review\" button. You\'ll need to select a star rating (1-5 stars), write a review comment (minimum 10 characters), and verify that you\'re human using the checkbox. Real-time validation ensures all required fields are completed correctly.'
    },
    {
      question: 'How do I save businesses to my favorites?',
      answer: 'On any business detail page, click the heart icon in the top-right corner. The heart will fill with red to indicate the business is saved. Access all your favorites anytime from the Favorites page in the navigation menu. Favorites are saved locally and persist across sessions.'
    },
    {
      question: 'Where can I find deals and coupons?',
      answer: 'Visit the Deals page from the navigation menu to see all active promotions from local businesses. Each deal displays the offer details and expiration date. Deals expiring within 7 days are highlighted with a warning to help you act quickly. Click any deal to view the business details and contact information.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! Your favorites and preferences are stored locally in your browser. We don\'t collect personal information beyond what you voluntarily provide in reviews. All form inputs are validated to ensure data quality and security.'
    },
    {
      question: 'How can I contact a business?',
      answer: 'Each business detail page displays complete contact information including address, phone number, website (if available), and operating hours. Click the phone number to call directly, or visit their website for more information.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Help & Support</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of Rooted
          </p>
          
          {/* Instructions Button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Open app instructions"
          >
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            App Instructions
          </button>
          
          {/* Interactive Q&A Button */}
          <button
            onClick={() => setShowChatbot(true)}
            className="mt-4 ml-4 inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            aria-label="Open interactive Q&A chatbot"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Interactive Q&A
          </button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search help articles"
            />
          </div>
        </div>

        {/* UX Callout */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
          <p className="text-sm text-blue-900">
            <strong>Interactive Help:</strong> Search for any keywords and browse relevant FAQs to find the information you need.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
          <div className="p-4 bg-muted border-b border-border">
            <h2 className="font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div>
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No results found for "{searchQuery}". Try different keywords.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                
                return (
                  <div key={index} className="border-b border-border last:border-0">
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors text-left"
                      aria-expanded={isExpanded}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span className="font-medium text-foreground pr-4">{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      )}
                    </button>
                    {isExpanded && (
                      <div
                        id={`faq-answer-${index}`}
                        className="px-6 py-4 bg-accent/20 text-muted-foreground"
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowInstructions(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructions-title"
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 id="instructions-title" className="text-2xl font-bold text-foreground">
                Rooted App Instructions
              </h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close instructions"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-border bg-muted/30">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === 'benefits'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  How It Helps
                </button>
                <button
                  onClick={() => setActiveTab('navigation')}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === 'navigation'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Navigation Guide
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      What is Rooted?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Rooted is your comprehensive platform for discovering and supporting small, local businesses in Brookhaven. 
                      Our mission is to strengthen community connections by making it easy to find, review, and support the independent 
                      businesses that make your neighborhood unique. Whether you're searching for a new coffee shop, finding the perfect 
                      gift at a local boutique, or looking for community services, Rooted brings everything together in one place.
                    </p>
                  </section>

                  <section className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Getting Started</h3>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Create an account or sign in to access all features</li>
                      <li>Browse businesses on the Home or Browse page</li>
                      <li>Use filters and the map to find what you're looking for</li>
                      <li>Click on businesses to view details and reviews</li>
                      <li>Save favorites and leave reviews to help the community</li>
                      <li>Check the Deals page regularly for new promotions</li>
                    </ol>
                  </section>
                </div>
              )}

              {/* Benefits Tab */}
              {activeTab === 'benefits' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    How Rooted Helps You
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-foreground mb-1">Discover Local Businesses</h4>
                      <p className="text-muted-foreground text-sm">
                        Browse through our curated directory of 15+ local businesses across multiple categories including Food & Dining, 
                        Retail & Shopping, Services, Health & Wellness, and Entertainment.
                      </p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-foreground mb-1">Find Great Deals</h4>
                      <p className="text-muted-foreground text-sm">
                        Access exclusive deals and promotions from local businesses, helping you save money while supporting your community.
                      </p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-foreground mb-1">Make Informed Decisions</h4>
                      <p className="text-muted-foreground text-sm">
                        Read authentic reviews from community members and check ratings to find the best businesses for your needs.
                      </p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-foreground mb-1">Navigate with Ease</h4>
                      <p className="text-muted-foreground text-sm">
                        Use our interactive map to visualize business locations and find places near you in Brookhaven.
                      </p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-foreground mb-1">Support Your Favorites</h4>
                      <p className="text-muted-foreground text-sm">
                        Save your favorite businesses for quick access and share your experiences through reviews to help others.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tab */}
              {activeTab === 'navigation' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    App Navigation Guide
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">Home Page</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Your starting point featuring featured businesses, active deals, and quick access to popular categories.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>View highlighted businesses and current promotions</li>
                        <li>Access quick category filters</li>
                        <li>Get an overview of what's available in Brookhaven</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">Browse Page</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Explore all businesses with powerful filtering and sorting options.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li><strong>Map View:</strong> See businesses on an interactive map (green pins = active deals, blue pins = standard)</li>
                        <li><strong>List View:</strong> Browse businesses in a detailed card layout</li>
                        <li><strong>Filters:</strong> Click "Filters" to sort by rating, reviews, or category</li>
                        <li><strong>Categories:</strong> Filter by Food, Retail, Services, Health, or Entertainment</li>
                        <li>Click any business card to view full details</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">Business Detail Pages</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Get comprehensive information about each business.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>View business photos, ratings, and price range</li>
                        <li>See contact information (address, phone, website, hours)</li>
                        <li>Read customer reviews and ratings</li>
                        <li>Add to favorites using the heart icon</li>
                        <li>Leave your own review with the "Leave a Review" button</li>
                        <li>View active deals and promotions</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">Deals Page</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Find all current promotions and special offers in one place.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Browse all active deals from local businesses</li>
                        <li>See expiration dates (deals ending soon are highlighted)</li>
                        <li>Click any deal to view the business details</li>
                        <li>Filter deals by category</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">Favorites Page</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Access your saved businesses for quick reference.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>View all businesses you've favorited</li>
                        <li>Favorites are saved to your account and persist across sessions</li>
                        <li>Remove favorites by clicking the heart icon again</li>
                        <li>Quick access to your most-visited places</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">My Businesses</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Business owners can add and manage their listings.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Add your own business to the directory</li>
                        <li>Upload photos and business details</li>
                        <li>Create and manage deals/promotions</li>
                        <li>Update business information anytime</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-foreground mb-2">Leaving Reviews</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        Share your experiences to help the community.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Select a star rating (1-5 stars)</li>
                        <li>Write a detailed review (minimum 10 characters)</li>
                        <li>Verify you're human with the checkbox</li>
                        <li>Reviews are linked to your account</li>
                        <li>Help other community members make informed choices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className="text-center pt-6 mt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Need more help? Browse the FAQs below or reach out through the contact options.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Modal */}
      {showChatbot && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowChatbot(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-title"
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 id="chatbot-title" className="text-2xl font-bold text-foreground">
                Rooted Chatbot
              </h2>
              <button
                onClick={() => setShowChatbot(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close chatbot"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Chatbot Content */}
            <div className="px-6 py-6">
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${message.sender === 'user' ? 'bg-primary' : 'bg-gray-600'} text-white px-4 py-3 rounded-lg max-w-xl shadow-sm`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="mt-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        const userMessage = chatInput.trim();
                        const newMessages = [...chatMessages, { sender: 'user' as const, text: userMessage }];
                        setChatMessages(newMessages);
                        setChatInput('');
                        
                        // Bot response after a short delay
                        setTimeout(() => {
                          const botResponse = getBotResponse(userMessage);
                          setChatMessages([...newMessages, { sender: 'bot' as const, text: botResponse }]);
                        }, 500);
                      }
                    }}
                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-input bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Chat input"
                  />
                  <button
                    onClick={() => {
                      if (chatInput.trim()) {
                        const userMessage = chatInput.trim();
                        const newMessages = [...chatMessages, { sender: 'user' as const, text: userMessage }];
                        setChatMessages(newMessages);
                        setChatInput('');
                        
                        // Bot response after a short delay
                        setTimeout(() => {
                          const botResponse = getBotResponse(userMessage);
                          setChatMessages([...newMessages, { sender: 'bot' as const, text: botResponse }]);
                        }, 500);
                      }
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}