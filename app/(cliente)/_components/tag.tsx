import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "primary";
}) {
  const isAccent = tone === "accent";
  return (
    <span
      style={{
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: "4px 9px",
        borderRadius: 999,
        background: isAccent ? "var(--cp-accent)" : "var(--cp-primary-10)",
        color: isAccent ? "var(--cp-on-accent)" : "var(--cp-primary)",
      }}
    >
      {children}
    </span>
  );
}
