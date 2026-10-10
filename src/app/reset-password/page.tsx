"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    // Supabase will automatically parse the hash in the URL and set the session 
    // when the user clicks the email link. We just need to wait for them to submit.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    };
    checkSession();
  }, []);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Please ensure your new password meets all security criteria");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-blue-600">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create New Password</CardTitle>
          <CardDescription className="text-slate-500">
            Please enter your new strong password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Password Updated!</h3>
              <p className="text-slate-500 mb-6">
                Your password has been successfully reset.
              </p>
              <Button onClick={() => router.push("/login")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Proceed to Login <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    required 
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {password.length > 0 && (
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-1.5 w-full rounded-full transition-colors ${level <= strength ? strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-amber-500" : "bg-emerald-500" : "bg-slate-200"}`} />
                    ))}
                  </div>
                )}
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-700 font-medium mb-2">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`text-xs flex items-center transition-colors ${password.length >= 8 ? "text-emerald-600" : "text-slate-500"}`}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> 8+ characters</div>
                    <div className={`text-xs flex items-center transition-colors ${/[A-Z]/.test(password) ? "text-emerald-600" : "text-slate-500"}`}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Uppercase letter</div>
                    <div className={`text-xs flex items-center transition-colors ${/[0-9]/.test(password) ? "text-emerald-600" : "text-slate-500"}`}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Number</div>
                    <div className={`text-xs flex items-center transition-colors ${/[^A-Za-z0-9]/.test(password) ? "text-emerald-600" : "text-slate-500"}`}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Special character</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    required 
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
