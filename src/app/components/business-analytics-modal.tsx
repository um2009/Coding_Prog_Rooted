import { useState, useEffect, useCallback } from 'react';
import { X, BarChart2, Star, Tag, Eye, TrendingUp, Download, ChevronDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Business } from '@/app/types/business';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { authService } from '@/app/services/authService';
import { dataService } from '@/app/services/dataService';
import jsPDF from 'jspdf';

interface DBDeal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_text?: string;
  discount_percentage?: number;
  code?: string;
  expiration_date?: string; // real DB column name
  expiry_date?: string;     // fallback alias
  active?: boolean;
  created_at?: string;
}

interface Review {
  id: string;
  business_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
}

interface BusinessAnalyticsModalProps {
  businesses: Business[];
  onClose: () => void;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a`;

function getAuthHeaders() {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`
  };
}

function dealLabel(deal: DBDeal): string {
  if (deal.discount_text) return deal.discount_text;
  if (deal.discount_percentage) return `${deal.discount_percentage}% off`;
  return deal.description?.slice(0, 40) || deal.title;
}

const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#16a34a'];

export function BusinessAnalyticsModal({ businesses, onClose }: BusinessAnalyticsModalProps) {
  const [selectedId, setSelectedId] = useState<string>(businesses[0]?.id ?? '');
  const [viewCount, setViewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deals, setDeals] = useState<DBDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedBusiness = businesses.find(b => b.id === selectedId) ?? businesses[0];

  const now = new Date();
  const activeDeals = deals.filter(d => {
    if (d.active === false) return false;
    const dateStr = d.expiration_date || d.expiry_date;
    if (dateStr) return new Date(dateStr) > now;
    return true;
  });

  const loadAnalytics = useCallback(async (businessId: string) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [reviewsData, dealsData, intRes] = await Promise.all([
        dataService.getReviews(businessId),

        fetch(
          `https://${projectId}.supabase.co/rest/v1/deals?business_id=eq.${businessId}&select=*`,
          { headers: { 'apikey': publicAnonKey, 'Authorization': `Bearer ${authService.getAccessToken() || publicAnonKey}` } }
        ).then(r => r.ok ? r.json() : []).catch(() => []),

        fetch(`${API_BASE}/interactions/${businessId}`, { headers: getAuthHeaders() })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      ]);

      setReviews(reviewsData as Review[]);
      setDeals(Array.isArray(dealsData) ? dealsData as DBDeal[] : []);
      setViewCount(intRes?.view_count ?? 0);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadAnalytics(selectedId);
  }, [selectedId, loadAnalytics]);

  const ratingDist = [1, 2, 3, 4, 5].map(star => ({
    star: `${star}`,
    count: reviews.filter(r => Math.round(Number(r.rating)) === star).length
  }));

  const reviewsByMonth: Record<string, number[]> = {};
  reviews.forEach(r => {
    const month = r.created_at?.slice(0, 7) ?? 'unknown';
    if (!reviewsByMonth[month]) reviewsByMonth[month] = [];
    reviewsByMonth[month].push(Number(r.rating));
  });
  const ratingOverTime = Object.entries(reviewsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ratings]) => ({
      month,
      avg: parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1))
    }));

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : '—';

  // --- PDF Export ---
  const handleExportPDF = async () => {
    if (!selectedBusiness) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const PW = 210;
      const PH = 297;
      const M = 14;          // margin
      const CW = PW - M * 2; // content width
      const GREEN: [number, number, number] = [22, 163, 74];
      const DARK: [number, number, number] = [30, 41, 59];
      const GRAY: [number, number, number] = [100, 116, 139];
      const LIGHT_GREEN: [number, number, number] = [240, 253, 244];
      const TABLE_HEADER_BG: [number, number, number] = [22, 163, 74];
      const ROW_ALT: [number, number, number] = [248, 250, 252];
      const BORDER: [number, number, number] = [226, 232, 240];

      // ── helpers ──────────────────────────────────────────────

      const newPageIfNeeded = (neededHeight: number) => {
        if (y + neededHeight > PH - 20) {
          doc.addPage();
          y = M + 6;
        }
      };

      const sectionHeader = (title: string) => {
        newPageIfNeeded(12);
        doc.setFillColor(...GREEN);
        doc.roundedRect(M, y, CW, 8, 1.5, 1.5, 'F');
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(title.toUpperCase(), M + 4, y + 5.5);
        y += 12;
      };

      // Draw a full table: headers[], rows[][], colWidths[]
      const drawTable = (
        headers: string[],
        rows: string[][],
        colWidths: number[],
        rowH = 7,
        emptyMsg = 'No data.'
      ) => {
        const totalW = colWidths.reduce((a, b) => a + b, 0);
        newPageIfNeeded(rowH + 4);

        // Header row
        doc.setFillColor(...TABLE_HEADER_BG);
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.2);
        doc.rect(M, y, totalW, rowH, 'FD');
        doc.setFontSize(8.5);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        let cx = M;
        headers.forEach((h, i) => {
          doc.text(h, cx + 3, y + rowH - 2.2);
          cx += colWidths[i];
          if (i < headers.length - 1) {
            doc.setDrawColor(255, 255, 255, 0.4);
            doc.line(cx, y, cx, y + rowH);
          }
        });
        y += rowH;

        if (rows.length === 0) {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...BORDER);
          doc.rect(M, y, totalW, rowH, 'FD');
          doc.setFontSize(8);
          doc.setFont(undefined, 'italic');
          doc.setTextColor(...GRAY);
          doc.text(emptyMsg, M + 3, y + rowH - 2.2);
          y += rowH + 4;
          return;
        }

        rows.forEach((row, ri) => {
          newPageIfNeeded(rowH);
          doc.setFillColor(...(ri % 2 === 0 ? [255, 255, 255] as [number,number,number] : ROW_ALT));
          doc.setDrawColor(...BORDER);
          doc.setLineWidth(0.2);
          doc.rect(M, y, totalW, rowH, 'FD');

          doc.setFontSize(8.5);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(...DARK);
          let rx = M;
          row.forEach((cell, ci) => {
            const maxW = colWidths[ci] - 6;
            const truncated = doc.getTextWidth(cell) > maxW
              ? cell.slice(0, Math.floor(cell.length * maxW / doc.getTextWidth(cell)) - 2) + '…'
              : cell;
            doc.text(truncated, rx + 3, y + rowH - 2.2);
            rx += colWidths[ci];
            if (ci < row.length - 1) {
              doc.setDrawColor(...BORDER);
              doc.line(rx, y, rx, y + rowH);
            }
          });
          y += rowH;
        });
        y += 5;
      };

      // ── Page header ──────────────────────────────────────────
      let y = 0;

      // Full-width green header banner
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, PW, 38, 'F');
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Business Analytics Report', PW / 2, 14, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(209, 250, 229);
      doc.text(selectedBusiness.name, PW / 2, 22, { align: 'center' });
      doc.setFontSize(8.5);
      doc.setTextColor(167, 243, 208);
      doc.text(
        `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  •  ${selectedBusiness.category}  •  ${selectedBusiness.district}`,
        PW / 2, 30, { align: 'center' }
      );

      y = 46;

      // ── Metric cards (2×2 grid) ──────────────────────────────
      const cards = [
        { label: 'Total Page Views', value: String(viewCount.toLocaleString()), icon: '👁' },
        { label: 'Total Reviews',    value: String(reviews.length),             icon: '★' },
        { label: 'Average Rating',   value: reviews.length ? `${avgRating} / 5` : '—',  icon: '📊' },
        { label: 'Active Deals',     value: String(activeDeals.length),         icon: '🏷' },
      ];
      const cardW = CW / 2 - 2;
      const cardH = 20;
      cards.forEach((card, i) => {
        const cx = M + (i % 2) * (cardW + 4);
        const cy = y + Math.floor(i / 2) * (cardH + 3);
        doc.setFillColor(...LIGHT_GREEN);
        doc.setDrawColor(...GREEN);
        doc.setLineWidth(0.4);
        doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'FD');
        doc.setFontSize(7.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...GRAY);
        doc.text(card.label.toUpperCase(), cx + 4, cy + 6);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...GREEN);
        doc.text(card.value, cx + 4, cy + 16);
      });
      y += cardH * 2 + 3 * 2 + 6;

      // ── Rating Distribution bar chart (drawn with jsPDF) ────
      sectionHeader('Rating Distribution');
      if (reviews.length === 0) {
        doc.setFontSize(9); doc.setFont(undefined, 'italic'); doc.setTextColor(...GRAY);
        doc.text('No reviews yet.', M + 3, y + 5); y += 12;
      } else {
        newPageIfNeeded(52);
        const BAR_COLORS: [number,number,number][] = [
          [239,68,68], [249,115,22], [234,179,8], [132,204,18], [22,163,74]
        ];
        const chartL = M + 10; // left edge (after y-axis labels)
        const chartT = y;
        const chartH = 40;
        const chartW = CW - 12;
        const maxCount = Math.max(...ratingDist.map(r => r.count), 1);
        const barSlot = chartW / 5;
        const barW = barSlot * 0.55;

        // Horizontal grid lines + Y labels
        doc.setLineWidth(0.15);
        for (let g = 0; g <= maxCount; g++) {
          if (maxCount > 6 && g % 2 !== 0 && g !== 0) continue; // thin out if many reviews
          const gy = chartT + chartH - (g / maxCount) * chartH;
          doc.setDrawColor(220, 220, 220);
          doc.line(chartL, gy, chartL + chartW, gy);
          doc.setFontSize(6.5); doc.setTextColor(...GRAY); doc.setFont(undefined, 'normal');
          doc.text(String(g), chartL - 2, gy + 1, { align: 'right' });
        }

        // Bars
        ratingDist.forEach((rd, i) => {
          const bh = maxCount > 0 ? (rd.count / maxCount) * chartH : 0;
          const bx = chartL + i * barSlot + (barSlot - barW) / 2;
          const by = chartT + chartH - bh;
          doc.setFillColor(...BAR_COLORS[i]);
          doc.roundedRect(bx, bh > 0 ? by : chartT + chartH - 0.5, barW, Math.max(bh, 0.5), 1, 1, 'F');
          // Count label above bar
          if (rd.count > 0) {
            doc.setFontSize(7); doc.setFont(undefined, 'bold'); doc.setTextColor(...DARK);
            doc.text(String(rd.count), bx + barW / 2, by - 1.5, { align: 'center' });
          }
          // X-axis label
          doc.setFontSize(8); doc.setFont(undefined, 'bold'); doc.setTextColor(...BAR_COLORS[i]);
          doc.text(rd.star, bx + barW / 2, chartT + chartH + 5, { align: 'center' });
        });

        // Baseline
        doc.setDrawColor(...GRAY); doc.setLineWidth(0.3);
        doc.line(chartL, chartT + chartH, chartL + chartW, chartT + chartH);

        y += chartH + 12;
      }

      // ── Average Rating Over Time line chart (drawn with jsPDF) ──
      if (ratingOverTime.length >= 2) {
        sectionHeader('Average Rating Over Time');
        newPageIfNeeded(52);
        const chartL2 = M + 10;
        const chartT2 = y;
        const chartH2 = 40;
        const chartW2 = CW - 12;
        const n = ratingOverTime.length;

        // Y grid lines (1–5)
        doc.setLineWidth(0.15);
        for (let g = 1; g <= 5; g++) {
          const gy = chartT2 + chartH2 - ((g - 1) / 4) * chartH2;
          doc.setDrawColor(220, 220, 220);
          doc.line(chartL2, gy, chartL2 + chartW2, gy);
          doc.setFontSize(6.5); doc.setTextColor(...GRAY); doc.setFont(undefined, 'normal');
          doc.text(String(g), chartL2 - 2, gy + 1, { align: 'right' });
        }

        // Compute point positions
        const pts = ratingOverTime.map((pt, i) => ({
          px: chartL2 + (i / (n - 1)) * chartW2,
          py: chartT2 + chartH2 - ((pt.avg - 1) / 4) * chartH2,
          label: pt.month.slice(0, 7),
          avg: pt.avg
        }));

        // Fill area under line
        doc.setFillColor(209, 250, 229);
        const areaPath: [number, number][] = [
          [pts[0].px, chartT2 + chartH2],
          ...pts.map(p => [p.px, p.py] as [number, number]),
          [pts[n - 1].px, chartT2 + chartH2]
        ];
        // jsPDF lines for fill
        doc.setDrawColor(209, 250, 229);
        doc.setLineWidth(0);

        // Draw connecting line segments
        doc.setDrawColor(...GREEN); doc.setLineWidth(0.8);
        for (let i = 0; i < pts.length - 1; i++) {
          doc.line(pts[i].px, pts[i].py, pts[i+1].px, pts[i+1].py);
        }

        // Dots + value labels
        pts.forEach((p, i) => {
          doc.setFillColor(...GREEN);
          doc.circle(p.px, p.py, 1.2, 'F');
          doc.setFontSize(6.5); doc.setFont(undefined, 'bold'); doc.setTextColor(...GREEN);
          doc.text(String(p.avg), p.px, p.py - 2.5, { align: 'center' });
          // X-axis label (show every label or thin if crowded)
          if (n <= 8 || i % Math.ceil(n / 8) === 0) {
            doc.setFontSize(6); doc.setFont(undefined, 'normal'); doc.setTextColor(...GRAY);
            doc.text(p.label, p.px, chartT2 + chartH2 + 4.5, { align: 'center' });
          }
        });

        // Baseline
        doc.setDrawColor(...GRAY); doc.setLineWidth(0.3);
        doc.line(chartL2, chartT2 + chartH2, chartL2 + chartW2, chartT2 + chartH2);

        y += chartH2 + 12;
      }

      // ── Deals table ──────────────────────────────────────────
      sectionHeader(`Deals  (${activeDeals.length} active · ${deals.length} total)`);
      const dealRows = activeDeals.map(d => [
        d.title,
        dealLabel(d),
        d.expiration_date ? new Date(d.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No expiry',
      ]);
      drawTable(['Deal Name', 'Discount / Details', 'Expires'], dealRows, [72, 56, 52], 7.5, 'No active deals.');

      // ── Recent Reviews table ─────────────────────────────────
      sectionHeader(`Recent Reviews  (${reviews.length} total)`);
      const reviewRows = reviews.slice(0, 10).map(r => [
        r.user_name || 'Anonymous',
        `${Math.round(Number(r.rating))} / 5`,
        r.comment ? (r.comment.length > 60 ? r.comment.slice(0, 57) + '…' : r.comment) : '—',
        r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '',
      ]);
      drawTable(['Reviewer', 'Rating', 'Comment', 'Date'], reviewRows, [38, 28, 70, 24], 7.5, 'No reviews yet.');

      // ── Footer on every page ─────────────────────────────────
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, PH - 12, PW, 12, 'F');
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(0, PH - 12, PW, PH - 12);
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.text('Rooted — Stay Connected to Your Community', M, PH - 5);
        doc.text(`Page ${i} of ${totalPages}`, PW - M, PH - 5, { align: 'right' });
      }

      doc.save(`rooted_analytics_${selectedBusiness.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e: any) {
      console.error('PDF export error:', e);
      alert(`Export failed: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-border">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Business Analytics</h2>
              <p className="text-xs text-muted-foreground">Track performance across your businesses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Close analytics">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Business selector */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          {businesses.length > 1 ? (
            <div className="relative inline-block w-full max-w-xs">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
              >
                <span className="truncate">{selectedBusiness?.name}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                  {businesses.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedId(b.id); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg ${b.id === selectedId ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-foreground">{selectedBusiness?.name}</p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: 'Total Views', value: viewCount, Icon: Eye, color: 'text-blue-600' },
                  { label: 'Total Reviews', value: reviews.length, Icon: Star, color: 'text-yellow-600' },
                  { label: 'Avg Rating', value: avgRating, Icon: TrendingUp, color: 'text-green-600' },
                  { label: 'Active Deals', value: activeDeals.length, Icon: Tag, color: 'text-purple-600' }
                ].map(({ label, value, Icon, color }) => (
                  <div key={label} className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Total page view counter */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Total Page Views
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center gap-1">
                  <p className="text-6xl font-bold text-blue-700 tabular-nums">{viewCount.toLocaleString()}</p>
                  <p className="text-sm text-blue-500">
                    {viewCount === 0
                      ? 'No views yet — views are counted each time any user opens this business page.'
                      : `total click${viewCount !== 1 ? 's' : ''} on this business page`}
                  </p>
                </div>
              </div>

              {/* Rating distribution */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  Rating Distribution
                </h3>
                {reviews.length === 0 ? (
                  <div className="flex items-center justify-center h-28 bg-secondary/30 rounded-xl text-muted-foreground text-sm">
                    No reviews yet.
                  </div>
                ) : (
                  <div className="bg-secondary/30 rounded-xl p-4 pt-5">
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart id="rating-dist-chart" data={ratingDist} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="star" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                          formatter={(v: number) => [v, 'Reviews']}
                        />
                        <Bar
                          dataKey="count"
                          isAnimationActive={false}
                          shape={(props: any) => {
                            const { x, y, width, height, index } = props;
                            return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} ry={4} fill={RATING_COLORS[index]} />;
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Average rating over time */}
              {ratingOverTime.length >= 2 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Average Rating Over Time
                  </h3>
                  <div className="bg-secondary/30 rounded-xl p-4 pt-5">
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart id="rating-over-time-chart" data={ratingOverTime} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                          formatter={(v: number) => [v, 'Avg Rating']}
                        />
                        <Line type="monotone" dataKey="avg" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a' }} activeDot={{ r: 5 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Deals breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  Deals Overview
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                    <p className="text-2xl font-bold text-foreground">{deals.length}</p>
                    <p className="text-xs text-muted-foreground">Total Deals</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="text-2xl font-bold text-green-700">{activeDeals.length}</p>
                    <p className="text-xs text-green-600">Active Now</p>
                  </div>
                </div>
                {activeDeals.length > 0 ? (
                  <div className="space-y-2">
                    {activeDeals.map(deal => (
                      <div key={deal.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 text-sm border border-border">
                        <span className="font-medium text-foreground truncate">{deal.title}</span>
                        <span className="text-primary font-semibold ml-2 flex-shrink-0">{dealLabel(deal)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-xl">No active deals.</p>
                )}
              </div>

              {/* Recent reviews */}
              {reviews.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Recent Reviews
                  </h3>
                  <div className="space-y-2">
                    {reviews.slice(0, 3).map(r => (
                      <div key={r.id} className="bg-secondary/30 rounded-lg px-3 py-2 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">{r.user_name}</span>
                          <span className="text-xs text-yellow-600 font-bold">
                            {'★'.repeat(Math.round(Number(r.rating)))}{'☆'.repeat(5 - Math.round(Number(r.rating)))}
                          </span>
                        </div>
                        {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0 flex items-center justify-between bg-secondary/20">
          <p className="text-xs text-muted-foreground">
            Analytics for <span className="font-semibold">{selectedBusiness?.name}</span>
          </p>
          <button
            onClick={handleExportPDF}
            disabled={isExporting || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
