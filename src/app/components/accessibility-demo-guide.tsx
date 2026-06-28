import { useState } from 'react';
import { Keyboard, Volume2, Eye, CheckCircle2, X, AlertCircle } from 'lucide-react';

export function AccessibilityDemoGuide() {
  // tracks which testing guide panel is currently open
  const [activeTest, setActiveTest] = useState<'keyboard' | 'screenreader' | 'aria' | null>(null);

  return (
    // main page container with full height background
    <div className="min-h-screen bg-background">
      {/* inner wrapper to keep the layout centered and maxed out at a readable width */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        
        {/* main intro header section */}
        <div className="text-center mb-8">
          {/* circle container for the top decorative icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Accessibility Demo & Testing Guide</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Step-by-step instructions to test and demonstrate accessibility features in Rooted
          </p>
        </div>

        {/* grid layout containing the 3 clickable cards to pick a testing mode */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* card 1: opens the keyboard shortcuts section */}
          <button
            onClick={() => setActiveTest('keyboard')}
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-all text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="View keyboard navigation testing guide"
          >
            <Keyboard className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Keyboard Navigation</h3>
            <p className="text-sm text-muted-foreground">Test full keyboard accessibility</p>
          </button>

          {/* card 2: opens the screen reader tools section */}
          <button
            onClick={() => setActiveTest('screenreader')}
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-all text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="View screen reader testing guide"
          >
            <Volume2 className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Screen Reader</h3>
            <p className="text-sm text-muted-foreground">Test screen reader compatibility</p>
          </button>

          {/* card 3: opens the aria inspection section */}
          <button
            onClick={() => setActiveTest('aria')}
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-all text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="View ARIA labels testing guide"
          >
            <Eye className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-2">ARIA Labels</h3>
            <p className="text-sm text-muted-foreground">Verify ARIA attributes</p>
          </button>
        </div>

        {/* conditional block that shows up when the user clicks keyboard navigation */}
        {activeTest === 'keyboard' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
            {/* dynamic panel header with close action */}
            <div className="bg-primary/10 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-foreground">Keyboard Navigation Testing</h2>
              </div>
              {/* x button resets active state to null which closes this panel */}
              <button
                onClick={() => setActiveTest(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close keyboard navigation guide"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            {/* keyboard steps panel body */}
            <div className="p-6 space-y-6">
              {/* blue alert notice for quick info before starting */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  Quick Test Instructions
                </h3>
                <p className="text-sm text-blue-800">
                  <strong>Before you start:</strong> Click anywhere on the page, then press <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">Tab</kbd> to begin. 
                  You should NOT need to use your mouse at all!
                </p>
              </div>

              {/* step by step list grid */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">Step-by-Step Testing:</h3>
                
                <div className="space-y-3">
                  {/* step 1 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Skip Link</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd> on the Home page. 
                        The first element should be a "Skip to main content" link (appears in top-left).
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Skip link appears and is focusable</span>
                      </div>
                    </div>
                  </div>

                  {/* step 2 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Navigate the Header</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Continue pressing <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd>. 
                        You should navigate through: Home → Browse → Deals → Favorites → My Businesses → Help → Sign In/Profile
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: All nav items have visible blue focus rings</span>
                      </div>
                    </div>
                  </div>

                  {/* step 3 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Activate Navigation Links</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        When focused on "Browse", press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Enter</kbd>. 
                        The Browse page should load.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Navigation works via keyboard only</span>
                      </div>
                    </div>
                  </div>

                  {/* step 4 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Filter Buttons</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        On Browse page, <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd> to category filter buttons (Food, Retail, etc.). 
                        Press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Enter</kbd> or <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Space</kbd> to toggle filters.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Filters toggle without mouse</span>
                      </div>
                    </div>
                  </div>

                  {/* step 5 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Business Cards</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd> to business cards and press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Enter</kbd> to open details.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Business details open via keyboard</span>
                      </div>
                    </div>
                  </div>

                  {/* step 6 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      6
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Modal Close with Escape</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        When a modal is open (e.g., review form), press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Esc</kbd> to close it.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Modals close with Esc key</span>
                      </div>
                    </div>
                  </div>

                  {/* step 7 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      7
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Form Navigation</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        On review form, use <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd> to navigate between rating stars, textarea, checkbox, and buttons. 
                        Use <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Space</kbd> to select checkboxes.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Forms are fully keyboard accessible</span>
                      </div>
                    </div>
                  </div>

                  {/* step 8 container */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      8
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Reverse Navigation</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Shift</kbd> + <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd> to navigate backwards through elements.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Success: Backward navigation works</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* green bottom card containing the quick compliance checklist items */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Keyboard Navigation Checklist</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Skip link appears on first Tab press</li>
                  <li>✓ All interactive elements have visible focus indicators (blue rings)</li>
                  <li>✓ Tab key moves focus forward through all elements</li>
                  <li>✓ Shift+Tab moves focus backward</li>
                  <li>✓ Enter key activates links and buttons</li>
                  <li>✓ Space key toggles checkboxes and some buttons</li>
                  <li>✓ Escape key closes modals and dialogs</li>
                  <li>✓ No keyboard traps (you can always navigate away)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* conditional block that shows up when user clicks screen reader section */}
        {activeTest === 'screenreader' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
            {/* dynamic panel header with close action */}
            <div className="bg-primary/10 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-foreground">Screen Reader Testing</h2>
              </div>
              {/* x button closes the screen reader pane */}
              <button
                onClick={() => setActiveTest(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close screen reader guide"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            {/* screen reader pane body details */}
            <div className="p-6 space-y-6">
              {/* blue context window listing required external tools */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  Screen Reader Setup
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  You'll need a screen reader installed to test. Here are free options:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Windows:</strong> NVDA (free) - nvaccess.org</li>
                  <li><strong>Mac:</strong> VoiceOver (built-in) - Cmd+F5 to enable</li>
                  <li><strong>Chrome:</strong> ChromeVox extension (free)</li>
                </ul>
              </div>

              {/* active interactive testing guide items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">How to Test with Screen Reader:</h3>
                
                <div className="space-y-3">
                  {/* step 1 box */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Enable Screen Reader</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>NVDA (Windows):</strong> Download from nvaccess.org and press Ctrl+Alt+N to start<br/>
                        <strong>VoiceOver (Mac):</strong> Press Cmd+F5<br/>
                        <strong>ChromeVox:</strong> Install from Chrome Web Store
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">You should hear audio announcements</span>
                      </div>
                    </div>
                  </div>

                  {/* step 2 box */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Navigate with Screen Reader</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Use Tab to move through the page. The screen reader should announce:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>"Skip to main content, link"</li>
                        <li>"Home, link" or "Browse, link"</li>
                        <li>"Compare businesses, button"</li>
                        <li>"Search businesses by name, category, or district, edit text"</li>
                      </ul>
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">All elements have descriptive announcements</span>
                      </div>
                    </div>
                  </div>

                  {/* step 3 box */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Headings Navigation</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Press <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">H</kbd> (in NVDA/JAWS) or <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Ctrl+Option+Cmd+H</kbd> (VoiceOver) to jump between headings.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Screen reader announces heading levels (H1, H2, H3)</span>
                      </div>
                    </div>
                  </div>

                  {/* step 4 box */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Form Labels</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Navigate to a review form. When focused on textarea, screen reader should announce: "Write your review, edit text, required"
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Form fields have proper labels</span>
                      </div>
                    </div>
                  </div>

                  {/* step 5 box */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Button States</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Navigate to filter buttons. Screen reader should announce: "Filter by Food, button, pressed" (if active) or "not pressed" (if inactive).
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Button states are announced (pressed/not pressed)</span>
                      </div>
                    </div>
                  </div>

                  {/* step 6 box */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      6
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Image Alt Text</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Navigate to business images. Screen reader should announce the business name or "Business photo" rather than "image" or filename.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Images have descriptive alt text</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* green bottom card containing screen reader metrics */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Screen Reader Support Checklist</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ All interactive elements are announced with their role (button, link, etc.)</li>
                  <li>✓ Descriptive labels provided via aria-label</li>
                  <li>✓ Button states announced (pressed/not pressed)</li>
                  <li>✓ Form fields have associated labels</li>
                  <li>✓ Images have alt text or are marked decorative</li>
                  <li>✓ Heading hierarchy is logical (H1 → H2 → H3)</li>
                  <li>✓ Modal dialogs are announced as "dialog"</li>
                  <li>✓ Decorative icons are hidden from screen readers (aria-hidden="true")</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* conditional block that shows up when user selects the aria options tab */}
        {activeTest === 'aria' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
            {/* dynamic panel header with close action */}
            <div className="bg-primary/10 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-foreground">ARIA Labels Verification</h2>
              </div>
              {/* x button closes the current aria panel context */}
              <button
                onClick={() => setActiveTest(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close ARIA labels guide"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            {/* instructional content panel body for developers */}
            <div className="p-6 space-y-6">
              {/* blue overview helper card explaining standard mechanics */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  What are ARIA Labels?
                </h3>
                <p className="text-sm text-blue-800">
                  ARIA (Accessible Rich Internet Applications) labels provide additional context to assistive technologies 
                  like screen readers, making the app more accessible to users with disabilities.
                </p>
              </div>

              {/* inspection breakdown sequence */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">How to Inspect ARIA Labels:</h3>
                
                <div className="space-y-3">
                  {/* devtools step 1 item */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Open Browser DevTools</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Right-click anywhere on the page and select "Inspect" (or press F12)
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">DevTools panel opens at bottom or side</span>
                      </div>
                    </div>
                  </div>

                  {/* devtools step 2 item */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Use Element Picker</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Click the element picker icon (top-left of DevTools, looks like a cursor in a box), then hover over buttons, links, or form fields on the page.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">HTML for that element highlights in DevTools</span>
                      </div>
                    </div>
                  </div>

                  {/* devtools step 3 item */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Look for ARIA Attributes</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        In the Elements tab, look for these attributes in the HTML:
                      </p>
                      {/* list outlining the actual attributes inside the inspector */}
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li><code className="bg-background px-1 py-0.5 rounded text-xs">aria-label="..."</code> - Descriptive label</li>
                        <li><code className="bg-background px-1 py-0.5 rounded text-xs">aria-pressed="true"</code> - Toggle state</li>
                        <li><code className="bg-background px-1 py-0.5 rounded text-xs">aria-hidden="true"</code> - Hidden from screen readers</li>
                        <li><code className="bg-background px-1 py-0.5 rounded text-xs">aria-expanded="true"</code> - Expandable sections</li>
                        <li><code className="bg-background px-1 py-0.5 rounded text-xs">role="dialog"</code> - Modal dialogs</li>
                        <li><code className="bg-background px-1 py-0.5 rounded text-xs">aria-modal="true"</code> - Modal state</li>
                      </ul>
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">These attributes provide context to screen readers</span>
                      </div>
                    </div>
                  </div>

                  {/* devtools step 4 item */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Test Specific Elements</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Examples of elements with ARIA labels in Rooted:
                      </p>
                      {/* sub-grid containing plain code element block examples */}
                      <div className="bg-background rounded-lg p-3 space-y-2 text-xs font-mono">
                        <div className="border-l-2 border-primary pl-2">
                          <div className="text-muted-foreground mb-1">Compare button:</div>
                          <code className="text-foreground">&lt;button aria-label="Compare businesses"&gt;</code>
                        </div>
                        <div className="border-l-2 border-primary pl-2">
                          <div className="text-muted-foreground mb-1">Search input:</div>
                          <code className="text-foreground">&lt;input aria-label="Search businesses by name, category, or district"&gt;</code>
                        </div>
{/* Example item for checking a filter button's aria attributes */}
                        <div className="border-l-2 border-primary pl-2">
                          <div className="text-muted-foreground mb-1">Filter button:</div>
                          <code className="text-foreground">&lt;button aria-label="Filter by Food" aria-pressed="true"&gt;</code>
                        </div>
                        {/* Example item showing how a purely decorative icon is hidden from screen readers */}
                        <div className="border-l-2 border-primary pl-2">
                          <div className="text-muted-foreground mb-1">Decorative icon:</div>
                          <code className="text-foreground">&lt;Search aria-hidden="true" /&gt;</code>
                        </div>
                      </div>
                      {/* Instructions caption reminder at the bottom of the code list */}
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Inspect these elements to verify ARIA attributes</span>
                      </div>
                    </div>
                  </div>

                  {/* Devtools step 5 item: inspecting via the specialized browser accessibility panel */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Use Accessibility Tree (Advanced)</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        In Chrome DevTools, click the "Accessibility" tab (next to "Styles"). This shows how assistive technologies see the element.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Shows computed accessibility properties and roles</span>
                      </div>
                    </div>
                  </div>

                  {/* Devtools step 6 item: running an automated lighthouse testing suite */}
                  <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      6
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Run Lighthouse Audit</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        In Chrome DevTools, go to "Lighthouse" tab → Check "Accessibility" → Click "Analyze page load". This generates an accessibility score and highlights issues.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                        <span className="text-green-700">Automated accessibility audit with recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Green evaluation checklist matching criteria for a successful aria design layout */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">ARIA Implementation Checklist</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>- All buttons have aria-label or visible text</li>
                  <li>- Interactive icons have descriptive aria-labels</li>
                  <li>- Decorative icons have aria-hidden="true"</li>
                  <li>- Toggle buttons use aria-pressed</li>
                  <li>- Expandable sections use aria-expanded</li>
                  <li>- Modals have role="dialog" and aria-modal="true"</li>
                  <li>- Form inputs have aria-label or associated &lt;label&gt;</li>
                  <li>- Search inputs describe their purpose</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card: Only renders when no active testing tab panel is currently open */}
        {!activeTest && (
          <div className="bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">Quick Testing Summary</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {/* Summary box for keyboard expectations */}
              <div className="bg-background rounded-lg p-4">
                <Keyboard className="w-8 h-8 text-primary mb-2" aria-hidden="true" />
                <h3 className="font-medium text-foreground mb-1">Keyboard</h3>
                <p className="text-muted-foreground text-xs">
                  Press Tab to navigate. All elements should have blue focus rings and work without a mouse.
                </p>
              </div>
              {/* Summary box for screen reader setup */}
              <div className="bg-background rounded-lg p-4">
                <Volume2 className="w-8 h-8 text-primary mb-2" aria-hidden="true" />
                <h3 className="font-medium text-foreground mb-1">Screen Reader</h3>
                <p className="text-muted-foreground text-xs">
                  Enable NVDA, VoiceOver, or ChromeVox. Every element should announce its purpose clearly.
                </p>
              </div>
              {/* Summary box for verifying aria hooks via developer tools */}
              <div className="bg-background rounded-lg p-4">
                <Eye className="w-8 h-8 text-primary mb-2" aria-hidden="true" />
                <h3 className="font-medium text-foreground mb-1">ARIA Labels</h3>
                <p className="text-muted-foreground text-xs">
                  Use browser DevTools (F12) to inspect elements and verify aria-label attributes exist.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
