import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/common/Logo';
import { Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate, showToast, isAuthenticated, loginUser, loginWithGoogle, loginAsGuest } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; auth?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your email address';
    } else if (!identifier.includes('@')) {
      newErrors.identifier = 'Please enter a valid email format (e.g. name@example.com)';
    }
    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await loginUser(identifier.trim(), password);
      } catch (err: any) {
        setErrors({ auth: err.message || 'Incorrect email or password. Please try again or create an account.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrors({ auth: err.message || 'Google sign-in failed. Please try again or use Guest mode.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsGuest();
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier('explorer@seizeontrip.com');
    setPassword('Varanasi2026!');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6 py-10 max-w-md mx-auto">
      {/* Top Logo */}
      <div className="mb-4">
        <Logo size="lg" variant="full" onClick={() => navigate('/home')} />
      </div>

      {/* Backend & Auth Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-5">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>Firebase Auth & Cloud Firestore Connected</span>
      </div>

      {/* Segmented Tab Switcher (Login / Register) */}
      <div className="w-full flex p-1 rounded-2xl bg-gray-100 border border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-[#005B49] shadow-xs transition-all cursor-pointer"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
        >
          Register
        </button>
      </div>

      {/* Heading */}
      <div className="w-full text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#005B49] tracking-tight">
          Welcome back!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 font-normal">
          Login to sync your saved Varanasi places & trips
        </p>
      </div>

      {/* Social Logins */}
      <div className="w-full space-y-3 mb-5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-xs cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-700 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-500" />
          <span>Quick 1-Click Guest Sign-In</span>
        </button>
      </div>

      <div className="w-full flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">or sign in with email</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Demo helper */}
      <div className="w-full mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
        <span>Test with demo credentials:</span>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="font-bold underline hover:text-amber-950 cursor-pointer"
        >
          Auto-fill
        </button>
      </div>

      {/* Global auth error */}
      {errors.auth && (
        <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errors.auth}</p>
            <p className="mt-1 text-[11px] text-rose-600">
              Tip: You can click <strong>Register</strong> above to create a fresh new account instantly, or use Guest mode!
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            id="login-email-input"
            type="email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier || errors.auth) setErrors({});
            }}
            placeholder="Email address (e.g. rahul@example.com)"
            className={`w-full px-4 py-3.5 rounded-2xl border ${
              errors.identifier ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
            } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 transition-colors`}
          />
          {errors.identifier && (
            <p className="text-xs text-rose-500 mt-1 pl-1">{errors.identifier}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              id="login-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.auth) setErrors({});
              }}
              placeholder="Password"
              className={`w-full px-4 py-3.5 pr-11 rounded-2xl border ${
                errors.password ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
              } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1 pl-1">{errors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-base transition-all active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="w-full text-center mt-6 space-y-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="font-bold text-[#005B49] hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </p>

        <button
          onClick={handleGuestLogin}
          className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          Continue as Guest Explorer
        </button>
      </div>
    </div>
  );
};

export const SignUpPage: React.FC = () => {
  const { navigate, isAuthenticated, signupUser, loginWithGoogle, loginAsGuest } = useApp();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; identifier?: string; password?: string; auth?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; identifier?: string; password?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }
    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your email address';
    } else if (!identifier.includes('@')) {
      newErrors.identifier = 'Please enter a valid email format';
    }
    if (!password) {
      newErrors.password = 'Please enter a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await signupUser(fullName.trim(), identifier.trim(), password);
      } catch (err: any) {
        setErrors({ auth: err.message || 'Unable to create account. Please try Google Sign-In or Guest mode.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrors({ auth: err.message || 'Google sign-in failed. Please try again or use Guest mode.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsGuest();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6 py-10 max-w-md mx-auto">
      {/* Top Logo */}
      <div className="mb-4">
        <Logo size="lg" variant="full" onClick={() => navigate('/home')} />
      </div>

      {/* Backend & Auth Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-5">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>Firebase Auth & Cloud Firestore</span>
      </div>

      {/* Segmented Tab Switcher (Login / Register) */}
      <div className="w-full flex p-1 rounded-2xl bg-gray-100 border border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-[#005B49] shadow-xs transition-all cursor-pointer"
        >
          Register
        </button>
      </div>

      {/* Heading */}
      <div className="w-full text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#005B49] tracking-tight">
          Create your account
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1.5 font-normal">
          Save hidden ghats, generate AI trips & connect with local artisans
        </p>
      </div>

      {/* 1-Click Social Sign-In (Firebase Configured) */}
      <div className="w-full space-y-3 mb-5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-xs cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-700 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-500" />
          <span>Quick 1-Click Guest Sign-In</span>
        </button>
      </div>

      <div className="w-full flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">or register with email</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Global auth error */}
      {errors.auth && (
        <div className="w-full mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-semibold">{errors.auth}</p>
            </div>
          </div>

          {errors.auth.toLowerCase().includes('already registered') && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="self-start mt-1 px-3 py-1.5 rounded-lg bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] transition-colors cursor-pointer"
            >
              Sign In to Existing Account →
            </button>
          )}

          <p className="text-[11px] text-rose-600">
            Tip: You can also use 1-click Google Sign-In or Guest Sign-In above!
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            id="signup-name-input"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName || errors.auth) setErrors({});
            }}
            placeholder="Full Name (e.g. Rahul Singh)"
            className={`w-full px-4 py-3.5 rounded-2xl border ${
              errors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
            } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 transition-colors`}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-500 mt-1 pl-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <input
            id="signup-email-input"
            type="email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier || errors.auth) setErrors({});
            }}
            placeholder="Email Address"
            className={`w-full px-4 py-3.5 rounded-2xl border ${
              errors.identifier ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
            } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 transition-colors`}
          />
          {errors.identifier && (
            <p className="text-xs text-rose-500 mt-1 pl-1">{errors.identifier}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              id="signup-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.auth) setErrors({});
              }}
              placeholder="Password (minimum 6 characters)"
              className={`w-full px-4 py-3.5 pr-11 rounded-2xl border ${
                errors.password ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
              } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1 pl-1">{errors.password}</p>
          )}
        </div>

        {/* Sign Up Button */}
        <button
          id="signup-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-base transition-all active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-75 mt-2 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registering in Firestore...</span>
            </>
          ) : (
            'Sign Up with Firebase'
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="w-full text-center mt-8 space-y-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-[#005B49] hover:underline cursor-pointer"
          >
            Login
          </button>
        </p>

        <button
          onClick={async () => {
            await loginAsGuest();
          }}
          className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          Continue as Guest Explorer
        </button>
      </div>
    </div>
  );
};
