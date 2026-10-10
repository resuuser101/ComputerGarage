"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error || !data) {
        router.push("/admin/products");
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    
    fetchProduct();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) return null;

  return <ProductForm initialData={product} isEdit={true} />;
}
