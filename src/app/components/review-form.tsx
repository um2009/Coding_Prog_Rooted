import { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { TextCaptcha } from './text-captcha';
import { sqlInjectionError } from '@/app/utils/sanitize';

interface ReviewFormProps {
  businessName: string;
  onSubmit: (review: { rating: number; comment: string }) => void;
  onCancel: () => void;
}

export function ReviewForm({ businessName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});
  const [touched, setTouched] = useState<{ rating?: boolean; comment?: boolean }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    } else if (comment.trim().length > 500) {
      newErrors.comment = 'Review must be 500 characters or less';
    } else {
      const injectionErr = sqlInjectionError(comment);
      if (injectionErr) newErrors.comment = injectionErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ rating: true, comment: true });

    if (!validateForm()) {
      return;
    }

    if (!isVerified) {
      alert('Please verify that you are human');
      return;
    }

    // Show success message
    setShowSuccess(true);

    // Submit after brief delay
    setTimeout(() => {
      onSubmit({ rating, comment });
    }, 1500);
  };

  const handleRatingBlur = () => {
    setTouched({ ...touched, rating: true });
    validateForm();
  };

  const handleCommentBlur = () => {
    setTouched({ ...touched, comment: true });
    validateForm();
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    if (touched.comment) {
      const injectionErr = sqlInjectionError(value);
      setErrors(prev => ({
        ...prev,
        comment: injectionErr || undefined
      }));
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg p-8 max-w-md w-full text-center shadow-2xl relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close success message"
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </button>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Review Submitted!</h3>
          <p className="text-muted-foreground">
            Thank you for your feedback. Your review helps others discover great local businesses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Leave a Review</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close review form"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-muted-foreground mb-6">
          Share your experience at <strong className="text-foreground">{businessName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block mb-2 text-foreground">
              Rating <span className="text-destructive">*</span>
            </label>
            <div 
              className="flex gap-2 mb-2"
              onBlur={handleRatingBlur}
              role="radiogroup"
              aria-label="Select rating"
              aria-required="true"
              aria-invalid={touched.rating && !!errors.rating}
            >
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= (hoverRating || rating);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
                    role="radio"
                    aria-checked={rating === starValue}
                  >
                    <Star
                      className={`w-10 h-10 transition-all ${
                        isActive
                          ? 'text-yellow-600 fill-yellow-600 scale-110'
                          : 'text-gray-300 fill-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            {touched.rating && errors.rating && (
              <div className="flex items-center gap-2 text-destructive text-sm" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{errors.rating}</span>
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="review-comment" className="block mb-2 text-foreground">
              Your Review <span className="text-destructive">*</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              onBlur={handleCommentBlur}
              placeholder="Share your experience... (10-500 characters)"
              className={`w-full px-4 py-3 rounded-lg border ${
                touched.comment && errors.comment
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              } bg-input-background focus:outline-none focus:ring-2 resize-none`}
              rows={5}
              maxLength={500}
              aria-required="true"
              aria-invalid={touched.comment && !!errors.comment}
              aria-describedby={errors.comment ? 'comment-error' : 'comment-help'}
            />
            <div className="flex items-center justify-between mt-2">
              <span 
                id="comment-help"
                className="text-sm text-muted-foreground"
              >
                {comment.length}/500 characters
              </span>
              {touched.comment && errors.comment && (
                <div 
                  id="comment-error"
                  className="flex items-center gap-2 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  <span>{errors.comment}</span>
                </div>
              )}
            </div>
          </div>

          <TextCaptcha onVerify={setIsVerified} />

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              aria-label="Cancel review"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(errors).length > 0 && (touched.rating || touched.comment)}
              aria-label="Submit review"
            >
              Submit Review
            </button>
          </div>

          {/* Validation Feedback Summary */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-foreground mb-2">Form Validation Status:</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className={rating > 0 ? 'text-green-600' : 'text-yellow-600'}>
                  {rating > 0 ? '✓' : '○'}
                </span>
                Rating selected
              </li>
              <li className="flex items-center gap-2">
                <span className={comment.length >= 10 ? 'text-green-600' : 'text-yellow-600'}>
                  {comment.length >= 10 ? '✓' : '○'}
                </span>
                Review comment (min 10 chars)
              </li>
              <li className="flex items-center gap-2">
                <span className={isVerified ? 'text-green-600' : 'text-yellow-600'}>
                  {isVerified ? '✓' : '○'}
                </span>
                Human verification
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}