export function ChuloMark({ size = 36 }: { size?: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="17" r="9.5" fill="#FFC23C" />
      {rays.map((deg) => {
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
        d="M5 34 Q14 28.5 24 34 T43 34"
        stroke="#0A6E9E"
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M5 40.5 Q14 35 24 40.5 T43 40.5"
        stroke="#0A6E9E"
        strokeWidth={2.8}
        strokeLinecap="round"
        fill="none"
        opacity={0.45}
      />
    </svg>
  );
}

export function ChuloLogo({
  size = 22,
  mono = false,
  stacked = false,
}: {
  size?: number;
  mono?: boolean;
  stacked?: boolean;
}) {
  const inkColor = mono ? "var(--cp-on-primary)" : "var(--cp-ink)";
  const playaColor = mono ? "var(--cp-on-primary)" : "var(--cp-primary)";
  return (
    <div
      className="flex items-center"
      style={{
        gap: stacked ? 6 : 10,
        flexDirection: stacked ? "column" : "row",
      }}
    >
      <ChuloMark size={size * 1.5} />
      <div
        className="cp-display"
        style={{
          fontSize: size,
          lineHeight: 1,
          color: inkColor,
          textAlign: stacked ? "center" : "left",
        }}
      >
        Chulo<span style={{ color: playaColor }}> Playa</span>
      </div>
    </div>
  );
}
