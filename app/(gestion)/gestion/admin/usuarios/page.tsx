import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

import { UsuariosTable, type UserRow } from "./_table";
import { InviteUserForm } from "./_invite-form";

export const dynamic = "force-dynamic";

type Role = Database["public"]["Enums"]["user_role"];

const PAGE_SIZE = 20;

export default async function UsuariosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const roleParam = (sp.role ?? "").trim();
  const role: Role | null =
    roleParam === "cliente" || roleParam === "colaborador" || roleParam === "admin"
      ? (roleParam as Role)
      : null;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users", {
    p_search: q || undefined,
    p_role: role ?? undefined,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Card>
          <CardContent className="text-sm text-destructive">{error.message}</CardContent>
        </Card>
      </div>
    );
  }

  const rows: UserRow[] = (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    display_name: r.display_name,
    phone: r.phone,
    role: r.role,
    is_fraudulent: r.is_fraudulent,
    created_at: r.created_at,
  }));
  const total = Number((data ?? [])[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/gestion/admin/usuarios${s ? `?${s}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Invita colaboradores, edita perfiles y cambia roles.
          </p>
        </div>
      </div>

      <InviteUserForm />

      <Card>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="q" className="text-xs text-muted-foreground">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Email, nombre o teléfono"
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-xs text-muted-foreground">
                Rol
              </label>
              <select
                id="role"
                name="role"
                defaultValue={role ?? ""}
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="cliente">Cliente</option>
                <option value="colaborador">Colaborador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" variant="outline" size="sm">
              Buscar
            </Button>
            {(q || role) && (
              <Link
                href="/gestion/admin/usuarios"
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              >
                Limpiar
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      <UsuariosTable rows={rows} />

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {total} usuarios · página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link href={baseHref(Math.max(1, page - 1))}>
              <Button variant="outline" size="sm" disabled={page === 1}>
                Anterior
              </Button>
            </Link>
            <Link href={baseHref(Math.min(totalPages, page + 1))}>
              <Button variant="outline" size="sm" disabled={page === totalPages}>
                Siguiente
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
