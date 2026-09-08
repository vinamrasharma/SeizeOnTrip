import React, { useState } from 'react';
import { useApp, defaultAccounts, saveLocalRegisteredAccount, getLocalRegisteredUsers } from '../context/AppContext';
import { Logo } from '../components/common/Logo';
import { safeFetchJson } from '../utils/apiHelper';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate, showToast, isAuthenticated, user, loginUser, loginWithGoogle, loginAsGuest } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; auth?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ loading?: boolean; success?: string; error?: string }>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { identifier?: string; password?: string } = {};

    const cleanId = identifier.trim();
    if (!cleanId) {
      newErrors.identifier = 'Please enter your email address';
    } else if (!validateEmail(cleanId)) {
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
        await loginUser(cleanId, password);
      } catch (err: any) {
        setErrors({ auth: err.message || 'Incorrect email or password. Please try again or create an account.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
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
    setErrors({});
    try {
      await loginAsGuest();
    } catch (err: any) {
      setErrors({ auth: 'Guest sign-in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrors({});
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setForgotStatus({ error: 'Please enter a valid registered email address.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotStatus({ error: 'New password must be at least 6 characters.' });
      return;
    }

    setForgotStatus({ loading: true });
    try {
      const serverRes = await safeFetchJson<{ success: boolean; message?: string; error?: string }>(
        '/api/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, newPassword }),
        }
      );

      // Also update local registered account or default account so login works immediately
      const localUsers = getLocalRegisteredUsers();
      if (localUsers[cleanEmail]) {
        saveLocalRegisteredAccount(cleanEmail, {
          ...localUsers[cleanEmail],
          passwordHash: newPassword,
        });
      } else if (defaultAccounts[cleanEmail]) {
        saveLocalRegisteredAccount(cleanEmail, {
          user: defaultAccounts[cleanEmail].user,
          passwordHash: newPassword,
        });
      }

      setForgotStatus({ success: serverRes.data?.message || 'Password has been updated! You can now log in.' });
      showToast('Password reset successfully!');
      setIdentifier(cleanEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStatus({});
      }, 1500);
    } catch (err: any) {
      setForgotStatus({ error: err.message || 'Could not reset password.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 max-w-md mx-auto">
      {/* Top Logo */}
      <div className="mb-4">
        <Logo size="lg" variant="full" onClick={() => navigate('/home')} />
      </div>

      {/* Backend & Auth Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-4">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>Firebase Cloud Storage & Auth Verified</span>
      </div>

      {/* Active User Session Notice */}
      {isAuthenticated && (
        <div className="w-full mb-5 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-[#005B49] shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Signed in as {user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="px-3 py-1.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Home</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Segmented Tab Switcher (Login / Register) */}
      <div className="w-full flex p-1 rounded-2xl bg-gray-200/70 border border-gray-200 mb-5">
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

      {/* Card Wrapper */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005B49] tracking-tight">
            Welcome back!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal">
            Sign in to sync your saved Varanasi places, trips & artisan notes
          </p>
        </div>

        {/* Social Logins */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-xs cursor-pointer disabled:opacity-60"
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
            className="w-full py-2.5 px-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            <Sparkles size={15} className="text-amber-500" />
            <span>Quick 1-Click Guest Sign-In</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">or email login</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Demo Accounts Quick-Select */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <KeyRound size={13} className="text-amber-700" />
              <span>1-Click Test Accounts:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('vinamra123409@gmail.com', 'Password123!')}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold hover:bg-amber-100/50 cursor-pointer text-[11px] transition-colors"
            >
              Vinamra (Creator)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('explorer@seizeontrip.com', 'Varanasi2026!')}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold hover:bg-amber-100/50 cursor-pointer text-[11px] transition-colors"
            >
              Rahul (Explorer)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('priya@example.com', 'Priya@123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold hover:bg-amber-100/50 cursor-pointer text-[11px] transition-colors"
            >
              Priya (Traveler)
            </button>
          </div>
        </div>

        {/* Auth Error Banner */}
        {errors.auth && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-semibold">{errors.auth}</p>
              </div>
            </div>

            {errors.auth.toLowerCase().includes('no account') && (
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="self-start mt-1 px-3 py-1.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Create a New Account</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input
              id="login-email-input"
              type="email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errors.identifier || errors.auth) setErrors({});
              }}
              placeholder="e.g. explorer@seizeontrip.com"
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-2xl border ${
                errors.identifier ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
              } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm text-gray-900 transition-colors`}
            />
            {errors.identifier && (
              <p className="text-xs text-rose-500 mt-1 pl-1">{errors.identifier}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(identifier || '');
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-[#005B49] hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.auth) setErrors({});
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 pr-11 rounded-2xl border ${
                  errors.password ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
                } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm text-gray-900 transition-colors`}
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
            className="w-full py-3.5 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm sm:text-base transition-all active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-bold text-[#005B49] hover:underline cursor-pointer"
            >
              Create an Account
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your email and set a new password to restore account access.
            </p>

            {forgotStatus.error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {forgotStatus.error}
              </div>
            )}
            {forgotStatus.success && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{forgotStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:border-[#005B49] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choose new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:border-[#005B49] focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={forgotStatus.loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] cursor-pointer disabled:opacity-60"
                >
                  {forgotStatus.loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus({});
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const SignUpPage: React.FC = () => {
  const { navigate, isAuthenticated, user, signupUser, loginWithGoogle, loginAsGuest } = useApp();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errors, setErrors] = useState<{ fullName?: string; identifier?: string; password?: string; confirmPassword?: string; auth?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; identifier?: string; password?: string; confirmPassword?: string } = {};

    const cleanName = fullName.trim();
    const cleanEmail = identifier.trim();

    if (!cleanName) {
      newErrors.fullName = 'Please enter your full name';
    }
    if (!cleanEmail) {
      newErrors.identifier = 'Please enter your email address';
    } else if (!validateEmail(cleanEmail)) {
      newErrors.identifier = 'Please enter a valid email format (e.g. name@example.com)';
    }

    if (!password) {
      newErrors.password = 'Please enter a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await signupUser(cleanName, cleanEmail, password);
      } catch (err: any) {
        setErrors({ auth: err.message || 'Unable to create account. Please try Google Sign-In or Guest mode.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
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
    setErrors({});
    try {
      await loginAsGuest();
    } catch (err: any) {
      setErrors({ auth: 'Guest sign-in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 max-w-md mx-auto">
      {/* Top Logo */}
      <div className="mb-4">
        <Logo size="lg" variant="full" onClick={() => navigate('/home')} />
      </div>

      {/* Backend & Auth Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-4">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>Firebase Cloud Storage & Auth Verified</span>
      </div>

      {/* Active User Session Notice */}
      {isAuthenticated && (
        <div className="w-full mb-5 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-[#005B49] shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Signed in as {user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="px-3 py-1.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Home</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Segmented Tab Switcher (Login / Register) */}
      <div className="w-full flex p-1 rounded-2xl bg-gray-200/70 border border-gray-200 mb-5">
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

      {/* Card Wrapper */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005B49] tracking-tight">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal">
            Save hidden ghats, generate AI trips & connect with local artisans
          </p>
        </div>

        {/* 1-Click Social Sign-In */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-xs cursor-pointer disabled:opacity-60"
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
            className="w-full py-2.5 px-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            <Sparkles size={15} className="text-amber-500" />
            <span>Quick 1-Click Guest Sign-In</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">or register with email</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Global auth error */}
        {errors.auth && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-semibold">{errors.auth}</p>
              </div>
            </div>

            {errors.auth.toLowerCase().includes('already registered') && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="self-start mt-1 px-3 py-1.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Log In with this Email</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input
              id="signup-name-input"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName || errors.auth) setErrors({});
              }}
              placeholder="e.g. Rahul Singh"
              className={`w-full px-4 py-2.5 sm:py-3 rounded-2xl border ${
                errors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
              } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm text-gray-900 transition-colors`}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 mt-1 pl-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input
              id="signup-email-input"
              type="email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errors.identifier || errors.auth) setErrors({});
              }}
              placeholder="e.g. rahul@example.com"
              className={`w-full px-4 py-2.5 sm:py-3 rounded-2xl border ${
                errors.identifier ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
              } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm text-gray-900 transition-colors`}
            />
            {errors.identifier && (
              <p className="text-xs text-rose-500 mt-1 pl-1">{errors.identifier}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                id="signup-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.auth) setErrors({});
                }}
                placeholder="At least 6 characters"
                className={`w-full px-4 py-2.5 sm:py-3 pr-11 rounded-2xl border ${
                  errors.password ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
                } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm text-gray-900 transition-colors`}
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

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                id="signup-confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword || errors.auth) setErrors({});
                }}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-2.5 sm:py-3 pr-11 rounded-2xl border ${
                  errors.confirmPassword ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200'
                } focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm text-gray-900 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 mt-1 pl-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="signup-terms-check"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 rounded text-[#005B49] focus:ring-[#005B49] border-gray-300 cursor-pointer"
            />
            <label htmlFor="signup-terms-check" className="text-[11px] text-gray-600 select-none cursor-pointer">
              I agree to the Community Guidelines & Local Artisan Heritage Pledge
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            id="signup-submit-btn"
            type="submit"
            disabled={isLoading || !agreedTerms}
            className="w-full py-3.5 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm sm:text-base transition-all active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-[#005B49] hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
