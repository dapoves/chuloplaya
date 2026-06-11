import type { Database } from "@/lib/types/database.types";

export type ItemStatus = Database["public"]["Enums"]["item_status"];

export type PushMessage = {
  title: string;
  body: string;
};

/**
 * Texto que verá el cliente en la notificación push según el nuevo estado del
 * item. `aceptado` solo se envía la primera vez (cuando un item del pedido
 * pasa de enviado → aceptado); el resto se mapea 1:1.
 */
export const PUSH_MESSAGES: Partial<Record<ItemStatus, PushMessage>> = {
  aceptado: {
    title: "¡Pedido aceptado!",
    body: "Estamos preparando tu material.",
  },
  en_camino: {
    title: "Tu pedido va de camino",
    body: "El repartidor está saliendo hacia tu sitio.",
  },
  entregado: {
    title: "Pedido entregado",
    body: "Disfruta de la playa.",
  },
  pendiente_devolucion: {
    title: "Hora de recoger",
    body: "Pasamos a recoger el material en breve.",
  },
  devuelto: {
    title: "Material recogido",
    body: "¡Hasta la próxima!",
  },
  cancelado: {
    title: "Pedido cancelado",
    body: "Hemos cancelado tu pedido. Contáctanos si es un error.",
  },
};

export function messageForStatus(status: ItemStatus): PushMessage | null {
  return PUSH_MESSAGES[status] ?? null;
}
