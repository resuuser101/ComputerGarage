"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const shipping = subtotal > 0 ? 150.0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
            <Trash2 className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 max-w-md mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/products">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center">
                    <div className="col-span-1 md:col-span-6 flex gap-4">
                      <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-medium text-blue-600 mb-1">{item.product.brand}</span>
                        <Link href={`/products/${item.product.id}`} className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-2">
                          {item.product.name}
                        </Link>
                        <button 
                          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mt-2 w-fit"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white h-10 w-28">
                        <button 
                          className="flex-1 flex justify-center items-center text-slate-500 hover:text-slate-900 transition-colors"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          className="flex-1 flex justify-center items-center text-slate-500 hover:text-slate-900 transition-colors"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 text-left md:text-right font-medium text-slate-500">
                      <span className="md:hidden text-xs text-slate-400 mr-2">Price:</span>
                      ₱{item.product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="col-span-1 md:col-span-2 text-left md:text-right font-bold text-slate-900">
                       <span className="md:hidden text-xs text-slate-400 mr-2">Total:</span>
                      ₱{(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Estimate</span>
                  <span className="font-medium text-slate-900">₱{shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="text-slate-400 italic">Calculated at checkout</span>
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="flex justify-between text-lg font-bold text-slate-900 mb-8">
                <span>Total</span>
                <span>₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="space-y-3">
                <Link href={user ? "/checkout" : "/login?redirect=checkout"} className="block">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/products" className="block">
                  <Button size="lg" variant="outline" className="w-full text-slate-700">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
