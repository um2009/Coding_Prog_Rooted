import { Home, MapPin, Heart, Building2, HelpCircle, User, LogIn, LogOut } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: { name: string; email: string } | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

export function Navigation({ currentPage, onPageChange, user, onAuthClick, onSignOut }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse', icon: MapPin },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'my-businesses', label: 'My Businesses', icon: Building2 },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 mr-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-extrabold">R</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Rooted</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Auth Button */}
            <div className="ml-auto pl-8">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex justify-around pb-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-md transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
            
            {/* Mobile Auth Button */}
            <button
              onClick={user ? onSignOut : onAuthClick}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-md transition-colors ${
                user ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label={user ? 'Sign Out' : 'Sign In'}
            >
              {user ? <LogOut className="w-5 h-5" aria-hidden="true" /> : <LogIn className="w-5 h-5" aria-hidden="true" />}
              <span className="text-xs">{user ? 'Sign Out' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}