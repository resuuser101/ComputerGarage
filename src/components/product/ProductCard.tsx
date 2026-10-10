"use client";

import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@/lib/mock-data";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.availability === "Out of Stock" && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" className="text-sm font-semibold">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {product.brand}
          </p>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-medium text-slate-700">{product.rating}</span>
          </div>
        </div>
        
        <Link href={`/products/${product.id}`} className="block group-hover:text-blue-600 transition-colors">
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
          {product.shortSpec}
        </p>
        
        <div className="mt-auto">
          <p className="text-xl font-bold text-slate-900">
            ₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={product.availability === "Out of Stock"}
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        <Link href={`/products/${product.id}`}>
          <Button variant="outline" className="px-3 border-slate-200 hover:bg-slate-50 text-slate-700">
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
