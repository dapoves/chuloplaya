import Link from "next/link";

export default function NotFound() {
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
      {/* Sol triste hundiéndose en las olas */}
      <svg
        width={140}
        height={140}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        style={{ marginBottom: 6 }}
      >
        <circle cx="24" cy="28" r="9.5" fill="#FFC23C" opacity={0.55} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={24 + Math.cos(a) * 12.5}
              y1={28 + Math.sin(a) * 12.5}
              x2={24 + Math.cos(a) * 16}
              y2={28 + Math.sin(a) * 16}
              stroke="#FFC23C"
              strokeWidth={2.2}
              strokeLinecap="round"
              opacity={0.4}
            />
          );
        })}
        <path
          d="M3 30 Q12 24 24 30 T45 30"
          stroke="#0A6E9E"
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 36.5 Q12 30.5 24 36.5 T45 36.5"
          stroke="#0A6E9E"
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
        />
      </svg>

      <div
        className="cp-display"
        style={{ fontSize: 64, lineHeight: 1, color: "var(--cp-primary)" }}
      >
        404
      </div>
      <p
        style={{
          fontSize: 17,
          fontWeight: 600,
          marginTop: 8,
          color: "var(--cp-ink)",
        }}
      >
        Esta playa no existe
      </p>
      <p
        style={{
          fontSize: 14.5,
          color: "var(--cp-ink-soft)",
          maxWidth: 280,
          marginTop: 4,
        }}
      >
        La pagina que buscas se la llevo la marea.
      </p>

      <Link
        href="/catalogo"
        style={{
          marginTop: 28,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "13px 28px",
          borderRadius: "var(--cp-btn-radius)",
          background: "var(--cp-primary)",
          color: "var(--cp-on-primary)",
          fontWeight: 700,
          fontSize: 16,
          textDecoration: "none",
          boxShadow: "var(--cp-shadow-md)",
          fontFamily: "var(--font-body), system-ui, sans-serif",
        }}
      >
        Volver al catalogo
      </Link>
    </div>
  );
}
