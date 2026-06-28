import { useState, useMemo, useRef } from 'react';
import { MapView } from './map-view';
import { BusinessCard } from './business-card';
import { Map, List, ArrowUpDown, Search, BarChart3, X, Download } from 'lucide-react';
import { Business, SortOption, ViewMode, PriceRange, Category } from '@/app/types/business';
import { ContextualHelp } from './contextual-help';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { AlertCircle } from 'lucide-react';

interface BrowsePageProps {
  businesses: Business[];
  onBusinessClick: (businessId: string) => void;
}

export function BrowsePage({ businesses, onBusinessClick }: BrowsePageProps) {
  // Navigation layout state monitors determining present display layouts
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonBusiness1, setComparisonBusiness1] = useState<string>('');
  const [comparisonBusiness2, setComparisonBusiness2] = useState<string>('');
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Structural report generator engine converting visual metric values to saved text files
  const handleExportPDF = async () => {
    if (!comparisonRef.current || !comparisonBusiness1 || !comparisonBusiness2) {
      setShowExportModal(true);
      return;
    }

    try {
      console.log('Starting PDF export...');
      
      const business1 = businesses.find(b => b.id === comparisonBusiness1);
      const business2 = businesses.find(b => b.id === comparisonBusiness2);
      
      if (!business1 || !business2) return;

      const doc = new jsPDF('p', 'mm', 'a4');
      let yPos = 20;
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Business Comparison Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(22, 163, 74); 
      doc.text(`${business1.name}`, margin + 35, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.text('vs', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(59, 130, 246); 
      doc.text(`${business2.name}`, pageWidth - margin - 35, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPos += 12;
      
      doc.setFontSize(10);
      const rowHeight = 9;
      const col1X = margin;
      const col2X = margin + 60;
      const col3X = margin + 120;
      const col1Width = 60;
      const col2Width = 60;
      const col3Width = 60;
      
      const drawCell = (text: string, x: number, y: number, width: number, height: number, isHeader = false) => {
        doc.rect(x, y, width, height);
        if (isHeader) {
          doc.setFillColor(22, 163, 74);
          doc.rect(x, y, width, height, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');
        }
        doc.text(text || '', x + 3, y + 6);
        if (isHeader) {
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'normal');
        }
      };
      
      drawCell('Metric', col1X, yPos, col1Width, rowHeight, true);
      drawCell(business1.name.substring(0, 15), col2X, yPos, col2Width, rowHeight, true);
      drawCell(business2.name.substring(0, 15), col3X, yPos, col3Width, rowHeight, true);
      yPos += rowHeight;
      
      const rows = [
        ['Category', business1.category, business2.category],
        ['Rating', `${(business1.rating ?? 0).toFixed(1)} stars`, `${(business2.rating ?? 0).toFixed(1)} stars`],
        ['Reviews', `${business1.review_count}`, `${business2.review_count}`],
        ['Avg Price', `~$${business1.avg_price}`, `~$${business2.avg_price}`],
        ['District', business1.district, business2.district],
        ['Active Deal', business1.has_deal ? 'Yes' : 'No', business2.has_deal ? 'Yes' : 'No'],
      ];
      
      rows.forEach(([metric, val1, val2]) => {
        drawCell(metric, col1X, yPos, col1Width, rowHeight);
        drawCell(val1, col2X, yPos, col2Width, rowHeight);
        drawCell(val2, col3X, yPos, col3Width, rowHeight);
        yPos += rowHeight;
      });
      
      yPos += 10;
      
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('Metrics Visualization', margin, yPos);
      yPos += 8;
      
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 900, 400);
        
        const chartMargin = { top: 40, right: 200, bottom: 60, left: 60 };
        const chartWidth = 900 - chartMargin.left - chartMargin.right;
        const chartHeight = 400 - chartMargin.top - chartMargin.bottom;
        
        const metrics = [
          { label: 'Rating', val1: business1.rating, val2: business2.rating, max: 5 },
          { label: 'Reviews', val1: business1.review_count, val2: business2.review_count, max: Math.max(business1.review_count, business2.review_count) || 1 },
          { label: 'Avg Price ($)', val1: business1.avg_price, val2: business2.avg_price, max: Math.max(business1.avg_price, business2.avg_price) || 1 },
        ];
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = chartMargin.top + (chartHeight / 5) * i;
          ctx.beginPath();
          ctx.moveTo(chartMargin.left, y);
          ctx.lineTo(chartMargin.left + chartWidth, y);
          ctx.stroke();
        }
        
        const barGroupWidth = chartWidth / metrics.length;
        const barWidth = barGroupWidth / 3;
        
        metrics.forEach((metric, index) => {
          const x = chartMargin.left + index * barGroupWidth;
          
          const height1 = (metric.val1 / metric.max) * chartHeight;
          const height2 = (metric.val2 / metric.max) * chartHeight;
          
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(
            x + barWidth * 0.5,
            chartMargin.top + chartHeight - height1,
            barWidth * 0.8,
            height1
          );
          
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(
            x + barWidth * 1.5,
            chartMargin.top + chartHeight - height2,
            barWidth * 0.8,
            height2
          );
          
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(metric.label, x + barGroupWidth / 2, chartMargin.top + chartHeight + 30);
        });
        
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(chartMargin.left + chartWidth + 30, chartMargin.top + 20, 25, 20);
        ctx.fillStyle = '#374151';
        ctx.fillText(business1.name.substring(0, 20), chartMargin.left + chartWidth + 65, chartMargin.top + 35);
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(chartMargin.left + chartWidth + 30, chartMargin.top + 55, 25, 20);
        ctx.fillStyle = '#374151';
        ctx.fillText(business2.name.substring(0, 20), chartMargin.left + chartWidth + 65, chartMargin.top + 70);
        
        ctx.save();
        ctx.translate(25, chartMargin.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Normalized Value', 0, 0);
        ctx.restore();
        
        const chartImageData = canvas.toDataURL('image/png');
        const chartWidth_mm = contentWidth;
        const chartHeight_mm = (400 / 900) * chartWidth_mm; 
        doc.addImage(chartImageData, 'PNG', margin, yPos, chartWidth_mm, chartHeight_mm);
        yPos += chartHeight_mm + 10;
      }
      
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('Comparison Summary', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const higherRating = business1.rating > business2.rating ? business1.name : 
                           business2.rating > business1.rating ? business2.name : 'Tie';
      const moreReviews = business1.review_count > business2.review_count ? business1.name : 
                          business2.review_count > business1.review_count ? business2.name : 'Tie';
      const lowerPrice = business1.avg_price < business2.avg_price ? business1.name : 
                         business2.avg_price < business1.avg_price ? business2.name : 'Tie';
      
      doc.text(`• Higher Rating: ${higherRating}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• More Reviews: ${moreReviews}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Lower Price: ${lowerPrice}`, margin + 5, yPos);
      
      const fileName = `comparison_${business1.name}_vs_${business2.name}.pdf`
        .replace(/[^a-z0-9_-]/gi, '_')
        .toLowerCase();
      
      doc.save(fileName);
      console.log('PDF exported successfully:', fileName);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Failed to export PDF: ${error.message || 'Unknown error'}. Check the console for details.`);
    }
  };

  // Fixed indexing catalog standardizing standard query categories across business lists
  const categories: Category[] = [
    'Food',
    'Retail',
    'Health',
    'Entertainment',
    'Personal Care',
    'Services',
    'Home',
    'Other'
  ];

  // Map coordinate region indices grouping available business addresses
  const districts = [
    'Downtown',
    'North',
    'South',
    'East',
    'West',
    'Northeast',
    'Northwest',
    'Southeast',
    'Southwest'
  ];

  // Toggling selection modifier monitoring active catalog filters
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Regional location filter updater monitoring map parameters
  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  // Pricing matrix tier selection updater managing search cost ranges
  const handlePriceRangeToggle = (range: PriceRange) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  // Computed data selector analyzing and updating collection matching across client selections
  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses];

    if (selectedCategories.length > 0) {
      result = result.filter(b => selectedCategories.includes(b.category));
    }

    if (minRating > 0) {
      result = result.filter(b => b.rating >= minRating);
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter(b => {
        const price = b.avg_price;
        return selectedPriceRanges.some(range => {
          switch(range) {
            case '0-10':
              return price >= 0 && price <= 10;
            case '10-20':
              return price > 10 && price <= 20;
            case '20-35':
              return price > 20 && price <= 35;
            case '35+':
              return price > 35;
            default:
              return false;
          }
        });
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        b.district.toLowerCase().includes(query)
      );
    }

    if (selectedDistricts.length > 0) {
      result = result.filter(b => selectedDistricts.includes(b.district));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.review_count - a.review_count;
        case 'deals':
          if (a.has_deal && !b.has_deal) return -1;
          if (!a.has_deal && b.has_deal) return 1;
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [businesses, selectedCategories, sortBy, minRating, selectedPriceRanges, searchQuery, selectedDistricts]);

  // Combined data structure feeding metric comparisons into Recharts components
  const chartData = useMemo(() => {
    const b1 = businesses.find(b => b.id === comparisonBusiness1);
    const b2 = businesses.find(b => b.id === comparisonBusiness2);
    if (!b1 || !b2) return [];

    return [
      { name: 'Rating', [b1.name]: b1.rating, [b2.name]: b2.rating },
      { name: 'Reviews', [b1.name]: b1.review_count, [b2.name]: b2.review_count },
      { name: 'Avg Price', [b1.name]: b1.avg_price, [b2.name]: b2.avg_price }
    ];
  }, [businesses, comparisonBusiness1, comparisonBusiness2]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header content section tracking title elements */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Discover Local Businesses</h1>
            <p className="text-muted-foreground">
              Browse {filteredAndSortedBusinesses.length} business{filteredAndSortedBusinesses.length !== 1 ? 'es' : ''} in your area
            </p>
          </div>
          
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Compare businesses"
          >
            <BarChart3 className="w-5 h-5" aria-hidden="true" />
            Compare
          </button>
        </div>

        <div className="flex gap-6">
          {/* Layout structural sidebar capturing filtration triggers */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-3 mb-3">
              <label htmlFor="search-input" className="block mb-1.5 text-[9px] font-semibold text-foreground">
                Search Businesses
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, category, district..."
                  className="w-full pl-8 pr-8 py-1.5 bg-background text-foreground border border-border rounded-md text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Search businesses by name, category, or district"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border sticky top-6 p-3 space-y-2.5">
              <div>
                <label className="block mb-1 text-[9px] font-semibold text-foreground">
                  View Mode
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex-1 px-2 py-1 rounded-md flex items-center justify-center gap-1 transition-colors ${
                      viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <Map className="w-3 h-3" />
                    <span className="text-[9px]">Map</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-2 py-1 rounded-md flex items-center justify-center gap-1 transition-colors ${
                      viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <List className="w-3 h-3" />
                    <span className="text-[9px]">List</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-semibold text-foreground">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-2 py-1 rounded-md flex items-center justify-center transition-colors ${
                        selectedCategories.includes(category) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <span className="text-[9px] font-medium">{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-semibold text-foreground">
                  District
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {districts.map((district) => (
                    <button
                      key={district}
                      onClick={() => handleDistrictToggle(district)}
                      className={`px-1 py-1 rounded-md flex items-center justify-center transition-colors ${
                        selectedDistricts.includes(district) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <span className="text-[8px] font-medium">{district}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-semibold text-foreground">
                  Sort By
                </label>
                <div className="space-y-1">
                  {(['rating', 'reviews', 'deals'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`w-full px-2 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                        sortBy === option ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <ArrowUpDown className="w-2.5 h-2.5" />
                      <span className="text-[9px] capitalize">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="rating-slider" className="block mb-1 text-[9px] font-semibold text-foreground">
                  Min Rating: {minRating > 0 ? `${minRating}★` : 'Any'}
                </label>
                <input
                  id="rating-slider"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-semibold text-foreground">
                  Price Range
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['0-10', '10-20', '20-35', '35+'] as PriceRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => handlePriceRangeToggle(range)}
                      className={`px-2 py-1 rounded-md flex items-center justify-center transition-colors ${
                        selectedPriceRanges.includes(range) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold">{range}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedDistricts([]);
                  setSortBy('default');
                  setMinRating(0);
                  setSelectedPriceRanges([]);
                  setSearchQuery('');
                }}
                className="w-full px-2 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-accent transition-colors text-[9px] font-medium"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Primary data container staging grid cards or interactive maps */}
          <main className="flex-1 min-w-0">
            {viewMode === 'map' ? (
              <div className="space-y-4">
                <MapView businesses={filteredAndSortedBusinesses} onBusinessClick={onBusinessClick} />
              </div>
            ) : (
              <>
                {filteredAndSortedBusinesses.length > 0 ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSortedBusinesses.map((business) => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                        onClick={() => onBusinessClick(business.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground text-lg mb-4">No businesses found matching your filters</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <ContextualHelp
        title="Browse Help"
        items={[
          'Toggle between Map View and List View using the view mode buttons',
          'Use filters to narrow down businesses by category, district, rating, and price range',
          'Search for businesses by name, category, or district in the search bar'
        ]}
      />

      {/* Analytics overlay module analyzing multi-entity resource summaries */}
      {showComparison && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowComparison(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Compare Businesses</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-lg hover:bg-accent transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button onClick={() => setShowComparison(false)} className="p-2 hover:bg-accent rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6" ref={comparisonRef}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="business1-select" className="block text-sm font-medium text-foreground mb-2">
                    Business 1
                  </label>
                  <select
                    id="business1-select"
                    value={comparisonBusiness1}
                    onChange={(e) => setComparisonBusiness1(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a business...</option>
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="business2-select" className="block text-sm font-medium text-foreground mb-2">
                    Business 2
                  </label>
                  <select
                    id="business2-select"
                    value={comparisonBusiness2}
                    onChange={(e) => setComparisonBusiness2(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a business...</option>
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data visualization element displaying multi-variant analytical metrics */}
              {chartData.length > 0 && (
                <div className="h-80 w-full bg-card p-4 rounded-xl border border-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={businesses.find(b => b.id === comparisonBusiness1)?.name || 'Business 1'} fill="#16a34a" />
                      <Bar dataKey={businesses.find(b => b.id === comparisonBusiness2)?.name || 'Business 2'} fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operational validation popup prompting explicit parameter entry for comparative summaries */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-lg max-w-sm w-full border border-border text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-bold text-foreground">Selection Required</h3>
            <p className="text-sm text-muted-foreground">Please select two separate targets to output accurate report data tables.</p>
            <button onClick={() => setShowExportModal(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md w-full">
              Acknowledge
            </button>
      SortedBusinesses.map((business) => (
                      <option key={business.id} value={business.id} disabled={business.id === comparisonBusiness1}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Results */}
              {comparisonBusiness1 && comparisonBusiness2 ? (() => {
                const business1 = businesses.find(b => b.id === comparisonBusiness1);
                const business2 = businesses.find(b => b.id === comparisonBusiness2);

                if (!business1 || !business2) return null;

                // Normalize all metrics to 0-100 scale for spider chart
                const maxReviews = Math.max(business1.review_count, business2.review_count, 1);
                const maxPrice = Math.max(business1.avg_price, business2.avg_price, 1);

                const radarData = [
                  {
                    metric: 'Rating',
                    [business1.name]: (business1.rating / 5) * 100,
                    [business2.name]: (business2.rating / 5) * 100,
                    business1Display: `${business1.rating}★`,
                    business2Display: `${business2.rating}★`,
                  },
                  {
                    metric: 'Reviews',
                    [business1.name]: (business1.review_count / maxReviews) * 100,
                    [business2.name]: (business2.review_count / maxReviews) * 100,
                    business1Display: `${business1.review_count} reviews`,
                    business2Display: `${business2.review_count} reviews`,
                  },
                  {
                    metric: 'Price',
                    [business1.name]: (business1.avg_price / maxPrice) * 100,
                    [business2.name]: (business2.avg_price / maxPrice) * 100,
                    business1Display: `$${business1.avg_price}`,
                    business2Display: `$${business2.avg_price}`,
                  },
                ];

                return (
                  <div className="space-y-6">
                    {/* Quick Stats Comparison */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Business 1 Card */}
                      <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-3">{business1.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium text-foreground">{business1.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rating:</span>
                            <span className="font-medium text-foreground">{business1.rating} ★</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reviews:</span>
                            <span className="font-medium text-foreground">{business1.review_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Price:</span>
                            <span className="font-medium text-foreground">~${business1.avg_price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">District:</span>
                            <span className="font-medium text-foreground">{business1.district}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Active Deal:</span>
                            <span className={`font-medium ${business1.has_deal ? 'text-primary' : 'text-muted-foreground'}`}>
                              {business1.has_deal ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Business 2 Card */}
                      <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-3">{business2.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium text-foreground">{business2.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rating:</span>
                            <span className="font-medium text-foreground">{business2.rating} ★</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reviews:</span>
                            <span className="font-medium text-foreground">{business2.review_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Price:</span>
                            <span className="font-medium text-foreground">~${business2.avg_price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">District:</span>
                            <span className="font-medium text-foreground">{business2.district}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Active Deal:</span>
                            <span className={`font-medium ${business2.has_deal ? 'text-primary' : 'text-muted-foreground'}`}>
                              {business2.has_deal ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bar Chart Comparison */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-lg text-foreground mb-4">Detailed Metrics</h3>
                      
                      {/* Tabs */}
                      <div className="border-b border-border mb-6">
                        <div className="flex gap-4">
                          <button
                            onClick={() => setComparisonTab('rating')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                              comparisonTab === 'rating'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Rating
                          </button>
                          <button
                            onClick={() => setComparisonTab('reviews')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                              comparisonTab === 'reviews'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Reviews
                          </button>
                          <button
                            onClick={() => setComparisonTab('price')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                              comparisonTab === 'price'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Price
                          </button>
                        </div>
                      </div>

                      {/* Rating Chart */}
                      {comparisonTab === 'rating' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[
                            {
                              business: business1.name,
                              Rating: business1.rating,
                            },
                            {
                              business: business2.name,
                              Rating: business2.rating,
                            },
                          ]} key="rating-chart">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="business" stroke="#6b7280" />
                            <YAxis domain={[0, 5]} stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="Rating" radius={[8, 8, 0, 0]} isAnimationActive={false}
                              shape={(props: any) => {
                                const colors = ['#16a34a', '#3b82f6'];
                                const { x, y, width, height, index } = props;
                                return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={8} ry={8} fill={colors[index % 2]} />;
                              }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {/* Reviews Chart */}
                      {comparisonTab === 'reviews' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[
                            {
                              business: business1.name,
                              Reviews: business1.review_count,
                            },
                            {
                              business: business2.name,
                              Reviews: business2.review_count,
                            },
                          ]} key="reviews-chart">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="business" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="Reviews" radius={[8, 8, 0, 0]} isAnimationActive={false}
                              shape={(props: any) => {
                                const colors = ['#16a34a', '#3b82f6'];
                                const { x, y, width, height, index } = props;
                                return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={8} ry={8} fill={colors[index % 2]} />;
                              }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {/* Price Chart */}
                      {comparisonTab === 'price' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[
                            {
                              business: business1.name,
                              'Avg Price ($)': business1.avg_price,
                            },
                            {
                              business: business2.name,
                              'Avg Price ($)': business2.avg_price,
                            },
                          ]} key="price-chart">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="business" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="Avg Price ($)" radius={[8, 8, 0, 0]} isAnimationActive={false}
                              shape={(props: any) => {
                                const colors = ['#16a34a', '#3b82f6'];
                                const { x, y, width, height, index } = props;
                                return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={8} ry={8} fill={colors[index % 2]} />;
                              }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Winner Summary */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="font-semibold text-foreground mb-3">Comparison Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Higher Rating:</span>
                          <span className="font-medium text-foreground">
                            {business1.rating > business2.rating ? business1.name : 
                             business2.rating > business1.rating ? business2.name : 'Tie'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">More Reviews:</span>
                          <span className="font-medium text-foreground">
                            {business1.review_count > business2.review_count ? business1.name : 
                             business2.review_count > business1.review_count ? business2.name : 'Tie'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Lower Price:</span>
                          <span className="font-medium text-foreground">
                            {business1.avg_price < business2.avg_price ? business1.name : 
                             business2.avg_price < business1.avg_price ? business2.name : 'Tie'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                  <p className="text-muted-foreground">
                    Select two businesses above to see a detailed comparison
                  </p>
                </div>
              )}
            </div>

            {/* Export PDF Button */}
            <div className="px-6 py-4 bg-background border-t border-border">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Export comparison as PDF"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowExportModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 id="export-modal-title" className="text-lg font-bold text-foreground mb-2">
                    Select Two Businesses
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    To export a comparison as PDF, please select two businesses from the dropdown menus above.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
