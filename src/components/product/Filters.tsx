"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const categories = [
  "Processors",
  "Graphics Cards",
  "Motherboards",
  "RAM",
  "Storage",
  "Power Supplies",
  "Monitors",
  "Peripherals"
];

const brands = ["Intel", "AMD", "NVIDIA", "ASUS", "Corsair", "Samsung", "LG"];

const priceRanges = [
  "Under ₱5,000",
  "₱5,000 - ₱15,000",
  "₱15,000 - ₱30,000",
  "₱30,000 - ₱60,000",
  "Over ₱60,000"
];

const availability = ["In Stock", "Out of Stock", "Pre-order"];

interface FiltersProps {
  selectedCategories?: string[];
  onCategoryChange?: (cat: string) => void;
  selectedBrands?: string[];
  onBrandChange?: (brand: string) => void;
  selectedPriceRanges?: string[];
  onPriceRangeChange?: (range: string) => void;
  selectedAvailability?: string[];
  onAvailabilityChange?: (avail: string) => void;
}

export function Filters({ 
  selectedCategories = [], 
  onCategoryChange, 
  selectedBrands = [], 
  onBrandChange,
  selectedPriceRanges = [],
  onPriceRangeChange,
  selectedAvailability = [],
  onAvailabilityChange
}: FiltersProps = {}) {
  return (
    <div className="w-full space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Category</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${category}`} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryChange?.(category)}
              />
              <label
                htmlFor={`cat-${category}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />

      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Brand</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox 
                id={`brand-${brand}`} 
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => onBrandChange?.(brand)}
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Price Range</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <div key={range} className="flex items-center space-x-2">
              <Checkbox 
                id={`price-${range}`} 
                checked={selectedPriceRanges.includes(range)}
                onCheckedChange={() => onPriceRangeChange?.(range)}
              />
              <label
                htmlFor={`price-${range}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer"
              >
                {range}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Availability</h3>
        <div className="space-y-3">
          {availability.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox 
                id={`avail-${status}`} 
                checked={selectedAvailability.includes(status)}
                onCheckedChange={() => onAvailabilityChange?.(status)}
              />
              <label
                htmlFor={`avail-${status}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer"
              >
                {status}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
