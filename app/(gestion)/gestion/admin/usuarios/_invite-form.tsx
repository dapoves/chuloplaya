"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { inviteUser, type UserActionState } from "./actions";

export function InviteUserForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(
    inviteUser,
    null
  );

  useEffect(() => {
    if (state?.ok) toast.success(state.ok);
    if (state?.error) toast.error(state.error);
  }, [state]);

  if (!open) {
    return (
      <div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Invitar usuario
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="invite-email">
                Email
              </label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                required
                placeholder="alguien@correo.es"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="invite-name">
                Nombre (opcional)
              </label>
              <Input id="invite-name" name="display_name" placeholder="María" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="invite-role">
                Rol
              </label>
              <select
                id="invite-role"
                name="role"
                defaultValue="colaborador"
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
              >
                <option value="colaborador">Colaborador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando…" : "Enviar invitación"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
