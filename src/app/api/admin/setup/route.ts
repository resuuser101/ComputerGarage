import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if any admin already exists
    const { count, error } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const isSetupLocked = (count || 0) > 0;
    return NextResponse.json({ isSetupLocked, adminCount: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to check setup status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check if an admin already exists - if so, lock setup completely
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count || 0) > 0) {
      return NextResponse.json({
        error: "Forbidden: Master admin setup is locked. Additional admins must register at /admin/register with an authorized invite code."
      }, { status: 403 });
    }

    const { email, password, firstName, lastName, phone, setupKey } = await request.json();

    // 2. Validate setup key if configured
    const requiredSetupKey = process.env.ADMIN_SETUP_SECRET;
    if (requiredSetupKey && setupKey !== requiredSetupKey) {
      return NextResponse.json({ error: "Invalid Setup Secret Key" }, { status: 403 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 3. Create the initial master admin
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        first_name: firstName || "Admin",
        last_name: lastName || "User",
        phone: phone || "",
      }
    });

    if (createError || !authUser.user) {
      return NextResponse.json({ error: createError?.message || "Failed to create master admin" }, { status: 500 });
    }

    // 4. Update profile role to admin
    await supabaseAdmin
      .from("profiles")
      .update({ role: "admin", requires_2fa: true })
      .eq("id", authUser.user.id);

    return NextResponse.json({ success: true, userId: authUser.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
