// Tipos compartidos del carrito cliente.

export type DurationId = "medio" | "dia" | "horas";

export type CartItem = {
  /** UUID del producto en la BD. */
  productId: string;
  /** Slug del producto (legible, viene del handoff). */
  slug: string;
  /** Nombre cacheado para evitar refetch al renderizar carrito. */
  nombre: string;
  /** Categoría (sillas/sombrillas/hamacas/extras) para el icono. */
  categoria: string;
  /** Precio base/día en €. */
  base: number;
  /** Modalidad de alquiler. */
  dur: DurationId;
  /** Horas solo cuando dur === 'horas'. */
  hours: number;
  /** Unidades del mismo (productId, dur, hours). */
  qty: number;
  /** Precio unitario calculado (precio_base * mult o por horas). */
  unit: number;
};

export const DURATIONS: Array<{
  id: DurationId;
  label: string;
  sub: string;
  mult?: number;
  perHour?: boolean;
}> = [
  { id: "medio", label: "Medio día", sub: "4 h · mañana o tarde", mult: 0.6 },
  { id: "dia", label: "Día completo", sub: "10:00 – 20:00", mult: 1 },
  { id: "horas", label: "Por horas", sub: "Desde 1 h", perHour: true },
];
