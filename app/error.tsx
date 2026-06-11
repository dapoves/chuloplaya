"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ChuloPlaya]", error);
  }, [error]);

  return (
    <div
      data-theme="costa"
      style={{
        minHeight: "100dvh",
        background: "var(--cp-bg)",
        color: "var(--cp-ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 30,
        fontFamily: "var(--font-body), system-ui, sans-serif",
      }}
    >
      {/* Sol con ola revuelta */}
      <svg
        width={120}
        height={120}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        style={{ marginBottom: 10 }}
      >
        <circle cx="24" cy="17" r="9.5" fill="#FFC23C" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={24 + Math.cos(a) * 12.5}
              y1={17 + Math.sin(a) * 12.5}
              x2={24 + Math.cos(a) * 16}
              y2={17 + Math.sin(a) * 16}
              stroke="#FFC23C"
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          );
        })}
        <path
          d="M3 36 Q10 30 18 36 Q26 42 34 34 Q38 30 45 33"
          stroke="#FF7657"
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 42 Q12 36 24 42 T45 42"
          stroke="#0A6E9E"
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
      </svg>

      <div
        className="cp-display"
        style={{ fontSize: 26, color: "var(--cp-ink)" }}
      >
        Algo salio mal
      </div>
      <p
        style={{
          fontSize: 14.5,
          color: "var(--cp-ink-soft)",
          maxWidth: 290,
          marginTop: 6,
          lineHeight: 1.45,
        }}
      >
        Ha habido un error inesperado. Puedes intentarlo de nuevo o volver al
        inicio.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
        <button
          onClick={reset}
          className="cp-btn"
          style={{
            padding: "13px 24px",
            borderRadius: "var(--cp-btn-radius)",
            background: "var(--cp-primary)",
            color: "var(--cp-on-primary)",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--cp-shadow-md)",
            fontFamily: "var(--font-body), system-ui, sans-serif",
          }}
        >
          Reintentar
        </button>
        <a
          href="/catalogo"
          className="cp-btn"
          style={{
            padding: "13px 24px",
            borderRadius: "var(--cp-btn-radius)",
            background: "var(--cp-surface-alt)",
            color: "var(--cp-ink)",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            fontFamily: "var(--font-body), system-ui, sans-serif",
          }}
        >
          Ir al catalogo
        </a>
      </div>
    </div>
  );
}
