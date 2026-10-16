'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ShieldCheck, 
  ArrowRight, 
  Edit2,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase/client';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, setUser } = useApp();
  
  // Step can be 'password' | 'phone' | 'otp' | 'set-password'
  const [authStep, setAuthStep] = useState<'password' | 'phone' | 'otp' | 'set-password'>('phone');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Password login state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Set / Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (authStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, timer]);

  // Determine initial screen when modal opens
  useEffect(() => {
    if (isAuthOpen) {
      const hasUsedBefore = typeof window !== 'undefined' && localStorage.getItem('kmart_has_logged_in_before') === 'true';
      setAuthStep(hasUsedBefore ? 'password' : 'phone');
      setError('');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsForgotPassword(false);
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setOtpDigits(['', '', '', '', '', '']);

      setTimeout(() => {
        if (hasUsedBefore) {
          phoneInputRef.current?.focus();
        } else {
          phoneInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isAuthOpen]);

  if (!isAuthOpen) return null;

  // ─── 1. Password Login Handler ───────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const normalized = `+91${digits}`;
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        phone: normalized,
        password,
      });

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (
          msg.includes('invalid') || 
          msg.includes('credentials') || 
          msg.includes('grant') || 
          msg.includes('user not found') ||
          msg.includes('wrong')
        ) {
          setError('Wrong mobile number or password.');
        } else {
          setError(signInError.message || 'Wrong mobile number or password.');
        }
        setIsLoading(false);
        return;
      }

      // Mark that this user has used the site before
      if (typeof window !== 'undefined') {
        localStorage.setItem('kmart_has_logged_in_before', 'true');
      }

      if (data?.user) {
        document.cookie = "kmart_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser(prev => ({
          ...prev,
          phone: normalized,
          isVerified: true,
        }));
      }

      setIsAuthOpen(false);
      setPassword('');
    } catch {
      setError('Wrong mobile number or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 2. Send OTP Handler ────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const normalized = `+91${digits}`;
      const { error: sendError } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (sendError) {
        console.warn('[AuthModal] sendOtp:', sendError.message);
        const msg = sendError.message.toLowerCase();
        if (msg.includes('rate') || msg.includes('too many')) {
          setError('Too many OTP attempts. Please wait a few minutes.');
          setIsLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('[AuthModal] sendOtp exception:', err?.message);
    } finally {
      setIsLoading(false);
    }

    setAuthStep('otp');
    setTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setTimeout(() => digitRefs.current[0]?.focus(), 100);
  };

  // ─── 3. OTP Change & KeyDown ────────────────────────────────────────────────
  const handleOtpChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric && val !== '') return;

    const newDigits = [...otpDigits];

    // Handle paste
    if (numeric.length > 1) {
      const pasted = numeric.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || '';
      setOtpDigits(newDigits);
      digitRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    newDigits[index] = numeric.slice(-1);
    setOtpDigits(newDigits);
    if (numeric && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // ─── 4. Verify OTP Handler ──────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalized = `+91${phoneNumber.replace(/\D/g, '')}`;
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: enteredOtp,
        type: 'sms',
      });

      if (verifyError) {
        setError(
          verifyError.message.includes('expired')
            ? 'OTP expired. Please request a new one.'
            : verifyError.message.includes('Invalid') || verifyError.message.includes('invalid')
            ? 'Incorrect OTP. Please try again.'
            : `Verification failed: ${verifyError.message}`
        );
        setIsLoading(false);
        return;
      }

      // Mark logged in before
      if (typeof window !== 'undefined') {
        localStorage.setItem('kmart_has_logged_in_before', 'true');
      }

      if (data?.user) {
        document.cookie = "kmart_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser(prev => ({
          ...prev,
          phone: normalized,
          isVerified: true,
        }));
      }

      // Per Goal 1: Check if user already has a password
      const { data: userData } = await supabase.auth.getUser();
      const hasPassword = userData?.user?.user_metadata?.has_password === true;

      setIsLoading(false);

      if (!hasPassword || isForgotPassword) {
        // Move straight to "Set a password" screen
        setAuthStep('set-password');
        setError('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Already has password set, and not a forgot-password flow: complete login
        setIsAuthOpen(false);
        setAuthStep('phone');
        setPhoneNumber('');
        setOtpDigits(['', '', '', '', '', '']);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  // ─── 5. Resend OTP Handler ──────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError('');
    try {
      const normalized = `+91${phoneNumber.replace(/\D/g, '')}`;
      await supabase.auth.signInWithOtp({ phone: normalized });
    } catch { /* ignore */ }
    setOtpDigits(['', '', '', '', '', '']);
    setTimer(30);
    setTimeout(() => digitRefs.current[0]?.focus(), 100);
  };

  // ─── 6. Set / Reset Password Handler ────────────────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { has_password: true }, // remembers that this account has a password
      });

      if (updateError) {
        setError(updateError.message || 'Unable to set password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Mark customer has logged in before
      if (typeof window !== 'undefined') {
        localStorage.setItem('kmart_has_logged_in_before', 'true');
      }

      setIsLoading(false);
      setIsAuthOpen(false);
      setAuthStep('phone');
      setPhoneNumber('');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsForgotPassword(false);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while setting password.');
      setIsLoading(false);
    }
  };

  // ─── 7. Skip Set Password Handler ("Maybe later") ───────────────────────────
  const handleSkipSetPassword = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kmart_has_logged_in_before', 'true');
    }
    setIsAuthOpen(false);
    setAuthStep('phone');
    setPhoneNumber('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsForgotPassword(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative my-6 text-left animate-modal-in">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          {authStep === 'otp' ? (
            <button
              onClick={() => setAuthStep('phone')}
              className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-[#0A2540] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : authStep === 'phone' && isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setAuthStep('password');
                setError('');
              }}
              className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-[#0A2540] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Password</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => setIsAuthOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <Logo size="lg" className="mx-auto" />
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              SCREEN 1: PASSWORD LOGIN (Default for returning customers)
          ════════════════════════════════════════════════════════════════════ */}
          {authStep === 'password' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-black text-[#0A2540] tracking-tight">
                  Welcome Back to <span className="text-[#E11A22]">K MART</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Sign in with your mobile number and password
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                {/* Mobile Number Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex rounded-xl border border-gray-300 focus-within:border-[#E11A22] focus-within:ring-2 focus-within:ring-red-100 overflow-hidden bg-white shadow-2xs">
                    <div className="bg-gray-50 px-3.5 flex items-center gap-1 border-r border-gray-200 text-xs font-bold text-gray-700">
                      <span>+91</span>
                    </div>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setAuthStep('phone');
                        setError('');
                      }}
                      className="text-[11px] font-bold text-[#E11A22] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="flex rounded-xl border border-gray-300 focus-within:border-[#E11A22] focus-within:ring-2 focus-within:ring-red-100 overflow-hidden bg-white shadow-2xs relative">
                    <div className="bg-gray-50 px-3.5 flex items-center justify-center border-r border-gray-200 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-[#E11A22] flex items-center gap-2 text-left">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10 || !password}
                  className="w-full bg-[#E11A22] hover:bg-[#c8141b] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setAuthStep('phone');
                      setError('');
                    }}
                    className="text-xs font-bold text-gray-600 hover:text-[#0A2540] hover:underline cursor-pointer"
                  >
                    Login with OTP instead
                  </button>
                </div>
              </form>

              <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Your information is safe and encrypted.</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              SCREEN 2: ENTER MOBILE NUMBER (For OTP Login or Forgot Password)
          ════════════════════════════════════════════════════════════════════ */}
          {authStep === 'phone' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-black text-[#0A2540] tracking-tight">
                  {isForgotPassword ? 'Reset Password' : (
                    <>Welcome to <span className="text-[#E11A22]">K MART</span></>
                  )}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isForgotPassword
                    ? 'Enter your registered mobile number to receive an OTP'
                    : 'Daily groceries. Branded essentials. Happier homes.'}
                </p>
              </div>

              {!isForgotPassword && (
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-lg block">🛒</span>
                    <span className="font-semibold">Top Brands</span>
                  </div>
                  <div>
                    <span className="text-lg block">🏷️</span>
                    <span className="font-semibold">Great Deals</span>
                  </div>
                  <div>
                    <span className="text-lg block">🚚</span>
                    <span className="font-semibold">Fast Delivery</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Enter your mobile number
                  </label>
                  <p className="text-[11px] text-gray-400 mb-2">
                    We will send you a One Time Password (OTP)
                  </p>

                  <div className="flex rounded-xl border border-gray-300 focus-within:border-[#E11A22] focus-within:ring-2 focus-within:ring-red-100 overflow-hidden bg-white shadow-2xs">
                    <div className="bg-gray-50 px-3.5 flex items-center gap-1 border-r border-gray-200 text-xs font-bold text-gray-700">
                      <span>+91</span>
                    </div>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Enter mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-[#E11A22] flex items-center gap-2 text-left">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
                  className="w-full bg-[#E11A22] hover:bg-[#c8141b] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Get OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!isForgotPassword && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('password');
                        setError('');
                      }}
                      className="text-xs font-bold text-gray-600 hover:text-[#0A2540] hover:underline cursor-pointer"
                    >
                      Login with password instead
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              SCREEN 3: VERIFY OTP
          ════════════════════════════════════════════════════════════════════ */}
          {authStep === 'otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-black text-[#0A2540] tracking-tight">
                  Verify Your Number
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  We have sent a 6-digit OTP via SMS to
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-bold text-xs text-gray-800">+91 {phoneNumber}</span>
                  <button
                    onClick={() => setAuthStep('phone')}
                    className="text-xs text-[#E11A22] font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex items-center justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { digitRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-11 h-12 text-center font-black text-lg border-2 rounded-xl focus:outline-none transition-all ${
                      digit ? "border-[#E11A22] bg-red-50/40 text-[#0A2540]" : "border-gray-200 bg-gray-50/50 text-gray-800 focus:border-[#E11A22] focus:ring-2 focus:ring-red-100"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-[#E11A22] flex items-center gap-2 text-left">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Did not receive OTP?</span>
                {timer > 0 ? (
                  <span className="font-semibold text-gray-600">
                    Resend in 00:{timer < 10 ? `0${timer}` : timer}
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="font-bold text-[#E11A22] hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                disabled={isLoading || otpDigits.join('').length < 6}
                onClick={handleVerifyOtp}
                className="w-full bg-[#E11A22] hover:bg-[#c8141b] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Your information is safe and encrypted.</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              SCREEN 4: SET / RESET PASSWORD (Prompted after OTP login)
          ════════════════════════════════════════════════════════════════════ */}
          {authStep === 'set-password' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2 text-[#E11A22]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A2540] tracking-tight">
                  {isForgotPassword ? 'Set New Password' : 'Set a Password for Faster Login'}
                </h2>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {isForgotPassword
                    ? 'Please choose a new password with at least 8 characters.'
                    : 'Next time, sign in instantly with your phone number and password without waiting for an OTP.'}
                </p>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    {isForgotPassword ? 'New Password' : 'Create Password'}
                  </label>
                  <div className="flex rounded-xl border border-gray-300 focus-within:border-[#E11A22] focus-within:ring-2 focus-within:ring-red-100 overflow-hidden bg-white shadow-2xs relative">
                    <div className="bg-gray-50 px-3.5 flex items-center justify-center border-r border-gray-200 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Confirm Password
                  </label>
                  <div className="flex rounded-xl border border-gray-300 focus-within:border-[#E11A22] focus-within:ring-2 focus-within:ring-red-100 overflow-hidden bg-white shadow-2xs relative">
                    <div className="bg-gray-50 px-3.5 flex items-center justify-center border-r border-gray-200 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-[#E11A22] flex items-center gap-2 text-left">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || newPassword.length < 8 || confirmPassword.length < 8}
                  className="w-full bg-[#E11A22] hover:bg-[#c8141b] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving password...</span>
                    </div>
                  ) : (
                    <>
                      <span>Save Password & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* "Maybe later" button - only show when NOT in forgot-password flow */}
                {!isForgotPassword && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleSkipSetPassword}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      Maybe later
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
