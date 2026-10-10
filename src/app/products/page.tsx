"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "@/components/shared/SearchBar";
import { Filters } from "@/components/product/Filters";
import { ProductCard } from "@/components/product/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch real products from database
  useState(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev => prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]);
  };

  const toggleAvailability = (avail: string) => {
    setSelectedAvailability(prev => prev.includes(avail) ? prev.filter(a => a !== avail) : [...prev, avail]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      
      if (selectedAvailability.length > 0 && !selectedAvailability.includes(p.availability)) return false;
      
      if (selectedPriceRanges.length > 0) {
        const matchesPrice = selectedPriceRanges.some(range => {
          if (range === "Under ₱5,000") return p.price < 5000;
          if (range === "₱5,000 - ₱15,000") return p.price >= 5000 && p.price <= 15000;
          if (range === "₱15,000 - ₱30,000") return p.price > 15000 && p.price <= 30000;
          if (range === "₱30,000 - ₱60,000") return p.price > 30000 && p.price <= 60000;
          if (range === "Over ₱60,000") return p.price > 60000;
          return false;
        });
        if (!matchesPrice) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategories, selectedBrands, selectedAvailability, selectedPriceRanges]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
          <p className="text-slate-500 mt-1">Showing {filteredProducts.length} products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 items-center">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Button variant="outline" className="w-full sm:w-auto min-w-[140px] justify-between bg-white">
            Sort By
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <Filters 
            selectedCategories={selectedCategories}
            onCategoryChange={toggleCategory}
            selectedBrands={selectedBrands}
            onBrandChange={toggleBrand}
            selectedPriceRanges={selectedPriceRanges}
            onPriceRangeChange={togglePriceRange}
            selectedAvailability={selectedAvailability}
            onAvailabilityChange={toggleAvailability}
          />
        </div>

        {/* Main Content Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No products found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
