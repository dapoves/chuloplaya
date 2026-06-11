import Link from "next/link";

import { Icon } from "../_icons/icon";

/** Botón de acceso a /mi-cuenta para el header del catálogo. Siempre visible. */
export async function AccountLink() {
  return (
    <Link
      href="/mi-cuenta"
      aria-label="Mi cuenta"
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        background: "var(--cp-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--cp-ink-soft)",
        flexShrink: 0,
      }}
    >
      <Icon name="user" size={17} />
    </Link>
  );
}
