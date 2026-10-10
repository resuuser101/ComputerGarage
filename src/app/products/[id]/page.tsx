"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Shield, Truck, RotateCcw, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import { products as mockProducts } from "@/lib/mock-data";
import { useCart } from "@/contexts/CartContext";
import { use, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const supabase = createClient();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      
      if (data) {
        setProduct(data);
        
        // Fetch related products
        const { data: related } = await supabase
          .from("products")
          .select("*")
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(4);
          
        if (related && related.length > 0) {
          setRelatedProducts(related);
        } else {
          // Fallback to random products
          const { data: random } = await supabase
            .from("products")
            .select("*")
            .neq("id", data.id)
            .limit(4);
          setRelatedProducts(random || []);
        }
      }
      setLoading(false);
    };
    
    fetchProduct();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products"><Button>Browse all products</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">Products</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-blue-600">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${i === 1 ? 'border-blue-600' : 'border-transparent hover:border-slate-300'}`}>
                <img
                  src={product.image}
                  alt={`${product.name} view ${i}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <Link href={`/products?brand=${product.brand}`} className="text-blue-600 font-medium hover:underline">
              {product.brand}
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current opacity-50" />
              <span className="text-sm font-medium text-slate-700 ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer">({product.reviews} reviews)</span>
          </div>

          <div className="text-4xl font-extrabold text-slate-900 mb-6">
            ₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="space-y-3 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-24">Availability:</span>
              {product.availability === "In Stock" ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                  <Check className="h-3 w-3 mr-1" /> In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-slate-700">
                  {product.availability}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-24">SKU:</span>
              <span className="font-mono text-slate-900">{product.sku}</span>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              size="lg" 
              className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-md"
              disabled={product.availability === "Out of Stock"}
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Link href="/login" className="flex-1">
              <Button size="lg" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                Buy Now
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border rounded-xl p-4 bg-slate-50">
            <div className="flex flex-col items-center text-center gap-2">
              <Shield className="h-6 w-6 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">1 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw className="h-6 w-6 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8">
            <TabsTrigger 
              value="description" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3 text-base"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="specifications" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3 text-base"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3 text-base"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="pt-4 max-w-3xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Product Overview</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {product.description}
            </p>
          </TabsContent>
          
          <TabsContent value="specifications" className="pt-4 max-w-3xl">
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <th className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap border-r border-slate-100 w-1/3">
                        {key}
                      </th>
                      <td className="px-6 py-4 text-slate-600">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4 max-w-3xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="flex flex-col items-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-4xl font-bold text-slate-900">{product.rating}</span>
                <div className="flex items-center gap-1 text-amber-500 my-2">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current opacity-50" />
                </div>
                <span className="text-sm text-slate-500">Based on {product.reviews} reviews</span>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-3">{rating}</span>
                    <Star className="h-3 w-3 text-amber-500 fill-current" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mock Reviews List would go here */}
            <p className="text-slate-500 italic">Review content is currently unavailable.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
