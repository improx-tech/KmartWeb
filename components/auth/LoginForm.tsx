"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Edit2, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound 
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useApp } from "@/context/AppContext";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  const targetRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
  const { setUser } = useApp();

  // Step can be "password" | "phone" | "otp" | "set-password"
  const [step, setStep] = useState<"password" | "phone" | "otp" | "set-password">("phone");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [phone, setPhone] = useState("");

  // Password login state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Set / Reset password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);

  // Status states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus & initial check on mount:
  // If customer has previously logged in on this device, default to password login
  useEffect(() => {
    const hasUsedBefore = typeof window !== "undefined" && localStorage.getItem("kmart_has_logged_in_before") === "true";
    if (hasUsedBefore) {
      setStep("password");
    } else {
      setStep("phone");
    }
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 100);
  }, []);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, seconds]);

  // ─── 1. Password Login Handler ───────────────────────────────────────────────
  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const normalized = `+91${digits}`;
      const { data, error: signInError } = await authService.signInWithPassword(normalized, password);

      if (signInError) {
        console.warn("[LoginForm] signInWithPassword error:", signInError.message);
        const msg = signInError.message.toLowerCase();
        if (
          msg.includes("invalid") || 
          msg.includes("credentials") || 
          msg.includes("grant") || 
          msg.includes("user not found") ||
          msg.includes("wrong")
        ) {
          setError("Wrong mobile number or password.");
        } else {
          setError(signInError.message || "Wrong mobile number or password.");
        }
        setLoading(false);
        return;
      }

      // Mark that user has logged in before
      if (typeof window !== "undefined") {
        localStorage.setItem("kmart_has_logged_in_before", "true");
      }

      if (data?.user) {
        document.cookie = "kmart_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser((prev) => ({
          ...prev,
          phone: data.user.phone || normalized,
          isVerified: true,
        }));
      }

      router.push(targetRedirect);
      router.refresh();
    } catch (e: any) {
      console.warn("[LoginForm] password login exception:", e?.message);
      setError("Wrong mobile number or password.");
    } finally {
      setLoading(false);
    }
  }

  // ─── 2. Send OTP Handler ────────────────────────────────────────────────────
  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const { error: sendError } = await authService.sendOtp(phone);

      if (sendError) {
        console.warn("[LoginForm] sendOtp error:", sendError.message, "code:", (sendError as any).code);
        const msg = sendError.message.toLowerCase();
        const code = (sendError as any).code;

        if (code === "over_sms_send_rate_limit" || msg.includes("rate") || msg.includes("too many")) {
          setError("Too many attempts: Supabase SMS rate limit exceeded. Please wait a few minutes or adjust Rate Limits in your Supabase Dashboard.");
        } else if (code === "sms_send_failed" || msg.includes("provider") || msg.includes("twilio")) {
          setError("SMS gateway error: Twilio credentials in Supabase are invalid or unconfigured.");
        } else if ((msg.includes("sms") && msg.includes("not")) || (msg.includes("phone") && msg.includes("not"))) {
          setError("SMS not configured. Please contact support.");
        } else {
          setError("Unable to send OTP. Please try again.");
        }
        return;
      }
    } catch (e: any) {
      console.warn("[LoginForm] sendOtp exception:", e?.message);
      setError("Unable to send OTP. Please check your connection and try again.");
      return;
    } finally {
      setLoading(false);
    }

    // Only reach here when sendOtp succeeded
    setStep("otp");
    setSeconds(30);
    setOtpDigits(["", "", "", "", "", ""]);
    setTimeout(() => {
      digitRefs.current[0]?.focus();
    }, 100);
  }

  // ─── 3. OTP Digits Input Helpers ────────────────────────────────────────────
  const handleDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric && val !== "") return;

    const newDigits = [...otpDigits];

    // Handle paste (6 digits at once)
    if (numeric.length > 1) {
      const pasted = numeric.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      digitRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = numeric.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (numeric && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // ─── 4. Verify OTP Handler ──────────────────────────────────────────────────
  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: verifyError } = await authService.verifyOtp(phone, fullOtp);

      if (verifyError) {
        const msg = verifyError.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("token has expired")) {
          setError("The OTP has expired. Please request a new one.");
        } else if (
          msg.includes("invalid") ||
          msg.includes("incorrect") ||
          msg.includes("mismatch") ||
          msg.includes("otp")
        ) {
          setError("The OTP is invalid or has expired. Please request a new OTP.");
        } else {
          setError("Unable to verify OTP. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Mark user has logged in before
      if (typeof window !== "undefined") {
        localStorage.setItem("kmart_has_logged_in_before", "true");
      }

      if (data?.user) {
        document.cookie = "kmart_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        const supaPhone = data.user.phone || `+91${phone.replace(/\D/g, "")}`;
        setUser((prev) => ({
          ...prev,
          phone: supaPhone,
          isVerified: true,
        }));
      }

      // Check if the user already has a password set
      const { data: userData } = await authService.getCurrentUser();
      const hasPassword = authService.hasPasswordSet(userData?.user);

      setLoading(false);

      if (!hasPassword || isForgotPassword) {
        // Move straight to "Set a password" screen
        setStep("set-password");
        setError("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        // Has password and was not forgot-password flow: direct redirect
        router.push(targetRedirect);
        router.refresh();
      }
    } catch (e: any) {
      setError("Something went wrong. Please try again.");
      console.warn("[LoginForm] verifyOtp exception:", e?.message);
      setLoading(false);
    }
  }

  // ─── 5. Resend OTP ──────────────────────────────────────────────────────────
  async function handleResendOtp() {
    if (seconds > 0 || resending || !phone) return;
    setResending(true);
    setError("");
    try {
      const { error: resendError } = await authService.sendOtp(phone);
      if (resendError) {
        const msg = resendError.message.toLowerCase();
        const code = (resendError as any).code;

        if (code === "over_sms_send_rate_limit" || msg.includes("rate") || msg.includes("too many")) {
          setError("Too many attempts. Supabase SMS rate limit exceeded. Please wait a few minutes.");
        } else if (code === "sms_send_failed" || msg.includes("provider") || msg.includes("twilio")) {
          setError("SMS gateway error: Twilio credentials in Supabase are invalid or unconfigured.");
        } else {
          setError("Unable to resend OTP. Please try again.");
        }
        setResending(false);
        return;
      }
      setOtpDigits(["", "", "", "", "", ""]);
      setSeconds(30);
      digitRefs.current[0]?.focus();
    } catch (e: any) {
      console.warn("[LoginForm] resendOtp exception:", e?.message);
      setError("Unable to resend OTP. Please check your connection.");
    } finally {
      setResending(false);
    }
  }

  // ─── 6. Set / Reset Password Handler ────────────────────────────────────────
  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await authService.setPassword(newPassword);

      if (updateError) {
        setError(updateError.message || "Unable to set password. Please try again.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("kmart_has_logged_in_before", "true");
      }

      setLoading(false);
      router.push(targetRedirect);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong while setting password.");
      setLoading(false);
    }
  }

  // ─── 7. Maybe Later (Skip) ──────────────────────────────────────────────────
  function handleSkipSetPassword() {
    if (typeof window !== "undefined") {
      localStorage.setItem("kmart_has_logged_in_before", "true");
    }
    router.push(targetRedirect);
    router.refresh();
  }

  const maskedPhone =
    phone.length >= 10
      ? `+91 ${phone.slice(0, 2)}••••••${phone.slice(-2)}`
      : phone;

  return (
    <div>
      {/* ════════════════════════════════════════════════════════════════════
          SCREEN 1: PASSWORD LOGIN (Default for returning users)
      ════════════════════════════════════════════════════════════════════ */}
      {step === "password" && (
        <div>
          <div className="mb-6 text-left">
            <h2 className="text-2xl font-black text-[#0A2540] tracking-tight">
              Welcome Back to <span className="text-[#E11A22]">K MART</span>
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 font-medium leading-relaxed">
              Sign in with your mobile number and password for instant access.
            </p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {/* Mobile Number Field */}
            <div>
              <label
                htmlFor="login-phone"
                className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider text-left"
              >
                Mobile Number
              </label>

              <div className="flex items-center rounded-xl border-2 border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#E11A22] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3.5 py-3.5 text-sm font-black text-[#0A2540] select-none shrink-0">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span>+91</span>
                </div>

                <input
                  ref={phoneInputRef}
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="w-full flex-1 border-0 bg-transparent px-3 py-3.5 text-base font-bold tracking-wider text-[#0A2540] placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 outline-none"
                />

                {phone.length === 10 && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider text-left"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setStep("phone");
                    setError("");
                  }}
                  className="text-xs font-bold text-[#E11A22] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex items-center rounded-xl border-2 border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#E11A22] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 relative">
                <div className="px-3.5 py-3.5 text-gray-400 flex items-center justify-center border-r border-gray-200">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  ref={passwordInputRef}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full flex-1 border-0 bg-transparent px-3 py-3.5 text-sm font-bold text-[#0A2540] placeholder:font-normal placeholder:text-gray-400 outline-none pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              disabled={loading || phone.replace(/\D/g, "").length < 10 || !password}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E11A22] hover:bg-[#c8141b] py-3.5 px-4 font-black text-sm text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Switch to OTP */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setStep("phone");
                setError("");
              }}
              className="text-xs font-bold text-gray-700 hover:text-[#E11A22] transition-colors py-1 px-3 cursor-pointer"
            >
              Login with OTP instead
            </button>

            <button
              type="button"
              onClick={() => {
                document.cookie = "kmart_guest=true; path=/; max-age=86400";
                router.push(targetRedirect);
                router.refresh();
              }}
              className="text-xs font-bold text-gray-500 hover:text-[#E11A22] transition-colors py-1.5 px-3 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore store as Guest</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SCREEN 2: ENTER MOBILE NUMBER (For OTP Login or Forgot Password)
      ════════════════════════════════════════════════════════════════════ */}
      {step === "phone" && (
        <div>
          {/* Back button if in forgot-password mode */}
          {isForgotPassword && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setStep("password");
                  setError("");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#0A2540] cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Password Login</span>
              </button>
            </div>
          )}

          <div className="mb-6 text-left">
            <h2 className="text-2xl font-black text-[#0A2540] tracking-tight">
              {isForgotPassword ? "Reset Password" : "Welcome to K MART"}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 font-medium leading-relaxed">
              {isForgotPassword
                ? "Enter your 10-digit mobile number to verify with an OTP and set a new password."
                : "Enter your 10-digit mobile number to receive a verification code via SMS."}
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="otp-phone"
                className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider text-left"
              >
                Mobile Number
              </label>

              <div className="flex items-center rounded-xl border-2 border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#E11A22] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3.5 py-3.5 text-sm font-black text-[#0A2540] select-none shrink-0">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span>+91</span>
                </div>

                <input
                  ref={phoneInputRef}
                  id="otp-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="w-full flex-1 border-0 bg-transparent px-3 py-3.5 text-base font-bold tracking-wider text-[#0A2540] placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 outline-none"
                />

                {phone.length === 10 && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                )}
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
              disabled={loading || phone.replace(/\D/g, "").length < 10}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E11A22] hover:bg-[#c8141b] py-3.5 px-4 font-black text-sm text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setStep("password");
                  setError("");
                }}
                className="text-xs font-bold text-gray-700 hover:text-[#E11A22] transition-colors py-1 px-3 cursor-pointer"
              >
                Login with password instead
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                document.cookie = "kmart_guest=true; path=/; max-age=86400";
                router.push(targetRedirect);
                router.refresh();
              }}
              className="text-xs font-bold text-gray-500 hover:text-[#E11A22] transition-colors py-1.5 px-3 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore store as Guest</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400 font-medium">
            By continuing, you agree to K MART's{" "}
            <span className="text-gray-600 font-bold underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-gray-600 font-bold underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SCREEN 3: OTP VERIFICATION
      ════════════════════════════════════════════════════════════════════ */}
      {step === "otp" && (
        <div>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
                setTimeout(() => phoneInputRef.current?.focus(), 100);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#E11A22] transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Change Number</span>
            </button>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              OTP Sent
            </span>
          </div>

          {/* Header */}
          <div className="mb-5 text-left">
            <h2 className="text-2xl font-black text-[#0A2540] tracking-tight">
              Verify Mobile
            </h2>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-600">
              <span>6-digit code sent to</span>
              <span className="font-mono font-black text-[#0A2540] bg-gray-100 px-1.5 py-0.5 rounded">
                {maskedPhone}
              </span>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-gray-400 hover:text-[#E11A22] p-1 cursor-pointer transition-colors"
                title="Edit Phone Number"
              >
                <Edit2 size={13} />
              </button>
            </div>
          </div>

          {/* 6-box OTP input */}
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { digitRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 transition-all outline-none ${
                    digit
                      ? "border-[#E11A22] bg-red-50/40 text-[#0A2540]"
                      : "border-gray-200 bg-gray-50/50 text-gray-800 focus:border-[#E11A22] focus:bg-white focus:ring-4 focus:ring-red-50"
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

            <button
              type="submit"
              disabled={loading || otpDigits.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E11A22] hover:bg-[#c8141b] py-3.5 px-4 font-black text-sm text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify &amp; Continue</span>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-4 text-center text-xs">
            {seconds > 0 ? (
              <p className="text-gray-500 font-medium">
                Didn't receive code? Resend in{" "}
                <span className="font-mono font-black text-[#0A2540]">{seconds}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="font-bold text-[#E11A22] hover:text-[#c8141b] hover:underline cursor-pointer disabled:opacity-50"
              >
                {resending ? "Sending new code..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SCREEN 4: SET / RESET PASSWORD (Prompted after OTP login)
      ════════════════════════════════════════════════════════════════════ */}
      {step === "set-password" && (
        <div className="space-y-5">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2 text-[#E11A22]">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#0A2540] tracking-tight">
              {isForgotPassword ? "Set New Password" : "Set a Password for Faster Login"}
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {isForgotPassword
                ? "Please choose a secure new password with at least 8 characters."
                : "Next time, sign in instantly with your mobile number and password without waiting for an SMS OTP."}
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 text-left">
                {isForgotPassword ? "New Password" : "Create Password"}
              </label>
              <div className="flex items-center rounded-xl border-2 border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#E11A22] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 relative">
                <div className="px-3.5 py-3 text-gray-400 flex items-center justify-center border-r border-gray-200">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full flex-1 border-0 bg-transparent px-3 py-3 text-sm font-bold text-[#0A2540] placeholder:font-normal placeholder:text-gray-400 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 text-left">
                Confirm Password
              </label>
              <div className="flex items-center rounded-xl border-2 border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#E11A22] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 relative">
                <div className="px-3.5 py-3 text-gray-400 flex items-center justify-center border-r border-gray-200">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full flex-1 border-0 bg-transparent px-3 py-3 text-sm font-bold text-[#0A2540] placeholder:font-normal placeholder:text-gray-400 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              disabled={loading || newPassword.length < 8 || confirmPassword.length < 8}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E11A22] hover:bg-[#c8141b] py-3.5 px-4 font-black text-sm text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving password...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* "Maybe later" button - only show when NOT in forgot-password flow */}
            {!isForgotPassword && (
              <div className="text-center pt-2">
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
  );
}
