import type { ReactNode } from "react";

/** Wrapper full-height para cada pantalla. Mantiene fondo y tipografía. */
export function ScreenShell({
  children,
  bg,
  className = "",
}: {
  children: ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-dvh flex-col ${className}`}
      style={{
        background: bg ?? "var(--cp-bg)",
        color: "var(--cp-ink)",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
