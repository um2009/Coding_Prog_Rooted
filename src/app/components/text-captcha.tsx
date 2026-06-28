import { useState } from 'react';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface TextCaptchaProps {
  onVerify: (verified: boolean) => void;
}

export function TextCaptcha({ onVerify }: TextCaptchaProps) {
  const [value, setValue] = useState(0);
  const THRESHOLD = 92;
  const verified = value >= THRESHOLD;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setValue(v);
    onVerify(v >= THRESHOLD);
  };

  const handleReset = () => {
    if (!verified) return; // only reset if re-opened; verified stays
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">
          Human Verification <span className="text-destructive">*</span>
        </span>
      </div>

      {/* Slider track */}
      <div className="relative select-none">
        <div
          className={`relative h-11 rounded-lg overflow-hidden border transition-colors duration-300 ${
            verified ? 'border-green-500 bg-green-50' : 'border-border bg-background'
          }`}
        >
          {/* Fill bar */}
          <div
            className={`absolute left-0 top-0 h-full transition-colors duration-200 ${
              verified ? 'bg-green-500/20' : 'bg-primary/10'
            }`}
            style={{ width: `${value}%` }}
          />

          {/* Label text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={`text-sm font-medium transition-opacity duration-200 ${
                verified ? 'text-green-700' : 'text-muted-foreground'
              } ${value > 30 && value < THRESHOLD ? 'opacity-0' : 'opacity-100'}`}
            >
              {verified ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Slide to verify
                </span>
              )}
            </span>
          </div>

          {/* Range input — invisible but functional on top */}
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={handleChange}
            disabled={verified}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing disabled:cursor-default"
            aria-label="Slide to verify you are human"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={verified ? 'Verified' : 'Slide to verify'}
          />

          {/* Custom thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-md flex items-center justify-center shadow-md border transition-colors duration-200 pointer-events-none ${
              verified
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-white border-border text-primary'
            }`}
            style={{ left: `clamp(18px, ${value}%, calc(100% - 18px))` }}
            aria-hidden="true"
          >
            {verified ? (
              <Check className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag the slider all the way to the right to confirm you're human
      </p>
    </div>
  );
}
