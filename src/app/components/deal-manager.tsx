import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Tag, Calendar } from 'lucide-react';
import { Deal } from '@/app/services/dataService';

interface DealManagerProps {
  businessId: string;
  deals: Deal[];
  onAddDeal: (dealData: Omit<Deal, 'id' | 'business_id'>) => void;
  onUpdateDeal: (dealId: string, dealData: Partial<Deal>) => void;
  onDeleteDeal: (dealId: string) => void;
  onCancel: () => void;
}

export function DealManager({
  businessId,
  deals,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  onCancel
}: DealManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const handleAddClick = () => {
    setEditingDeal(null);
    setShowForm(true);
  };

  const handleEditClick = (deal: Deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleFormSubmit = (dealData: Omit<Deal, 'id' | 'business_id'>) => {
    if (editingDeal) {
      onUpdateDeal(editingDeal.id, dealData);
    } else {
      onAddDeal(dealData);
    }
    setShowForm(false);
    setEditingDeal(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingDeal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Manage Deals</h2>
            <p className="text-sm text-muted-foreground">{businessId}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showForm ? (
            <>
              {/* Add Deal Button */}
              <button
                onClick={handleAddClick}
                className="w-full mb-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
                <span>Add New Deal</span>
              </button>

              {/* Deals List */}
              {deals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground">No deals yet. Create your first deal!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => {
                    const expiryDate = new Date(deal.expiration_date || deal.expirationdate || '');
                    const isExpired = expiryDate < new Date();
                    
                    return (
                      <div
                        key={deal.id}
                        className={`border border-border rounded-lg p-4 ${
                          isExpired ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-foreground">{deal.title}</h3>
                              {deal.discount_text && (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm font-semibold">
                                  {deal.discount_text}
                                </span>
                              )}
                              {isExpired && (
                                <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-sm">
                                  Expired
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{deal.description}</p>
                            {deal.code && (
                              <div className="inline-block bg-secondary px-3 py-1 rounded text-sm font-mono">
                                Code: {deal.code}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(deal)}
                              className="p-2 rounded-lg hover:bg-accent transition-colors"
                              aria-label="Edit deal"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => onDeleteDeal(deal.id)}
                              className="p-2 rounded-lg hover:bg-accent transition-colors"
                              aria-label="Delete deal"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <span>Expires: {expiryDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <DealForm
              deal={editingDeal}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface DealFormProps {
  deal?: Deal | null;
  onSubmit: (dealData: Omit<Deal, 'id' | 'business_id'>) => void;
  onCancel: () => void;
}

function DealForm({ deal, onSubmit, onCancel }: DealFormProps) {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    description: deal?.description || '',
    discount_text: deal?.discount_text || '',
    code: deal?.code || '',
    expiration_date: deal?.expiration_date || deal?.expirationdate ? (deal.expiration_date || deal.expirationdate)!.split('T')[0] : ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.expiration_date) {
      newErrors.expiration_date = 'Expiry date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      discount_text: formData.discount_text || undefined,
      code: formData.code || undefined,
      expiration_date: formData.expiration_date
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="deal-title" className="block text-sm font-medium text-foreground mb-1">
          Deal Title *
        </label>
        <input
          type="text"
          id="deal-title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          placeholder="e.g., 20% Off All Items"
        />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="deal-description" className="block text-sm font-medium text-foreground mb-1">
          Description *
        </label>
        <textarea
          id="deal-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
          placeholder="Describe the deal..."
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="deal-discount" className="block text-sm font-medium text-foreground mb-1">
            Discount Text
          </label>
          <input
            type="text"
            id="deal-discount"
            value={formData.discount_text}
            onChange={(e) => handleChange('discount_text', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            placeholder="e.g., 20% Off"
          />
        </div>

        <div>
          <label htmlFor="deal-code" className="block text-sm font-medium text-foreground mb-1">
            Promo Code
          </label>
          <input
            type="text"
            id="deal-code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            placeholder="e.g., SAVE20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="deal-expiry" className="block text-sm font-medium text-foreground mb-1">
          Expiry Date *
        </label>
        <input
          type="date"
          id="deal-expiry"
          value={formData.expiration_date}
          onChange={(e) => handleChange('expiration_date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        />
        {errors.expiration_date && <p className="text-sm text-destructive mt-1">{errors.expiration_date}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {deal ? 'Save Changes' : 'Add Deal'}
        </button>
      </div>
    </form>
  );
}