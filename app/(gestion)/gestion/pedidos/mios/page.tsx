import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ColaboradorHistory } from "../_colaborador-history";

export const dynamic = "force-dynamic";

export default async function MisPedidosGestionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/gestion/login");

  return (
    <ColaboradorHistory
      colaboradorId={user.id}
      title="Mis pedidos"
      subtitle="Histórico de todos los pedidos en los que has gestionado al menos un producto."
      backHref="/gestion/pedidos"
      basePageHref={(p) => {
        const params = new URLSearchParams();
        if (p > 1) params.set("page", String(p));
        const s = params.toString();
        return `/gestion/pedidos/mios${s ? `?${s}` : ""}`;
      }}
      page={page}
    />
  );
}
