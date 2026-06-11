import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ColaboradorHistory } from "../../_colaborador-history";

export const dynamic = "force-dynamic";

export default async function ColaboradorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", id)
    .maybeSingle();

  if (!profile || (profile.role !== "colaborador" && profile.role !== "admin"))
    notFound();

  const nombre = profile.display_name ?? "Colaborador";

  return (
    <ColaboradorHistory
      colaboradorId={id}
      title={`Pedidos de ${nombre}`}
      subtitle={`Histórico de todos los pedidos gestionados por ${nombre}.`}
      backHref="/gestion/pedidos/colaboradores"
      basePageHref={(p) => {
        const params = new URLSearchParams();
        if (p > 1) params.set("page", String(p));
        const s = params.toString();
        return `/gestion/pedidos/colaboradores/${id}${s ? `?${s}` : ""}`;
      }}
      page={page}
    />
  );
}
