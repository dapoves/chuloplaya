"use client";

import { useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { setOrderStatus } from "./actions";

export function DevueltoModal({
  orderId,
  open,
  onClose,
}: {
  orderId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="devuelto-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => { if (!pending) onClose(); }}
        className="absolute inset-0 bg-black/50"
      />

      <div className="bg-card relative z-10 w-full max-w-md rounded-xl border p-5 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <h2 id="devuelto-modal-title" className="text-lg font-semibold">
            Confirmar devolución
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground -m-1 rounded-md p-1 disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Marca esto <strong>solo cuando hayas recogido físicamente el
          material</strong> del cliente. Una vez confirmado, el pedido se
          cerrará como completado.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await setOrderStatus(orderId, "devuelto");
                if ("error" in res && res.error) {
                  toast.error(res.error);
                } else {
                  toast.success("Material marcado como devuelto");
                  onClose();
                }
              })
            }
          >
            {pending ? "Marcando…" : "Sí, material recogido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
