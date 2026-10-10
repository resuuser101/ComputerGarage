import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("user_otps")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Invalid 2FA code" }, { status: 400 });
    }

    // Code is valid! Delete it so it can't be reused
    await supabaseAdmin
      .from("user_otps")
      .delete()
      .eq("id", data.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("2FA Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
