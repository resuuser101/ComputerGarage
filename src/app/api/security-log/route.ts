import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { eventType, email } = await request.json();
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Use the Service Role Key to bypass RLS and securely log the event
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Grab the user's IP address from the request headers
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    const { error } = await supabaseAdmin.from('security_logs').insert([
      { event_type: eventType, email, ip_address: ip }
    ]);

    if (error) {
      console.error("Failed to insert security log:", error);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Security logging error:", err);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
