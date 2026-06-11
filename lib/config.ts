import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Tipado del key/value almacenado en `public.config`.
 * Las claves reflejan exactamente las filas creadas en migraciones previas.
 */

export type DuracionOption = {
  id: string;
  label: string;
  horas: number;
};

export type ConfigShape = {
  hora_cierre: string; // formato "HH:MM"
  texto_punto_devolucion: string;
  duraciones_disponibles: DuracionOption[];
};

export type ConfigKey = keyof ConfigShape;

export const CONFIG_DEFAULTS: ConfigShape = {
  hora_cierre: "20:00",
  texto_punto_devolucion:
    "Punto de devolución: chiringuito principal, junto a la entrada de la playa.",
  duraciones_disponibles: [
    { id: "medio_dia", label: "Medio día", horas: 4 },
    { id: "dia_completo", label: "Día completo", horas: 8 },
  ],
};

/** Lee todas las claves conocidas. SELECT está abierto a anon/authenticated. */
export const getConfigAll = cache(async (): Promise<ConfigShape> => {
  const supabase = await createClient();
  const { data } = await supabase.from("config").select("clave, valor");
  const out: ConfigShape = { ...CONFIG_DEFAULTS };
  for (const row of data ?? []) {
    if (row.clave in CONFIG_DEFAULTS) {
      // Confiamos en validaciones de escritura — la UI de admin valida antes de upsert.
      (out as Record<string, unknown>)[row.clave] = row.valor;
    }
  }
  return out;
});

export async function getConfig<K extends ConfigKey>(
  key: K
): Promise<ConfigShape[K]> {
  const all = await getConfigAll();
  return all[key];
}

/** Valida el valor antes de aceptarlo. Devuelve mensaje de error o null si OK. */
export function validateConfig<K extends ConfigKey>(
  key: K,
  value: unknown
): string | null {
  switch (key) {
    case "hora_cierre": {
      if (typeof value !== "string") return "Debe ser texto.";
      if (!/^\d{2}:\d{2}$/.test(value)) return "Formato HH:MM, ej. 20:30.";
      const [h, m] = value.split(":").map(Number);
      if (h > 23 || m > 59) return "Hora fuera de rango.";
      return null;
    }
    case "texto_punto_devolucion": {
      if (typeof value !== "string") return "Debe ser texto.";
      if (value.trim().length < 4) return "Mínimo 4 caracteres.";
      if (value.length > 280) return "Máximo 280 caracteres.";
      return null;
    }
    case "duraciones_disponibles": {
      if (!Array.isArray(value) || value.length === 0) {
        return "Debe ser una lista no vacía.";
      }
      for (const it of value) {
        if (
          !it ||
          typeof it !== "object" ||
          typeof (it as DuracionOption).id !== "string" ||
          typeof (it as DuracionOption).label !== "string" ||
          typeof (it as DuracionOption).horas !== "number" ||
          (it as DuracionOption).horas <= 0
        ) {
          return "Cada duración necesita id, label y horas > 0.";
        }
      }
      return null;
    }
    default:
      return "Clave desconocida.";
  }
}
