// @ts-nocheck — Deno Edge Function; not checked by project tsconfig
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MIXPANEL_TOKEN = Deno.env.get("MIXPANEL_TOKEN");
const MIXPANEL_API_HOST = Deno.env.get("MIXPANEL_API_HOST") ?? "https://api.mixpanel.com";

const ALLOWED = new Set(["signup", "starter_analysis"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sendMixpanel(
  event: string,
  distinctId: string,
  properties: Record<string, unknown>,
  insertId?: string,
): Promise<void> {
  if (!MIXPANEL_TOKEN) return;

  const payload = [
    {
      event,
      properties: {
        token: MIXPANEL_TOKEN,
        distinct_id: distinctId,
        time: Math.floor(Date.now() / 1000),
        ...(insertId ? { $insert_id: insertId } : {}),
        ...properties,
      },
    },
  ];

  const res = await fetch(`${MIXPANEL_API_HOST}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: JSON.stringify(payload) }),
  });

  if (!res.ok) {
    console.error("Mixpanel:", res.status, await res.text());
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify the user via the Authorization header
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(accessToken);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const event = body.event;
    if (!event || !ALLOWED.has(event)) {
      return new Response(JSON.stringify({ error: "Invalid event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!MIXPANEL_TOKEN) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const props = {
      ...body.properties,
      ...(user.email ? { $email: user.email } : {}),
    };

    const insertId = body.insert_id ?? (event === "signup" ? `${user.id}-signup` : undefined);

    await sendMixpanel(event, user.id, props, insertId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("track-event error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
