"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteProduct } from "./actions";

export function DeleteProductButton({ id, nombre }: { id: string; nombre: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            if (!confirm(`¿Eliminar "${nombre}"? Si tiene historial se desactivará.`)) return;
            setError(null);
            const res = await deleteProduct(id);
            if (res?.error) {
              setError(res.error);
              toast.error(res.error);
            } else {
              toast.success("Producto eliminado");
            }
          })
        }
      >
        <Trash2 className="size-3" /> Eliminar
      </Button>
      {error ? (
        <span className="ml-2 text-xs text-destructive">{error}</span>
      ) : null}
    </>
  );
}
