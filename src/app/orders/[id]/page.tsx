"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Package, Truck, CheckCircle2, ShoppingBag, CreditCard, MapPin, Receipt, Phone, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id, quantity, price_at_purchase, product_id, product_name, product_image, product_brand
        )
      `)
      .eq("id", id)
      .eq("user_id", user?.id)
      .single();

    if (!error && data) {
      setOrder(data);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Order not found</h1>
        <p className="text-slate-500 mb-8">This order does not exist or you do not have permission to view it.</p>
        <Link href="/orders">
          <Button className="bg-blue-600 hover:bg-blue-700">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const date = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const subtotal = order.order_items.reduce((sum: number, item: any) => sum + (item.price_at_purchase * item.quantity), 0);
  const shippingFee = order.total_amount - subtotal; // Deriving shipping since it's the difference
  const orderIdShort = `CG-${order.id.split('-')[0].toUpperCase()}`;

  // Timeline Logic
  const statuses = ["pending", "packed", "shipped", "delivered"];
  const currentStatusIndex = statuses.indexOf(order.status);
  
  const getTimelineSteps = () => [
    { label: "Order Placed", icon: ShoppingBag, completed: currentStatusIndex >= 0 },
    { label: "Packed", icon: Package, completed: currentStatusIndex >= 1 },
    { label: "Shipped", icon: Truck, completed: currentStatusIndex >= 2 },
    { label: "Delivered", icon: CheckCircle2, completed: currentStatusIndex >= 3 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/orders" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-mono">{orderIdShort}</h1>
              <p className="text-slate-400 mt-2">Placed on {date}</p>
            </div>
            <div className="flex items-center gap-3">
              {order.status === 'pending' && (
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  Cancel Order
                </Button>
              )}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Receipt className="w-4 h-4 mr-2" /> Download Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Left Column */}
          <div className="flex-1 space-y-8">
            
            {/* Timeline Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-slate-100 rounded-full" />
                  <div 
                    className="absolute top-6 left-6 h-1 bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(0, (currentStatusIndex / (statuses.length - 1)) * 100)}%` }} 
                  />
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {getTimelineSteps().map((step, index) => {
                      const Icon = step.icon;
                      const isCurrent = currentStatusIndex === index;
                      return (
                        <div key={step.label} className="flex flex-col items-center w-24">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors border-4 border-white shadow-sm
                            ${step.completed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}
                            ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                          `}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`text-sm font-medium mt-3 text-center ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Ordered Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="p-6 flex gap-6 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="w-24 h-24 bg-white rounded-lg border border-slate-200 p-2 shrink-0">
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product_id}`} className="hover:underline">
                          <h3 className="font-semibold text-slate-900 text-lg truncate">{item.product_name || "Unknown Product"}</h3>
                        </Link>
                        <p className="text-slate-500 text-sm mt-1">{item.product_brand}</p>
                        <p className="text-slate-700 text-sm mt-3 font-medium bg-slate-100 inline-block px-2 py-1 rounded">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0 pl-4">
                        <p className="font-bold text-slate-900 text-lg">
                          ₱{(item.price_at_purchase * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-slate-400 mt-1">
                            ₱{item.price_at_purchase.toLocaleString('en-US', { minimumFractionDigits: 2 })} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Columns */}
          <div className="w-full lg:w-[400px] space-y-6">
            
            {/* Tracking Info (if shipped or delivered) */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <Card className="border-blue-200 shadow-sm bg-blue-50/50 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-blue-900">
                    <Truck className="w-5 h-5 mr-2 text-blue-600" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Courier</p>
                    <p className="font-bold text-slate-900">{order.courier || 'J&T Express'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tracking Number</p>
                    <div className="flex items-center justify-between bg-white border border-blue-200 rounded-lg p-3">
                      <p className="font-mono font-bold text-blue-700">{order.tracking_number || 'JT-123456789'}</p>
                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50">Track</Button>
                    </div>
                  </div>
                  <div className="bg-blue-100/50 p-3 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      Estimated delivery: <span className="font-bold">Next 2-3 business days</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping & Contact */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Delivery Address</p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({order.order_items.length} items)</span>
                    <span className="font-medium text-slate-900">₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-medium text-slate-900">₱{shippingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">- ₱0.00</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-blue-600">₱{order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="font-bold text-slate-900 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-600" /> 
                    {order.payment_method || "Cash on Delivery"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help / Support */}
            <Button variant="outline" className="w-full bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 h-12">
              <HelpCircle className="w-4 h-4 mr-2" /> Contact Support
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
