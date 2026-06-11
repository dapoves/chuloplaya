"use client";

import type { ReactNode } from "react";

export function Chip({
  active,
  onClick,
  leading,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  leading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontWeight: 600,
        fontSize: 14.5,
        cursor: "pointer",
        padding: "9px 15px",
        borderRadius: "var(--cp-pill-radius)",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        border: active ? "none" : "1.5px solid var(--cp-line)",
        background: active ? "var(--cp-primary)" : "var(--cp-surface)",
        color: active ? "var(--cp-on-primary)" : "var(--cp-ink-soft)",
        transition: "all .2s ease-out",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {leading}
      {children}
    </button>
  );
}
