import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

const OTP_LENGTH = 6;
const emptyOtp = () => Array(OTP_LENGTH).fill("");

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.detail ||
  error.response?.data?.error ||
  fallback;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  // Refs for OTP auto-focus
  const otpRefs = useRef([]);

  // --- STEP 1: Handle Email Submission ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtp(emptyOtp());
      setVerifiedOtp("");
      setPasswords({ new: "", confirm: "" });
      setIsLoading(false);
      toast.success("Verification code sent!");
      setStep(2);
    } catch (error) {
      setIsLoading(false);
      toast.error(getErrorMessage(error, "Unable to send reset code."));
    }
  };

  // --- STEP 2: Handle OTP Input & Verification ---
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only take last char
    setOtp(newOtp);
    setVerifiedOtp("");

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Auto-backspace to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < OTP_LENGTH)
      return toast.error("Enter the full 6-digit code");

    setVerifiedOtp(enteredOtp);
    setStep(3);
  };

  // --- STEP 3: Handle Password Reset ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.new.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (passwords.new !== passwords.confirm)
      return toast.error("Passwords do not match");
    const enteredOtp = otp.join("");
    if (!verifiedOtp || verifiedOtp !== enteredOtp) {
      setStep(2);
      return toast.error("Please verify the correct OTP first");
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password/", {
        email,
        otp: verifiedOtp,
        new_password: passwords.new,
        confirm_new_password: passwords.confirm,
      });
      setIsLoading(false);
      toast.success("Password reset successfully!");
      navigate("/auth/login"); // Send them back to login
    } catch (error) {
      setIsLoading(false);
      toast.error(getErrorMessage(error, "Unable to reset password."));
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-12 sm:py-20 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-[24px] shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Back Button */}
        <button
          onClick={() =>
            step > 1 ? setStep(step - 1) : navigate("/auth/login")
          }
          className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>

        {/* =======================================
            STEP 1: EMAIL REQUEST
        ======================================= */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              No worries, we'll send you reset instructions. Please enter the
              email address associated with your account.
            </p>

            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </div>
        )}

        {/* =======================================
            STEP 2: OTP VERIFICATION
        ======================================= */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We sent a 6-digit verification code to{" "}
              <span className="font-semibold text-foreground">{email}</span>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className="w-12 h-14 text-center text-xl font-bold border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="-"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Didn't receive the email?{" "}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="text-primary font-medium cursor-pointer hover:underline disabled:opacity-50"
              >
                Click to resend
              </button>
            </p>
          </div>
        )}

        {/* =======================================
            STEP 3: SET NEW PASSWORD
        ======================================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Your new password must be different from previously used
              passwords.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
