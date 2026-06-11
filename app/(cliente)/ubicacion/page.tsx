import { createClient } from "@/lib/supabase/server";

import { UbicacionClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function UbicacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya hay sesión real con datos, los autorrellenamos.
  let prefill = { name: "", email: "", phone: "", isAnonymous: true };

  if (user) {
    const isAnon = Boolean(user.is_anonymous) || !user.email;
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone, display_name")
      .eq("id", user.id)
      .maybeSingle();
    prefill = {
      name: profile?.display_name ?? "",
      email: user.email ?? "",
      phone: profile?.phone ?? "",
      isAnonymous: isAnon,
    };
  }

  return <UbicacionClient prefill={prefill} />;
}
