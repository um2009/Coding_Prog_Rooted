import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string | string[];
  className?: string;
}

export function HelpTooltip({ title, content, className = '' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const contentArray = Array.isArray(content) ? content : [content];

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="inline-flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="w-5 h-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-popover text-popover-foreground p-4 rounded-lg shadow-lg border border-border z-50 pointer-events-none">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            <div className="space-y-1.5">
              {contentArray.map((line, index) => (
                <p key={index} className="text-xs text-muted-foreground leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border"></div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-popover -mt-px"></div>
        </div>
      )}
    </div>
  );
}
