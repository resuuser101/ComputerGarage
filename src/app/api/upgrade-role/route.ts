import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the SERVICE ROLE KEY (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { userId, inviteCode } = await request.json();

    if (!userId || !inviteCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Hardcoded secret invite code (or from env variable if available)
    const SECRET_CODE = process.env.SELLER_INVITE_CODE || "CYBERSEC-PROJECT";

    if (inviteCode !== SECRET_CODE) {
      // Intentionally brief to prevent code guessing
      return NextResponse.json({ error: "Invalid Invite Code" }, { status: 403 });
    }

    // Upgrade the user's role in the profiles table to 'admin'
    // Also enforce 2FA so they immediately have to use it.
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin", requires_2fa: true })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to upgrade role:", updateError);
      return NextResponse.json({ error: "Failed to upgrade account: " + JSON.stringify(updateError) }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
