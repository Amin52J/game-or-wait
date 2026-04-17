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

function buildConfirmUrl(tokenHash: string, origin: string, redirectTo?: string): string {
  const base = (origin || "https://gameorwait.com").replace(/\/+$/, "");
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type: "recovery",
  });
  if (redirectTo) params.set("redirect_to", redirectTo);
  return `${base}/confirm.html?${params}`;
}

function emailHtml(name: string, resetUrl: string): string {
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
          We received a request to reset your password. Click below to choose a new one.
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${resetUrl}" style="display:inline-block;background:#6c63ff;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600">Reset Password</a>
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
    const { email, redirectTo } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // generateLink with type "recovery" generates a password-reset link
    // without going through Supabase's email rate limiter
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error("generateLink error:", linkError);
      // Don't reveal whether the email exists — always return success
      return new Response(
        JSON.stringify({ message: "If an account exists, a reset link has been sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Extract token_hash from the generated link
    const actionLink = linkData?.properties?.action_link ?? "";
    const url = new URL(actionLink);
    const tokenHash =
      url.searchParams.get("token_hash") || linkData?.properties?.hashed_token || "";

    if (!tokenHash) {
      console.error("No token_hash in generateLink response", linkData);
      return new Response(JSON.stringify({ error: "Failed to generate reset token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user display name for the email
    const name =
      (linkData?.user?.user_metadata?.full_name as string) ??
      (linkData?.user?.user_metadata?.name as string) ??
      "";

    const origin = req.headers.get("origin") || "";
    const resetUrl = buildConfirmUrl(tokenHash, origin, redirectTo);

    // Send recovery email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Reset your GameOrWait password",
        html: emailHtml(name, resetUrl),
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send reset email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "If an account exists, a reset link has been sent." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("custom-recovery error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
