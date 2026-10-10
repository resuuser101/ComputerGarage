import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

    if (!resendApiKey && !hasGmail) {
      console.error("Missing email credentials. Set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD in .env.local.");
      return NextResponse.json({ error: "Server email configuration is missing. Please set RESEND_API_KEY in .env.local." }, { status: 500 });
    }

    const subject = "Your Admin Login 2FA Code";
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b;">Admin Authentication</h2>
        <p style="color: #475569; font-size: 16px;">Here is your secure 2FA code to complete your login. This code will expire soon.</p>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; border-radius: 6px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not attempt to log in to the Computer Garage admin panel, please ignore this email and secure your account.</p>
      </div>
    `;

    // 1. Try Resend if configured
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const fromAddress = process.env.RESEND_FROM_EMAIL || "Computer Garage <onboarding@resend.dev>";
        
        const { data, error } = await resend.emails.send({
          from: fromAddress,
          to: email,
          subject,
          html,
        });

        if (error) {
          console.error("Resend error:", error);
          if (!hasGmail) {
            return NextResponse.json({ error: error.message || "Failed to send email via Resend" }, { status: 500 });
          }
        } else {
          return NextResponse.json({ success: true, messageId: data?.id });
        }
      } catch (resendErr: any) {
        console.error("Resend exception:", resendErr);
        if (!hasGmail) {
          return NextResponse.json({ error: resendErr.message || "Failed to send email via Resend" }, { status: 500 });
        }
      }
    }

    // 2. Fallback to Nodemailer if Gmail credentials are provided
    if (hasGmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"Computer Garage Security" <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        html,
      });

      return NextResponse.json({ success: true, messageId: info.messageId });
    }

    return NextResponse.json({ error: "Failed to send email with configured providers" }, { status: 500 });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
