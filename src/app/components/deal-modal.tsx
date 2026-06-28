import { X, Tag, Copy, Check } from 'lucide-react';
import { useState } from 'react';

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

interface DealModalProps {
  deals: Deal[];
  businessName: string;
  onClose: () => void;
  user: { name: string; email: string } | null;
  onSignInClick: () => void;
}

export function DealModal({ deals, businessName, onClose, user, onSignInClick }: DealModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    // Use fallback method for better compatibility
    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedCode(code);
          setTimeout(() => setCopiedCode(null), 2000);
        }
      } catch (err) {
        console.error('Copy failed:', err);
      } finally {
        document.body.removeChild(textarea);
      }
    };

    // Try Clipboard API only if explicitly available and not blocked
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      } else {
        fallbackCopy();
      }
    } catch (error) {
      // Clipboard API failed (permissions, etc), use fallback
      fallbackCopy();
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-modal-title"
    >
      <div 
        className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 id="deal-modal-title" className="text-2xl font-bold text-foreground">
                Active Deals
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">{businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close deal modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Deals List */}
        <div className="p-6 space-y-4">
          {deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active deals available at this time.</p>
            </div>
          ) : (
            deals.map((deal) => (
              <div 
                key={deal.id}
                className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {deal.title}
                    </h3>
                    {deal.discount_percentage && (
                      <div className="inline-flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold mb-2">
                        {deal.discount_percentage}% OFF
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">
                  {deal.description}
                </p>

                {/* Coupon Code Section */}
                {deal.code && (
                  <>
                    {user ? (
                      <div className="bg-card rounded-lg p-4 border-2 border-dashed border-primary/30 mb-3">
                        <div className="text-sm text-muted-foreground mb-2 font-medium">
                          Coupon Code:
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-background px-4 py-3 rounded-lg border border-border">
                            <code className="text-lg font-mono font-bold text-primary tracking-wider">
                              {deal.code}
                            </code>
                          </div>
                          <button
                            onClick={() => handleCopyCode(deal.code!)}
                            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
                            aria-label={`Copy code ${deal.code}`}
                          >
                            {copiedCode === deal.code ? (
                              <>
                                <Check className="w-4 h-4" aria-hidden="true" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" aria-hidden="true" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-card rounded-lg p-4 border-2 border-dashed border-primary/30 mb-3">
                        <div className="text-center py-4">
                          <p className="text-muted-foreground mb-3">
                            Sign in to view and copy the coupon code
                          </p>
                          <button
                            onClick={() => {
                              onClose();
                              onSignInClick();
                            }}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                          >
                            Sign In to Get Code
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Expiry Date */}
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Expires:</span> {formatExpiryDate(deal.expiry_date)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}