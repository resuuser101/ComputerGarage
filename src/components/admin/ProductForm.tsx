"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Product {
  id?: string;
  name?: string;
  brand?: string;
  price?: number;
  category?: string;
  image?: string;
  availability?: string;
  sku?: string;
  shortSpec?: string;
  description?: string;
  specifications?: Record<string, string>;
}

interface ProductFormProps {
  initialData?: Product | null;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [availability, setAvailability] = useState(initialData?.availability || "In Stock");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [shortSpec, setShortSpec] = useState(initialData?.shortSpec || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Specifications dynamic list
  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>(() => {
    if (initialData?.specifications && Object.keys(initialData.specifications).length > 0) {
      return Object.entries(initialData.specifications).map(([key, value]) => ({
        key, 
        value: String(value)
      }));
    }
    return [{ key: "", value: "" }];
  });

  const addSpecRow = () => {
    setSpecsList([...specsList, { key: "", value: "" }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  const updateSpecRow = (index: number, field: "key" | "value", newValue: string) => {
    const newList = [...specsList];
    newList[index][field] = newValue;
    setSpecsList(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const parsedSpecs: Record<string, string> = {};
    specsList.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        parsedSpecs[spec.key.trim()] = spec.value.trim();
      }
    });

    const productData = {
      name,
      brand,
      price: parseFloat(price),
      category,
      image,
      availability,
      sku,
      shortSpec,
      description,
      specifications: parsedSpecs,
      // If new, set default rating/reviews
      ...(!isEdit && { rating: 5.0, reviews: 0 })
    };

    let error;

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", initialData?.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert([productData]);
      error = insertError;
    }

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      <Link href="/admin/products">
        <Button variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? `Editing ${initialData?.name}` : "Create a new product in your catalog"}
          </p>
        </div>
        
        <Button onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-md">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Information</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Product Name *</label>
              <Input placeholder="e.g. Intel Core i9-14900K" required value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Brand *</label>
                <Input placeholder="e.g. Intel" required value={brand} onChange={e => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <Select value={category} onValueChange={(val) => setCategory(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Processors">Processors</SelectItem>
                    <SelectItem value="Graphics Cards">Graphics Cards</SelectItem>
                    <SelectItem value="Motherboards">Motherboards</SelectItem>
                    <SelectItem value="RAM">RAM</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="Power Supplies">Power Supplies</SelectItem>
                    <SelectItem value="Monitors">Monitors</SelectItem>
                    <SelectItem value="Peripherals">Peripherals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price (₱) *</label>
                <Input type="number" min="0" step="0.01" placeholder="0.00" required value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">SKU / Model Number</label>
                <Input placeholder="e.g. INT-I9-14900K" value={sku} onChange={e => setSku(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Short Specification Summary</label>
              <Input placeholder="e.g. 24 Cores / 32 Threads, up to 6.0 GHz" value={shortSpec} onChange={e => setShortSpec(e.target.value)} />
              <p className="text-xs text-slate-500">A quick 1-line summary that appears on the product card.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Description</label>
              <Textarea placeholder="Detailed product description..." rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">Technical Specifications</h2>
              <Button type="button" variant="outline" size="sm" onClick={addSpecRow} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-1" /> Add Spec
              </Button>
            </div>
            
            <div className="space-y-3">
              {specsList.length === 0 && (
                <p className="text-sm text-slate-500 italic">No specifications added yet. Click &quot;Add Spec&quot; to add one.</p>
              )}
              {specsList.map((spec, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1">
                    <Input 
                      placeholder="e.g. Screen Size" 
                      value={spec.key} 
                      onChange={(e) => updateSpecRow(index, "key", e.target.value)} 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input 
                      placeholder="e.g. 27 inches" 
                      value={spec.value} 
                      onChange={(e) => updateSpecRow(index, "value", e.target.value)} 
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                    onClick={() => removeSpecRow(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Image & Status */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" /> Product Image
            </h2>
            <div className="space-y-4">
              <div className="w-full aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-sm font-medium">No Image Provided</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Image URL *</label>
                <Input placeholder="https://..." required value={image} onChange={e => setImage(e.target.value)} />
                <p className="text-xs text-slate-500">Paste a direct link to an image (e.g. from Unsplash or an image host).</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Inventory Status</h2>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Availability *</label>
              <Select value={availability} onValueChange={(val) => setAvailability(val || "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">
                    <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> In Stock</span>
                  </SelectItem>
                  <SelectItem value="Out of Stock">
                    <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> Out of Stock</span>
                  </SelectItem>
                  <SelectItem value="Pre-order">
                    <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div> Pre-order</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
