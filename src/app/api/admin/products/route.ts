import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Helper to check admin authorization
async function verifyAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: "Authentication required", status: 401 };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { authorized: false, error: "Forbidden: Admin role required", status: 403 };
  }

  return { authorized: true, user, supabaseAdmin };
}

// POST: Secure Product Creation
export async function POST(request: Request) {
  try {
    const authResult = await verifyAdmin();
    if (!authResult.authorized || !authResult.supabaseAdmin) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { name, brand, category, price, stock, image, availability, sku, shortSpec, description, specifications, rating, reviews } = body;

    if (!name || !price || !brand) {
      return NextResponse.json({ error: "Missing required fields (name, price, brand)" }, { status: 400 });
    }

    const productPayload = {
      name,
      brand,
      category,
      price: Number(price),
      stock: Number(stock) || 0,
      image,
      availability,
      sku,
      shortSpec,
      description,
      specifications,
      rating: rating || 5.0,
      reviews: reviews || 0,
    };

    const { data, error } = await authResult.supabaseAdmin
      .from("products")
      .insert([productPayload])
      .select()
      .single();

    if (error) {
      console.error("Failed to insert product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("Admin product creation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
