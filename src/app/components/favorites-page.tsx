import { Heart, Download } from 'lucide-react';
import { Business } from '@/app/types/business';
import { BusinessCard } from './business-card';
import { ContextualHelp } from './contextual-help';
import jsPDF from 'jspdf';
import { useState } from 'react';

interface FavoritesPageProps {
  businesses: Business[];
  onBusinessClick: (businessId: string) => void;
  user: { name: string; email: string } | null;
  onSignInClick: () => void;
}

export function FavoritesPage({ businesses, onBusinessClick, user, onSignInClick }: FavoritesPageProps) {
  // Add safety check for undefined businesses
  const safeFavorites = businesses || [];
  const [isExporting, setIsExporting] = useState(false);

  // Export Favorites as PDF
  const handleExportFavorites = async () => {
    if (safeFavorites.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const PW = 210, PH = 297, M = 14, CW = PW - M * 2;
      const GREEN:  [number,number,number] = [22, 163, 74];
      const DARK:   [number,number,number] = [30, 41, 59];
      const GRAY:   [number,number,number] = [100, 116, 139];
      const BORDER: [number,number,number] = [226, 232, 240];
      const ROW_ALT:[number,number,number] = [248, 250, 252];
      let y = 0;

      const newPageIfNeeded = (h: number) => {
        if (y + h > PH - 18) { doc.addPage(); y = M + 4; }
      };

      const sectionHeader = (title: string) => {
        newPageIfNeeded(12);
        doc.setFillColor(...GREEN);
        doc.roundedRect(M, y, CW, 8, 1.5, 1.5, 'F');
        doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.setTextColor(255, 255, 255);
        doc.text(title.toUpperCase(), M + 4, y + 5.5);
        y += 12;
      };

      const drawTable = (
        headers: string[], rows: string[][], colWidths: number[],
        rowH = 7, emptyMsg = 'No data.'
      ) => {
        const totalW = colWidths.reduce((a, b) => a + b, 0);
        newPageIfNeeded(rowH + 4);
        doc.setFillColor(...GREEN); doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
        doc.rect(M, y, totalW, rowH, 'FD');
        doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(255, 255, 255);
        let cx = M;
        headers.forEach((h, i) => {
          doc.text(h, cx + 3, y + rowH - 2.2);
          cx += colWidths[i];
          if (i < headers.length - 1) { doc.setDrawColor(255, 255, 255); doc.line(cx, y, cx, y + rowH); }
        });
        y += rowH;

        if (rows.length === 0) {
          doc.setFillColor(255, 255, 255); doc.setDrawColor(...BORDER); doc.rect(M, y, totalW, rowH, 'FD');
          doc.setFontSize(8); doc.setFont(undefined, 'italic'); doc.setTextColor(...GRAY);
          doc.text(emptyMsg, M + 3, y + rowH - 2.2); y += rowH + 4; return;
        }

        rows.forEach((row, ri) => {
          newPageIfNeeded(rowH);
          doc.setFillColor(...(ri % 2 === 0 ? ([255, 255, 255] as [number,number,number]) : ROW_ALT));
          doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
          doc.rect(M, y, totalW, rowH, 'FD');
          doc.setFontSize(8.5); doc.setFont(undefined, 'normal'); doc.setTextColor(...DARK);
          let rx = M;
          row.forEach((cell, ci) => {
            const maxW = colWidths[ci] - 6;
            const tw = doc.getTextWidth(cell);
            const truncated = tw > maxW
              ? cell.slice(0, Math.floor(cell.length * maxW / tw) - 2) + '…'
              : cell;
            doc.text(truncated, rx + 3, y + rowH - 2.2);
            rx += colWidths[ci];
            if (ci < row.length - 1) { doc.setDrawColor(...BORDER); doc.line(rx, y, rx, y + rowH); }
          });
          y += rowH;
        });
        y += 5;
      };

      // ── Header banner ─────────────────────────────────────────
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, PW, 38, 'F');
      doc.setFontSize(20); doc.setFont(undefined, 'bold'); doc.setTextColor(255, 255, 255);
      doc.text('My Favorite Businesses', PW / 2, 14, { align: 'center' });
      doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.setTextColor(209, 250, 229);
      if (user) doc.text(user.name, PW / 2, 22, { align: 'center' });
      doc.setFontSize(8.5); doc.setTextColor(167, 243, 208);
      doc.text(
        `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  •  ${safeFavorites.length} saved business${safeFavorites.length !== 1 ? 'es' : ''}`,
        PW / 2, 30, { align: 'center' }
      );
      y = 46;

      // ── Metric cards (2×2) ────────────────────────────────────
      const avgRating = safeFavorites.length
        ? (safeFavorites.reduce((s, b) => s + (b.rating ?? 0), 0) / safeFavorites.length).toFixed(1)
        : '—';
      const dealsCount      = safeFavorites.filter(b => b.has_deal).length;
      const categoriesCount = new Set(safeFavorites.map(b => b.category)).size;
      const totalReviews    = safeFavorites.reduce((s, b) => s + (b.review_count ?? 0), 0);

      const cards = [
        { label: 'Total Favorites',    value: String(safeFavorites.length) },
        { label: 'Average Rating',     value: avgRating === '—' ? '—' : `${avgRating} / 5` },
        { label: 'With Active Deals',  value: String(dealsCount) },
        { label: 'Categories',         value: String(categoriesCount) },
      ];
      const cardW = CW / 2 - 2, cardH = 20;
      cards.forEach((card, i) => {
        const cx = M + (i % 2) * (cardW + 4);
        const cy = y + Math.floor(i / 2) * (cardH + 3);
        doc.setFillColor(240, 253, 244); doc.setDrawColor(...GREEN); doc.setLineWidth(0.4);
        doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'FD');
        doc.setFontSize(7.5); doc.setFont(undefined, 'normal'); doc.setTextColor(...GRAY);
        doc.text(card.label.toUpperCase(), cx + 4, cy + 6);
        doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(...GREEN);
        doc.text(card.value, cx + 4, cy + 16);
      });
      y += cardH * 2 + 3 + 8;

      // ── Businesses table ──────────────────────────────────────
      sectionHeader(`Saved Businesses  (${safeFavorites.length} total)`);
      const bizRows = safeFavorites.map((b, i) => [
        String(i + 1),
        b.name ?? '—',
        b.category ?? '—',
        b.district ?? '—',
        `${(b.rating ?? 0).toFixed(1)} (${b.review_count ?? 0} reviews)`,
        b.avg_price ? `~$${b.avg_price}` : '—',
        b.has_deal ? 'Yes' : 'No',
      ]);
      drawTable(
        ['#', 'Business Name', 'Category', 'District', 'Rating', 'Price', 'Deal'],
        bizRows,
        [10, 48, 28, 26, 34, 16, 14],
        7.5
      );

      // ── Descriptions table ────────────────────────────────────
      sectionHeader('Business Descriptions');
      const descRows = safeFavorites.map(b => [
        b.name ?? '—',
        b.description
          ? (b.description.length > 95 ? b.description.slice(0, 92) + '…' : b.description)
          : '—',
      ]);
      drawTable(['Business', 'Description'], descRows, [52, 128], 8);

      // ── Footer ────────────────────────────────────────────────
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, PH - 12, PW, 12, 'F');
        doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
        doc.line(0, PH - 12, PW, PH - 12);
        doc.setFontSize(7.5); doc.setFont(undefined, 'normal'); doc.setTextColor(...GRAY);
        doc.text('Rooted — Stay Connected to Your Community', M, PH - 5);
        doc.text(`Page ${i} of ${totalPages}`, PW - M, PH - 5, { align: 'right' });
      }

      doc.save(`rooted_favorites_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error: any) {
      console.error('Error generating Favorites PDF:', error);
      alert(`Failed to export PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary fill-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          </div>
          {user && (
            <p className="text-muted-foreground">
              {safeFavorites.length} saved business{safeFavorites.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>

        {/* Show sign-in prompt if not authenticated */}
        {!user ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign In to View Favorites</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create an account or sign in to save your favorite businesses and access them from any device.
            </p>
            <button
              onClick={onSignInClick}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              aria-label="Sign in to view favorites"
            >
              Sign In / Create Account
            </button>
          </div>
        ) : (
          <>
            {/* Content */}
            {safeFavorites.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Favorites Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Start exploring local businesses and save your favorites for easy access later. 
                  Click the heart icon on any business to add it to your favorites.
                </p>
              </div>
            ) : (
              <>
                {/* Favorites Summary */}
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Favorites Summary</h2>
                    <button
                      onClick={handleExportFavorites}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Export favorites as PDF"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {safeFavorites.reduce((sum, b) => sum + b.rating, 0) / safeFavorites.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {safeFavorites.filter(b => b.has_deal).length}
                      </div>
                      <div className="text-sm text-muted-foreground">With Deals</div>
                    </div>
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(safeFavorites.map(b => b.category)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {safeFavorites.reduce((sum, b) => sum + b.review_count, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Reviews</div>
                    </div>
                  </div>
                </div>

                {/* Favorites Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {safeFavorites.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      onClick={() => onBusinessClick(business.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Contextual Help */}
      <ContextualHelp
        title="Favorites Help"
        items={[
          'Click the heart icon on any business detail page to add it to your favorites',
          'View all your saved businesses in one convenient location',
          'The Favorites Summary shows statistics about your saved businesses',
          'Click \"Export PDF\" to download a professional report of all your favorites',
          'Click any business card to view full details and reviews',
          'Favorites are saved to your account and accessible from any device',
          'Remove a business from favorites by clicking the heart icon again on its detail page'
        ]}
      />
    </div>
  );
}