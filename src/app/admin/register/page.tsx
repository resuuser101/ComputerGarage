"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Key, User, AlertCircle, Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function AdminRegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!captchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign up the user (initially as a customer via database trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "customer",
            first_name: firstName,
            last_name: lastName,
            phone: "",
            street: "",
            apartment: "",
            city: "",
            state: "",
            zip: "",
            country: "",
          },
          captchaToken,
        }
      });

      if (authError) {
        if (authError.message === "{}" || authError.message.includes("{}")) {
          throw new Error("Database error saving new user. Please try a different email or contact support.");
        }
        if (authError.message.includes("already registered")) {
          throw new Error("Invalid registration details or email already in use.");
        }
        throw new Error(authError.message);
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("Failed to create account. Please try again.");
      }

      // 2. Call our secure backend API to upgrade their role using the invite code
      const upgradeRes = await fetch("/api/upgrade-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, inviteCode }),
      });

      if (!upgradeRes.ok) {
        const upgradeData = await upgradeRes.json();
        // If the invite code is wrong, they are just a customer now.
        // We log them out so they don't stay signed in as a customer in the admin portal.
        await supabase.auth.signOut();
        throw new Error(upgradeData.error || "Failed to verify invite code.");
      }

      // 3. Success! They are now an admin. 
      // Log them out and force them to log in via the 2FA portal.
      await supabase.auth.signOut();
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white text-slate-900">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl shadow-md ring-4 ring-indigo-50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Authorized Seller Registration</CardTitle>
          <CardDescription className="text-slate-500">
            Create your admin account. An invite code is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Successful!</h3>
              <p className="text-slate-600 mb-4">Your account has been securely upgraded to Seller status.</p>
              <p className="text-sm text-indigo-600 animate-pulse">Redirecting to login portal...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="break-words w-full">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="firstName">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      className="pl-10 bg-white border-slate-200 text-slate-900 shadow-sm" 
                      required 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="lastName">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      className="pl-10 bg-white border-slate-200 text-slate-900 shadow-sm" 
                      required 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seller@computergarage.com" 
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm" 
                      required 
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm" 
                      required 
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-900" htmlFor="inviteCode">Secret Invite Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                  <Input 
                    id="inviteCode" 
                    type="text" 
                    placeholder="Enter the passcode" 
                    className="pl-10 bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-sm font-mono tracking-wide focus-visible:ring-indigo-600" 
                    required 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-slate-500">Required to authorize administrative privileges.</p>
              </div>

              <div className="flex justify-center pt-2">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setCaptchaToken(token)}
                  theme="light"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !captchaToken} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 shadow-md transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authorizing Account...
                  </>
                ) : (
                  "Create Seller Account"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
