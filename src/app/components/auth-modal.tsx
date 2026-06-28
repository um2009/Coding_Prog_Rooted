// Authentication Modal for Sign In / Sign Up
import { useState } from 'react';
import { X } from 'lucide-react';
import { authService, User } from '@/app/services/authService';
import { TextCaptcha } from './text-captcha';
import { sqlInjectionError } from '@/app/utils/sanitize';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validation
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (password.length > 128) {
      return 'Password must be less than 128 characters';
    }
    // Check for at least one letter and one number for stronger password
    if (mode === 'signup') {
      if (!/[a-zA-Z]/.test(password)) {
        return 'Password must contain at least one letter';
      }
      if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
      }
    }
    return '';
  };

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let errorMsg = '';
    if (field === 'email') {
      errorMsg = validateEmail(email);
    } else if (field === 'password') {
      errorMsg = validatePassword(password);
    } else if (field === 'name') {
      errorMsg = validateName(name);
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = { email: true, password: true };
    if (mode === 'signup') {
      allTouched.name = true;
    }
    setTouched(allTouched);
    
    // Validate all fields
    const errors: Record<string, string> = {
      email: validateEmail(email),
      password: validatePassword(password)
    };

    if (mode === 'signup') {
      errors.name = validateName(name);
    }

    // SQL injection checks on free-text fields
    const emailInjection = sqlInjectionError(email);
    if (emailInjection) errors.email = emailInjection;
    if (mode === 'signup') {
      const nameInjection = sqlInjectionError(name);
      if (nameInjection) errors.name = nameInjection;
    }

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) {
      return;
    }
    
    // Bot verification check
    if (!verified) {
      setError('Please verify that you are not a robot');
      return;
    }
    
    setLoading(true);

    try {
      let user: User;
      
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        user = await authService.signUp(email, password, name);
      } else {
        user = await authService.signIn(email, password);
      }

      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => handleBlur('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Your name"
                required
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="you@example.com"
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => handleBlur('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="••••••••"
              required
              minLength={6}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
            )}
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            )}
          </div>

          <TextCaptcha onVerify={setVerified} />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}