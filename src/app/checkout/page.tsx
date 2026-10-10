"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, CreditCard, ShieldCheck, CheckCircle2, Loader2, ArrowLeft, Package, Edit2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const shipping = subtotal > 0 ? 150.0 : 0;
  const total = subtotal + shipping;

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=checkout");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
        <p className="text-slate-500 mb-8">You need items in your cart to checkout.</p>
        <Link href="/products">
          <Button className="bg-blue-600 hover:bg-blue-700">Go to Products</Button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setError(null);
    setIsPlacingOrder(true);

    // Validate if address is missing
    if (!profile?.street || !profile?.city) {
      setError("Please update your shipping address in your profile before placing an order.");
      setIsPlacingOrder(false);
      return;
    }

    try {
      // 1. Create the order
      const fullAddress = [
        profile?.street,
        profile?.apartment,
        profile?.city,
        `${profile?.state} ${profile?.zip}`,
        profile?.country
      ].filter(Boolean).join(", ");

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          total_amount: total,
          shipping_address: fullAddress,
          payment_method: paymentMethod,
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        product_brand: item.product.brand,
        quantity: item.quantity,
        price_at_purchase: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Success
      clearCart();
      setOrderSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-lg shadow-lg border-slate-200">
          <CardContent className="py-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
              <p className="text-slate-500">
                Thank you for shopping at Computer Garage. We will notify you when your order ships.
              </p>
            </div>
            <Link href="/products" className="block pt-4">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasIncompleteAddress = !profile?.street || !profile?.city;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Link href="/cart" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Secure Checkout</h1>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Error placing order</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          
          {/* 1. SHIPPING DETAILS */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Shipping Address
              </CardTitle>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Edit2 className="w-4 h-4 mr-2" /> Change
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {hasIncompleteAddress ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">Your shipping address is incomplete. Please update your profile before placing an order.</p>
                </div>
              ) : (
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-lg">{profile?.first_name} {profile?.last_name}</p>
                    <p className="text-slate-600">
                      {profile?.street}
                      {profile?.apartment ? `, ${profile.apartment}` : ""}
                    </p>
                    <p className="text-slate-600">{profile?.city}, {profile?.state} {profile?.zip}</p>
                    <p className="text-slate-600">{profile?.country}</p>
                    <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      Default Shipping Address
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. PAYMENT METHOD */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div 
                className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === "Cash on Delivery" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => setPaymentMethod("Cash on Delivery")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === "Cash on Delivery" ? "border-blue-600 bg-white" : "border-slate-300"}`} />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                    <span className="text-sm text-slate-500">Pay when your order arrives</span>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === "GCash" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => setPaymentMethod("GCash")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === "GCash" ? "border-blue-600 bg-white" : "border-slate-300"}`} />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">GCash</span>
                    <span className="text-sm text-slate-500">Pay securely via GCash E-Wallet</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. ORDER ITEMS */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Items to Order ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.product.id} className="p-6 flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-sm text-slate-500 mt-1">Brand: {item.product.brand}</p>
                      <p className="text-sm font-medium text-slate-700 mt-2">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0 pl-4">
                      <p className="font-bold text-slate-900">
                        ₱{(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-slate-400 mt-1">
                          ₱{item.product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR: TOTALS */}
        <div className="w-full lg:w-[400px] shrink-0">
          <Card className="border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl pb-6">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-slate-900">₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-slate-900">₱{shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold text-slate-900">
                <span>Total</span>
                <span className="text-blue-600">₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg shadow-lg shadow-blue-600/20"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || hasIncompleteAddress}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order Now"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 py-3 rounded-lg border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% Secure SSL Checkout</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
