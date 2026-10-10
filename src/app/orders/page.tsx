"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, ChevronRight, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "to_pay", label: "To Pay" },
    { id: "pending", label: "Processing" },
    { id: "packed", label: "Packed" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id, quantity, price_at_purchase, product_name, product_image, product_brand
        )
      `)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  // Derived state
  const filteredOrders = orders.filter(order => {
    // Tab filtering
    if (activeTab === "to_pay" && order.status !== "to_pay") return false;
    if (activeTab === "pending" && order.status !== "pending") return false;
    if (activeTab === "packed" && order.status !== "packed") return false;
    if (activeTab === "shipped" && order.status !== "shipped") return false;
    if (activeTab === "delivered" && order.status !== "delivered") return false;
    if (activeTab === "cancelled" && order.status !== "cancelled") return false;

    // Search filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchProduct = order.order_items.some((item: any) => 
        item.product_name && item.product_name.toLowerCase().includes(q)
      );
      if (!matchId && !matchProduct) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "packed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "shipped": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "to_pay": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "pending": return "Processing";
      case "to_pay": return "To Pay";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-slate-400 mt-2">Track and manage your purchases</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-0">
            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id 
                      ? "border-blue-600 text-blue-600 bg-blue-50/50" 
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by Order ID or Product Name" 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium text-slate-500 shrink-0">Sort by:</span>
                <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Sort orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="border-slate-200 shadow-sm border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                  <Package className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">No orders found</h2>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                  {searchQuery || activeTab !== "all" 
                    ? "We couldn't find any orders matching your current filters." 
                    : "Looks like you haven't placed any orders yet."}
                </p>
                {searchQuery || activeTab !== "all" ? (
                  <Button variant="outline" onClick={() => { setActiveTab("all"); setSearchQuery(""); }}>
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                      Continue Shopping
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const firstItem = order.order_items[0];
              const remainingItems = order.order_items.length - 1;
              const date = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

              return (
                <Card key={order.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Card Header */}
                  <div className="bg-slate-50/50 border-b border-slate-100 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
                        <p className="font-semibold text-slate-900 font-mono text-sm">CG-{order.id.split('-')[0].toUpperCase()}</p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-slate-200" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-medium text-slate-900 text-sm">{date}</p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-slate-200" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="font-bold text-blue-600 text-sm">₱{order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:px-6 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="flex-1 flex items-center gap-4">
                      {firstItem && (
                        <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 p-2 shrink-0 relative">
                          <img src={firstItem.product_image} alt={firstItem.product_name} className="w-full h-full object-contain" />
                          {remainingItems > 0 && (
                            <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                              +{remainingItems}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {firstItem && (
                          <>
                            <h3 className="font-semibold text-slate-900 text-lg truncate">{firstItem.product_name || "Unknown Product"}</h3>
                            <p className="text-slate-500 text-sm mt-1">{firstItem.product_brand}</p>
                            <p className="text-slate-600 text-sm mt-1 font-medium">Qty: {firstItem.quantity}</p>
                          </>
                        )}
                        {remainingItems > 0 && (
                          <p className="text-sm text-slate-400 mt-2 font-medium">
                            and {remainingItems} other item{remainingItems !== 1 ? 's' : ''} in this order
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      {order.status === 'pending' && (
                        <Button variant="outline" className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                          Cancel Order
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button variant="outline" className="w-full sm:w-auto border-slate-200">
                          Leave Review
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button variant="default" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                          Track Order
                        </Button>
                      )}
                      <Link href={`/orders/${order.id}`} className="w-full sm:w-auto block">
                        <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white group-hover:bg-blue-600 transition-colors">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
