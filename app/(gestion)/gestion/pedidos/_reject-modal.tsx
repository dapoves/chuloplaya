"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { rejectOrder } from "./actions";

const MIN = 5;
const MAX = 500;

export function RejectModal({
  orderId,
  open,
  onClose,
}: {
  orderId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setMotivo("");
      setError(null);
      // foco con un pequeño delay para asegurar montaje
      const t = setTimeout(() => textareaRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Cerrar con Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  if (!open) return null;

  const clean = motivo.trim();
  const tooShort = clean.length < MIN;
  const tooLong = clean.length > MAX;
  const disabled = pending || tooShort || tooLong;

  function submit() {
    if (disabled) return;
    start(async () => {
      setError(null);
      const res = await rejectOrder(orderId, clean);
      if ("error" in res && res.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Pedido rechazado");
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="reject-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => {
          if (!pending) onClose();
        }}
        className="absolute inset-0 bg-black/50"
      />

      {/* Card */}
      <div className="bg-card relative z-10 w-full max-w-md rounded-xl border p-5 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <h2 id="reject-modal-title" className="text-lg font-semibold">
            Rechazar pedido
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

        <p className="text-muted-foreground mt-1 text-sm">
          Cuéntale al cliente por qué no podéis atender este pedido. Lo verá
          siempre en su pantalla.
        </p>

        <label
          htmlFor="reject-motivo"
          className="mt-4 mb-1 block text-xs font-medium"
        >
          Motivo del rechazo
        </label>
        <textarea
          ref={textareaRef}
          id="reject-motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={MAX}
          rows={4}
          placeholder="Ej. No tenemos hamacas suficientes hoy, lo sentimos."
          className="w-full resize-none rounded-md border bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          disabled={pending}
        />

        <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
          <span>
            {tooShort
              ? `Mínimo ${MIN} caracteres`
              : tooLong
                ? `Máximo ${MAX} caracteres`
                : "Listo para enviar"}
          </span>
          <span>
            {clean.length}/{MAX}
          </span>
        </div>

        {error ? (
          <p className="text-destructive mt-3 text-sm font-medium">{error}</p>
        ) : null}

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
            variant="destructive"
            size="sm"
            onClick={submit}
            disabled={disabled}
          >
            {pending ? "Rechazando…" : "Rechazar pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
