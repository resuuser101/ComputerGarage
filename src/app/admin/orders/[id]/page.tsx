"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, MapPin, Truck, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Editable fields
  const [status, setStatus] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles ( first_name, last_name, email, phone ),
        order_items (
          id, quantity, price_at_purchase, product_id, product_name, product_image, product_brand
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setOrder(data);
      setStatus(data.status);
      setCourier(data.courier || "");
      setTrackingNumber(data.tracking_number || "");
    } else {
      toast.error("Order not found");
      router.push("/admin/orders");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({ 
        status, 
        courier: courier || null, 
        tracking_number: trackingNumber || null 
      })
      .eq("id", order.id);

    setIsSaving(false);

    if (error) {
      toast.error("Failed to update order");
    } else {
      toast.success("Order updated successfully!");
      setOrder({ ...order, status, courier, tracking_number: trackingNumber });
    }
  };

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const date = new Date(order.created_at).toLocaleString();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
      <Link href="/admin/orders">
        <Button variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Manage Order
            <span className="text-lg font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-md border border-slate-200">
              CG-{order.id.split('-')[0].toUpperCase()}
            </span>
          </h1>
          <p className="text-slate-500 mt-2">Placed on {date}</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Customer */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status & Tracking Control Panel */}
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-blue-600" /> Update Order Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Order Status</label>
                <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Processing</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Courier Name</label>
                <Input 
                  placeholder="e.g. J&T Express, LBC" 
                  value={courier} 
                  onChange={(e) => setCourier(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tracking Number</label>
                <Input 
                  placeholder="e.g. 1234567890" 
                  value={trackingNumber} 
                  onChange={(e) => setTrackingNumber(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-slate-400" />
                Purchased Items ({order.order_items.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-6 items-center">
                  <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 p-2 shrink-0">
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product_id}`} target="_blank" className="hover:underline flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-base truncate">{item.product_name || "Unknown Product"}</h3>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <p className="text-slate-500 text-xs mt-1">{item.product_brand}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-slate-500 mb-1">Qty: {item.quantity}</p>
                    <p className="font-bold text-slate-900">₱{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Summary */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center pb-4 border-b border-slate-100">
              <MapPin className="w-5 h-5 mr-2 text-slate-400" />
              Customer Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Info</p>
                <p className="font-medium text-slate-900">{order.profiles?.first_name} {order.profiles?.last_name}</p>
                <p className="text-slate-600 mt-1">{order.profiles?.email}</p>
                <p className="text-slate-600 mt-1">{order.profiles?.phone || "No phone provided"}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Shipping Address</p>
                <div className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                  <p>{order.shipping_street}</p>
                  {order.shipping_apartment && <p>{order.shipping_apartment}</p>}
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-bold mb-6 pb-4 border-b border-slate-700">
              Payment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Payment Method</span>
                <span className="font-medium text-white">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>₱{order.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="font-bold text-base">Total Paid</span>
                <span className="text-2xl font-bold text-emerald-400">₱{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
