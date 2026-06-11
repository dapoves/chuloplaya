import { DURATIONS, type DurationId } from "./cart-types";

/**
 * Calcula el precio unitario para una línea de carrito según modalidad.
 *  - medio  → base × 0.6
 *  - día    → base × 1.0
 *  - horas  → (base / 6) × horas, redondeado a 1 decimal
 */
export function calcUnit(base: number, dur: DurationId, hours = 2): number {
  const d = DURATIONS.find((x) => x.id === dur) ?? DURATIONS[1];
  if (d.perHour) {
    return Math.round((base / 6) * hours * 10) / 10;
  }
  return Math.round(base * (d.mult ?? 1) * 10) / 10;
}

export function perHourRate(base: number): number {
  return Math.round((base / 6) * 10) / 10;
}

export function formatEur(value: number): string {
  // El handoff usa siempre 1 decimal máx, sin símbolo intermedio.
  return `${value.toFixed(1).replace(".0", "")}€`;
}
