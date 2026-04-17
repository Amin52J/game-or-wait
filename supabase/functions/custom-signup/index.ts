// @ts-nocheck — Deno Edge Function; not checked by project tsconfig
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "GameOrWait <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function buildConfirmUrl(tokenHash: string, siteUrl: string, redirectTo?: string): string {
  const base = (siteUrl || "").replace(/\/+$/, "");
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type: "signup",
  });
  if (redirectTo) params.set("redirect_to", redirectTo);
  return `${base}/confirm.html?${params}`;
}

function emailHtml(name: string, confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:12px;padding:40px;border:1px solid #2a2a4a">
        <tr><td align="center" style="padding-bottom:24px">
          <h1 style="color:#e0e0e0;font-size:22px;margin:0">GameOrWait</h1>
        </td></tr>
        <tr><td style="color:#cccccc;font-size:15px;line-height:1.6;padding-bottom:24px">
          Hi${name ? ` ${name}` : ""},<br/><br/>
          Thanks for signing up! Please confirm your email address to get started.
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${confirmUrl}" style="display:inline-block;background:#6c63ff;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600">Confirm Email</a>
        </td></tr>
        <tr><td style="color:#888888;font-size:12px;line-height:1.5">
          If you didn't request this, you can safely ignore this email.<br/>
          This link expires in 24 hours.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: "An account with this email already exists. Try signing in instead.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const displayName = name || email.split("@")[0];

    // generateLink creates the user AND returns a verification link
    // without going through Supabase's email rate limiter
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { full_name: displayName, has_password: true },
      },
    });

    if (linkError) {
      console.error("generateLink error:", linkError);
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract token_hash from the generated link
    const actionLink = linkData?.properties?.action_link ?? "";
    const url = new URL(actionLink);
    const tokenHash =
      url.searchParams.get("token_hash") || linkData?.properties?.hashed_token || "";

    if (!tokenHash) {
      console.error("No token_hash in generateLink response", linkData);
      return new Response(JSON.stringify({ error: "Failed to generate verification token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine the site URL for the confirm link
    const origin = req.headers.get("origin") || "";
    const siteUrl = origin || SUPABASE_URL.replace(/\.supabase\.co.*/, ".supabase.co");
    const confirmUrl = buildConfirmUrl(tokenHash, origin || "https://gameorwait.com");

    // Send verification email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Confirm your GameOrWait account",
        html: emailHtml(displayName, confirmUrl),
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send verification email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Signup successful. Please check your email to confirm your account.",
        user_id: linkData?.user?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("custom-signup error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
