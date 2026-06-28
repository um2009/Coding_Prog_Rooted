import { Eye, Keyboard, Mouse, Volume2, ZoomIn, Contrast, ScreenShare, CheckCircle2, PlayCircle } from 'lucide-react';

export function AccessibilityPage() {
  const navigateToDemoGuide = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'accessibility-demo' } }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Accessibility Features</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rooted is designed to be accessible to everyone. Learn about our accessibility features and how to use them.
          </p>
          
          {/* Demo Guide Button */}
          <button
            onClick={navigateToDemoGuide}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            aria-label="Open accessibility testing and demo guide"
          >
            <PlayCircle className="w-5 h-5" aria-hidden="true" />
            Test Accessibility Features
          </button>
        </div>

        {/* Feature Categories */}
        <div className="space-y-6">
          {/* Keyboard Navigation */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 bg-muted border-b border-border flex items-center gap-3">
              <Keyboard className="w-6 h-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">Keyboard Navigation</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                All interactive elements can be accessed and operated using a keyboard alone.
              </p>
              <div className="bg-accent/20 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-foreground mb-2">Keyboard Shortcuts:</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Tab</kbd>
                    <span className="text-muted-foreground">Move forward through interactive elements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Shift + Tab</kbd>
                    <span className="text-muted-foreground">Move backward through interactive elements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Enter</kbd>
                    <span className="text-muted-foreground">Activate buttons and links</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Space</kbd>
                    <span className="text-muted-foreground">Toggle checkboxes and buttons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Esc</kbd>
                    <span className="text-muted-foreground">Close modals and dialogs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Arrow Keys</kbd>
                    <span className="text-muted-foreground">Navigate within dropdown menus and lists</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-muted-foreground">
                  All keyboard focus states are clearly visible with a blue ring indicator.
                </p>
              </div>
            </div>
          </div>

          {/* Screen Reader Support */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 bg-muted border-b border-border flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">Screen Reader Support</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Rooted is compatible with popular screen readers including NVDA, JAWS, and VoiceOver.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Semantic HTML</h4>
                    <p className="text-sm text-muted-foreground">Proper heading hierarchy and landmark regions for easy navigation</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">ARIA Labels</h4>
                    <p className="text-sm text-muted-foreground">Descriptive labels on all interactive elements and form fields</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Live Regions</h4>
                    <p className="text-sm text-muted-foreground">Dynamic content updates are announced to screen reader users</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Alternative Text</h4>
                    <p className="text-sm text-muted-foreground">All images have descriptive alt text or are marked decorative</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Accessibility */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 bg-muted border-b border-border flex items-center gap-3">
              <Contrast className="w-6 h-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">Visual Accessibility</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">High Contrast Colors</h4>
                    <p className="text-sm text-muted-foreground">All text meets WCAG AA standards (4.5:1 contrast ratio minimum)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Color Independence</h4>
                    <p className="text-sm text-muted-foreground">Information is not conveyed by color alone (icons and text labels included)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Readable Typography</h4>
                    <p className="text-sm text-muted-foreground">Clear, legible fonts with appropriate sizing and spacing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Resizable Text</h4>
                    <p className="text-sm text-muted-foreground">Text can be zoomed up to 200% without loss of functionality</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Focus Indicators</h4>
                    <p className="text-sm text-muted-foreground">Clear visual indicators show which element has keyboard focus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motor/Mobility Accessibility */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 bg-muted border-b border-border flex items-center gap-3">
              <Mouse className="w-6 h-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">Motor & Mobility</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Large Click Targets</h4>
                    <p className="text-sm text-muted-foreground">All interactive elements meet minimum size requirements (44x44 pixels)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">No Time Limits</h4>
                    <p className="text-sm text-muted-foreground">Users can complete tasks at their own pace without time restrictions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Reduced Motion Support</h4>
                    <p className="text-sm text-muted-foreground">Respects prefers-reduced-motion for users with vestibular disorders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Design */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 bg-muted border-b border-border flex items-center gap-3">
              <ScreenShare className="w-6 h-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">Responsive Design</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Mobile Friendly</h4>
                    <p className="text-sm text-muted-foreground">Fully responsive layout works on all device sizes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Touch Gestures</h4>
                    <p className="text-sm text-muted-foreground">Touch-friendly interactions for mobile and tablet users</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Zoom Compatible</h4>
                    <p className="text-sm text-muted-foreground">Layout adapts smoothly to browser zoom up to 400%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Accessibility */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 bg-muted border-b border-border flex items-center gap-3">
              <ZoomIn className="w-6 h-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">Form Accessibility</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Clear Labels</h4>
                    <p className="text-sm text-muted-foreground">All form fields have associated, visible labels</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Error Messages</h4>
                    <p className="text-sm text-muted-foreground">Validation errors are clearly announced and associated with fields</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Required Fields</h4>
                    <p className="text-sm text-muted-foreground">Required fields are clearly marked with both visual and programmatic indicators</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-foreground">Input Instructions</h4>
                    <p className="text-sm text-muted-foreground">Clear instructions and examples for complex form fields</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">Accessibility Feedback</h2>
          <p className="text-muted-foreground mb-4">
            We're committed to making Rooted accessible to everyone. If you encounter any accessibility barriers or have suggestions for improvement, please let us know.
          </p>
          <div className="bg-background rounded-lg p-4 border border-border">
            <h3 className="font-medium text-foreground mb-2">Contact Us:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Email: accessibility@rooted.com</li>
              <li>• We aim to respond within 48 hours</li>
              <li>• Your feedback helps us improve</li>
            </ul>
          </div>
        </div>

        {/* Compliance Statement */}
        <div className="mt-6 text-center p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>WCAG 2.1 Level AA Compliance:</strong> Rooted strives to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards to ensure our application is accessible to users with disabilities.
          </p>
        </div>
      </div>
    </div>
  );
}