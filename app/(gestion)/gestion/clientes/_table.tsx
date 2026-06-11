"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { setFraudulent } from "./actions";

type Cliente = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  is_fraudulent: boolean;
  created_at: string;
};

export function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Aún no hay clientes registrados.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((c) => (
              <ClienteRow key={c.id} cliente={c} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ClienteRow({ cliente }: { cliente: Cliente }) {
  const [pending, start] = useTransition();
  const [fraud, setFraud] = useState(cliente.is_fraudulent);
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    start(async () => {
      setError(null);
      const next = !fraud;
      const res = await setFraudulent(cliente.id, next);
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        setFraud(next);
        toast.success(next ? "Marcado como fraudulento" : "Marca de fraude retirada");
      }
    });
  }

  return (
    <>
      <TableRow className={fraud ? "bg-destructive/5" : undefined}>
        <TableCell className="text-sm font-medium">
          {cliente.display_name ?? <span className="text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {cliente.email ?? <span>—</span>}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {cliente.phone ? (
            <a href={`tel:${cliente.phone}`} className="hover:underline">
              {cliente.phone}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {new Date(cliente.created_at).toLocaleDateString("es-ES")}
        </TableCell>
        <TableCell className="text-center">
          <button
            onClick={toggle}
            disabled={pending}
            title={fraud ? "Quitar marca de fraude" : "Marcar como fraudulento"}
            className="cursor-pointer disabled:opacity-50"
          >
            {pending ? (
              <Badge variant="outline" className="opacity-50">…</Badge>
            ) : fraud ? (
              <Badge variant="destructive" className="hover:opacity-80 transition-opacity">
                Fraudulento
              </Badge>
            ) : (
              <Badge variant="outline" className="hover:border-destructive hover:text-destructive transition-colors">
                OK
              </Badge>
            )}
          </button>
        </TableCell>
      </TableRow>
      {error ? (
        <TableRow>
          <TableCell
            colSpan={5}
            className="py-1 text-xs font-medium text-destructive"
          >
            {error}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
