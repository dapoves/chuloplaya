"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { addCategory, type CategoryState } from "./actions";

export function AddCategoryForm() {
  const [state, formAction, pending] = useActionState<CategoryState, FormData>(
    addCategory,
    null
  );
  const [inputKey, setInputKey] = useState(0);
  useEffect(() => {
    if (state?.ok) {
      toast.success(state.ok);
      setInputKey((k) => k + 1);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex items-stretch gap-2"
    >
      <input
        key={inputKey}
        id="nombre"
        name="nombre"
        placeholder="Nombre de la categoría…"
        required
        maxLength={40}
        className="flex-1 min-w-0 rounded-[4px] border px-3 py-2.5 text-sm outline-none transition-colors"
        style={{
          background: "#FFFDF8",
          borderColor: "rgba(14,42,56,0.32)",
          color: "#0E2A38",
        }}
      />
      <button
        type="submit"
        disabled={pending}
        className="bt-stencil flex items-center gap-1.5 rounded-[4px] border px-4 py-2.5 text-[11px] transition-colors disabled:opacity-50"
        style={{
          background: "#0E2A38",
          borderColor: "#0E2A38",
          color: "#F2EDE0",
        }}
      >
        <Plus className="size-3.5" />
        {pending ? "Creando…" : "Crear"}
      </button>
    </form>
  );
}
