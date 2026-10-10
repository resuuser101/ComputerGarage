"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setTimeout(() => setCooldownTime((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownTime > 0) return;

    if (!captchaToken) {
      setError("Please complete the reCAPTCHA verification to continue.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      }
    });

    if (authError) {
      setIsLoading(false);
      handleFailedAttempt(authError.message);
      return;
    }

    if (authData.user) {
      // Check if user is an admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile?.role !== "admin") {
        // Log them out immediately if they are not an admin
        await supabase.auth.signOut();
        setIsLoading(false);
        handleFailedAttempt("Unauthorized: Seller access only.");
        return;
      }

      setCurrentUser(authData.user);
      
      // Send 2FA request (server securely generates code, stores in DB, and emails user)
      try {
        const res = await fetch("/api/send-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authData.user.email, userId: authData.user.id }),
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "API error");
        }
        
        setShowOTP(true);
        setFailedAttempts(0); // reset attempts on success
      } catch (err: any) {
        setError(err.message || "Failed to send 2FA email. Please contact support.");
      }
      setIsLoading(false);
    }
  };

  const handleFailedAttempt = (msg: string) => {
    setError(msg);
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    if (newAttempts >= 3) {
      setCooldownTime(30); // 30 seconds cooldown after 3 failed attempts
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, code: otp }),
      });

      const result = await res.json();
      setIsLoading(false);

      if (!res.ok || !result.success) {
        handleFailedAttempt("Invalid 2FA code. Please try again.");
        return;
      }

      // Success! Save verification flag and redirect
      sessionStorage.setItem("2fa_verified", "true");
      window.location.href = "/admin/products";

    } catch (err) {
      setIsLoading(false);
      handleFailedAttempt("Server error validating code.");
      return;
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white text-slate-900">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl shadow-md ring-4 ring-indigo-50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Seller Login</CardTitle>
          <CardDescription className="text-slate-500">
            Sign in to access your seller dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOTP ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seller@computergarage.com" 
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-600 shadow-sm" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || cooldownTime > 0}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-600 shadow-sm" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || cooldownTime > 0}
                  />
                </div>
              </div>
              
              <div className="flex justify-center pt-2 pb-2">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setCaptchaToken(token)}
                  theme="light"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || cooldownTime > 0 || !captchaToken} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6 shadow-md transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : cooldownTime > 0 ? (
                  `Too many attempts. Wait ${cooldownTime}s`
                ) : (
                  "Secure Login"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-indigo-50 text-indigo-900 p-4 rounded-lg text-sm mb-4 border border-indigo-100 flex items-start gap-3">
                <KeyRound className="w-5 h-5 shrink-0 text-indigo-600" />
                <p>We've sent a 6-digit security code to <strong>{email}</strong>. Mandatory 2FA verification required.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="otp">Security Code</label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="000000" 
                  className="text-center tracking-widest text-lg font-mono bg-white border-slate-200 text-slate-900 focus-visible:ring-indigo-600 shadow-sm" 
                  required 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6 shadow-md transition-all active:scale-[0.98]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Identity <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500 flex items-center font-medium">
            <Lock className="w-3 h-3 mr-1" /> End-to-end encrypted connection
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
