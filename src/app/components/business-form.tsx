import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { Business } from '@/app/types/business';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { validateFieldsForInjection } from '@/app/utils/sanitize';

interface BusinessFormProps {
  business?: Business | null;
  onSubmit: (businessData: Partial<Business>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Retail',
  'Services',
  'Entertainment',
  'Health & Wellness',
  'Education',
  'Arts & Crafts',
  'Other'
];

const DISTRICTS = [
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

const PRICE_RANGES = [
  { label: '$0-10', value: 5 },
  { label: '$10-20', value: 15 },
  { label: '$20-35', value: 27 },
  { label: '$35+', value: 50 }
];

export function BusinessForm({ business, onSubmit, onCancel }: BusinessFormProps) {
  const [formData, setFormData] = useState({
    name: business?.name || '',
    category: business?.category || '',
    district: business?.district || '',
    description: business?.description || '',
    avg_price: business?.avg_price || 15,
    hours: business?.hours || '',
    address: business?.address || '',
    phone: business?.phone || '',
    website: business?.website || '',
    image_url: business?.image_url || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image_url: 'Only JPG, PNG, and WebP images are allowed' }));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image_url: 'Image must be smaller than 5MB' }));
      return;
    }

    setSelectedFile(file);
    
    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image_url;
      return newErrors;
    });

    // Upload the image immediately
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setErrors(prev => ({ ...prev, image_url: 'You must be logged in to upload images' }));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Set the uploaded image URL
      setFormData(prev => ({ ...prev, image_url: data.url }));
      console.log('✅ Image uploaded successfully:', data.url);
    } catch (error) {
      console.error('❌ Image upload error:', error);
      setErrors(prev => ({ 
        ...prev, 
        image_url: error instanceof Error ? error.message : 'Failed to upload image' 
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    // Business Name validation (3-60 characters)
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Business name must be at least 3 characters';
    } else if (formData.name.trim().length > 60) {
      newErrors.name = 'Business name must be less than 60 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.district) {
      newErrors.district = 'District is required';
    }
    
    // Description validation (20-500 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    // Hours validation (format: Mon-Fri 9-5, Mon-Sun 8am-10pm, etc.)
    if (!formData.hours.trim()) {
      newErrors.hours = 'Hours are required';
    } else {
      const hoursPattern = /^[A-Za-z]{3}-[A-Za-z]{3}\s+\d{1,2}(am|pm|AM|PM)?-\d{1,2}(am|pm|AM|PM)?$/;
      if (!hoursPattern.test(formData.hours.trim())) {
        newErrors.hours = 'Hours must be in format: Mon-Fri 9-5 or Mon-Sun 8am-10pm';
      }
    }
    
    // Address validation (format: ### Street Name, Brookhaven)
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else {
      const addressPattern = /^\d+\s+[A-Za-z\s]+,\s*Brookhaven$/i;
      if (!addressPattern.test(formData.address.trim())) {
        newErrors.address = 'Address must be in format: 123 Main St, Brookhaven';
      }
    }
    
    // Phone validation (format: (XXX) XXX-XXXX)
    if (formData.phone.trim()) {
      const phonePattern = /^\(\d{3}\)\s\d{3}-\d{4}$/;
      if (!phonePattern.test(formData.phone.trim())) {
        newErrors.phone = 'Phone must be in format: (555) 123-4567';
      }
    }
    
    // Website validation (must end with common TLDs)
    if (formData.website.trim()) {
      const websitePattern = /^(https?:\/\/)?(www\.)?[\w\-]+\.(com|org|net|edu|gov|io|co)$/i;
      if (!websitePattern.test(formData.website.trim())) {
        newErrors.website = 'Website must be a valid domain (e.g., example.com, site.org)';
      }
    }
    
    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Business image is required';
    }

    // SQL injection check on all free-text fields
    const injectionErrors = validateFieldsForInjection({
      name: formData.name,
      description: formData.description,
      hours: formData.hours,
      address: formData.address,
      website: formData.website || '',
    });
    Object.assign(newErrors, injectionErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {business ? 'Edit Business' : 'Add New Business'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Business Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Business Name * <span className="text-xs text-muted-foreground">({formData.name.length}/60 characters)</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="e.g., Main Street Coffee"
              maxLength={60}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Category and District */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-foreground mb-1">
                District *
              </label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="">Select a district</option>
                {DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              {errors.district && <p className="text-sm text-destructive mt-1">{errors.district}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description * <span className="text-xs text-muted-foreground">({formData.description.length}/500 characters)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
              placeholder="Describe your business..."
              maxLength={500}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          {/* Price Range and Hours */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="avg_price" className="block text-sm font-medium text-foreground mb-1">
                Price Range
              </label>
              <select
                id="avg_price"
                value={formData.avg_price}
                onChange={(e) => handleChange('avg_price', Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                {PRICE_RANGES.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-foreground mb-1">
                Hours *
              </label>
              <input
                type="text"
                id="hours"
                value={formData.hours}
                onChange={(e) => handleChange('hours', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="e.g., Mon-Fri 9-5"
              />
              {errors.hours && <p className="text-sm text-destructive mt-1">{errors.hours}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
              Address *
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="e.g., 123 Main Street, Brookhaven"
            />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>

          {/* Phone and Website */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="e.g., (555) 123-4567"
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="e.g., https://example.com"
              />
              {errors.website && <p className="text-sm text-destructive mt-1">{errors.website}</p>}
            </div>
          </div>

          {/* Business Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Business Image *
            </label>
            
            {/* File Upload Area */}
            <div className="space-y-3">
              <label 
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Uploading image...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">Click to upload image</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP (max 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>

              {/* Image Preview */}
              {formData.image_url && (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Business preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                    ✓ Uploaded
                  </div>
                </div>
              )}

              {errors.image_url && (
                <p className="text-sm text-destructive">{errors.image_url}</p>
              )}
            </div>
          </div>

          {/* Actions */}
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
              {business ? 'Save Changes' : 'Add Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}