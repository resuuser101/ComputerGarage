"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Allow everyone to access the setup, login, and register pages
      if (pathname === "/admin/setup" || pathname === "/admin/login" || pathname === "/admin/register") return;

      if (!user) {
        router.push("/admin/login?redirect=" + pathname);
      } else if (profile?.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, profile, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prevent flash of content for non-admins (except public setup/login/register pages)
  if (pathname !== "/admin/setup" && pathname !== "/admin/login" && pathname !== "/admin/register" && (!user || profile?.role !== "admin")) {
    return null;
  }

  const isDarkPage = pathname === '/admin/login' || pathname === '/admin/register';

  return (
    <div className={`flex flex-col flex-1 w-full ${isDarkPage ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {children}
    </div>
  );
}
