"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#EAF4F7",
          color: "#0E2A38",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 30,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <svg
          width={100}
          height={100}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
          style={{ marginBottom: 14 }}
        >
          <circle cx="24" cy="17" r="9.5" fill="#FFC23C" />
          <path
            d="M3 34 Q12 28 24 34 T45 34"
            stroke="#FF7657"
            strokeWidth={3.2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M3 41 Q12 35 24 41 T45 41"
            stroke="#0A6E9E"
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
        </svg>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Error critico
        </h1>
        <p
          style={{
            fontSize: 14.5,
            color: "#4B6B78",
            maxWidth: 290,
            margin: "0 0 26px",
            lineHeight: 1.45,
          }}
        >
          Algo ha fallado por completo. Puedes intentar recargar la pagina.
        </p>

        <button
          onClick={reset}
          style={{
            padding: "13px 28px",
            borderRadius: 16,
            background: "#0A6E9E",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(10, 70, 110, 0.12)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Recargar pagina
        </button>
      </body>
    </html>
  );
}
