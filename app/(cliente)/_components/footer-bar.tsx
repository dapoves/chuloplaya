import type { ReactNode } from "react";

export function FooterBar({
  children,
  glass = true,
}: {
  children: ReactNode;
  glass?: boolean;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: "14px 18px 30px",
        background: glass ? "rgba(234,244,247,0.86)" : "var(--cp-bg)",
        backdropFilter: glass ? "blur(14px)" : "none",
        WebkitBackdropFilter: glass ? "blur(14px)" : "none",
        borderTop: "1px solid var(--cp-line)",
      }}
    >
      {children}
    </div>
  );
}
