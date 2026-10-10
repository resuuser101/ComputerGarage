"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, UserCircle, LogOut, Package, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { totalItems } = useCart();
  const { user, profile, signOut, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              CG
            </div>
            <span className="hidden md:inline-block font-bold text-xl tracking-tight text-slate-900">
              Computer Garage
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Products
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-blue-600">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-md"></div>
                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-md"></div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 px-4 py-2 rounded-md outline-none transition-colors">
                  <UserCircle className="h-5 w-5" />
                  <span className="font-medium">{profile?.first_name || "Profile"}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  {profile?.role !== "admin" && (
                    <Link href="/orders">
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {profile?.role === "admin" && (
                    <>
                      <Link href="/admin/orders">
                        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Manage Orders</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/admin/products">
                        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Manage Products</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/admin/sellers">
                        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Users className="mr-2 h-4 w-4" />
                          <span>Manage Sellers</span>
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-blue-600">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">Register</Button>
                </Link>
              </>
            )}
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
