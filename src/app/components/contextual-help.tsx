import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ContextualHelpProps {
  title: string;
  items: string[];
}

export function ContextualHelp({ title, items }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center hover:scale-110"
        aria-label="Show help"
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Help Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Popover Content */}
          <div className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-lg shadow-xl p-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-foreground">{title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close help"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
