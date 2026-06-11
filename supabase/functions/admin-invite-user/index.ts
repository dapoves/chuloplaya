// Edge Function: admin-invite-user
//
// Invita por email a un nuevo usuario y le asigna el rol pedido (colaborador
// o admin). El llamante debe estar autenticado y tener rol `admin`.
//
// Body: { email: string, role: "colaborador" | "admin", display_name?: string }
//
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta el runtime.

import { createClient } from "jsr:@supabase/supabase-js@2";

type RequestBody = {
  email: string;
  role: "colaborador" | "admin";
  display_name?: string;
  redirect_to?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  }

  const auth = req.headers.get("authorization");
  if (!auth) {
    return new Response("missing auth", { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? serviceKey;
  if (!supabaseUrl || !serviceKey) {
    return new Response("missing supabase env", { status: 500, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response("invalid jwt", { status: 401, headers: corsHeaders });
  }

  const { data: callerProfile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (callerProfile?.role !== "admin") {
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response("invalid body", { status: 400, headers: corsHeaders });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const role = body.role;
  const displayName = body.display_name?.trim() || null;
  const redirectTo = body.redirect_to;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Email no válido" }, { status: 400, headers: corsHeaders });
  }
  if (role !== "colaborador" && role !== "admin") {
    return Response.json({ error: "Rol no válido" }, { status: 400, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { invited_role: role, display_name: displayName },
    redirectTo,
  });

  if (inviteError || !invited?.user) {
    const msg = inviteError?.message ?? "No se pudo invitar";
    const status = /already.*registered|already exists/i.test(msg) ? 409 : 400;
    return Response.json({ error: msg }, { status, headers: corsHeaders });
  }

  // El trigger handle_new_user crea el profile con role='cliente'. Lo upserteamos al rol deseado.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: invited.user.id,
        role,
        display_name: displayName,
      },
      { onConflict: "id" }
    );

  if (profileError) {
    return Response.json(
      { error: `Invitación enviada pero rol no asignado: ${profileError.message}`, user_id: invited.user.id },
      { status: 500, headers: corsHeaders }
    );
  }

  return Response.json(
    { ok: true, user_id: invited.user.id, email, role },
    { headers: corsHeaders }
  );
});
