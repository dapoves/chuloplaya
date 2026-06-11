"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/types/database.types";

import { updateUser } from "./actions";

type Role = Database["public"]["Enums"]["user_role"];

export type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  role: Role;
  is_fraudulent: boolean;
  created_at: string;
};

const ROLE_LABEL: Record<Role, string> = {
  cliente: "Cliente",
  colaborador: "Colaborador",
  admin: "Admin",
};

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  cliente: "outline",
  colaborador: "secondary",
  admin: "default",
};

export function UsuariosTable({ rows: initialRows }: { rows: UserRow[] }) {
  const [rows, setRows] = useState<UserRow[]>(initialRows);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sincroniza cuando el servidor revalida (ej. tras invitar un usuario)
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function saveRow(id: string, patch: Partial<UserRow>) {
    start(async () => {
      setError(null);
      const res = await updateUser(id, {
        display_name: patch.display_name,
        phone: patch.phone,
        role: patch.role,
        is_fraudulent: patch.is_fraudulent,
      });
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Usuario actualizado");
      setRows((cur) =>
        cur.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );
      setEditingId(null);
    });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fraude</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  No hay usuarios para los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) =>
                editingId === r.id ? (
                  <EditRow
                    key={r.id}
                    row={r}
                    onCancel={() => setEditingId(null)}
                    onSave={(patch) => saveRow(r.id, patch)}
                    pending={pending}
                  />
                ) : (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[14rem] truncate text-sm">{r.email}</TableCell>
                    <TableCell className="text-sm">{r.display_name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[r.role]}>{ROLE_LABEL[r.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.is_fraudulent ? (
                        <Badge variant="destructive">Sí</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(r.id)}
                      >
                        <Pencil className="size-3" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
        {error ? (
          <p className="px-4 py-2 text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EditRow({
  row,
  onSave,
  onCancel,
  pending,
}: {
  row: UserRow;
  onSave: (patch: Partial<UserRow>) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [displayName, setDisplayName] = useState(row.display_name ?? "");
  const [phone, setPhone] = useState(row.phone ?? "");
  const [role, setRole] = useState<Role>(row.role);
  const [isFraud, setIsFraud] = useState(row.is_fraudulent);

  return (
    <TableRow>
      <TableCell className="max-w-[14rem] truncate text-sm">{row.email}</TableCell>
      <TableCell>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </TableCell>
      <TableCell>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
        >
          <option value="cliente">Cliente</option>
          <option value="colaborador">Colaborador</option>
          <option value="admin">Admin</option>
        </select>
      </TableCell>
      <TableCell>
        <input
          type="checkbox"
          checked={isFraud}
          onChange={(e) => setIsFraud(e.target.checked)}
          className="size-4"
        />
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(row.created_at).toLocaleDateString("es-ES")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            <X className="size-3" /> Cancelar
          </Button>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              onSave({
                display_name: displayName.trim() || null,
                phone: phone.trim() || null,
                role,
                is_fraudulent: isFraud,
              })
            }
          >
            <Save className="size-3" /> Guardar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
