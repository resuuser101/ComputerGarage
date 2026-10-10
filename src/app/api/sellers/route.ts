import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // We use the Service Role Key to bypass the Row Level Security (RLS) firewall.
    // This allows the server to fetch all admin profiles without getting blocked.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch auth users to check verification status
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }

    // Create a Set of user IDs that have verified their email
    const verifiedUserIds = new Set(
      authData.users
        .filter(user => user.email_confirmed_at != null)
        .map(user => user.id)
    );

    // Filter profiles and merge the last_sign_in_at data
    const verifiedSellers = profiles
      .filter(profile => verifiedUserIds.has(profile.id))
      .map(profile => {
        const authUser = authData.users.find(u => u.id === profile.id);
        return {
          ...profile,
          last_sign_in_at: authUser?.last_sign_in_at || null
        };
      });

    return NextResponse.json({ sellers: verifiedSellers });
  } catch (error: any) {
    console.error("Failed to fetch sellers:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch sellers" }, { status: 500 });
  }
}
