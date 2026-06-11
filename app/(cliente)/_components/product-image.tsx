import { Icon, type IconName } from "../_icons/icon";

/** Placeholder ilustrado para productos. No usa fotos reales (Phase 3). */
export function ProductImage({
  icon,
  height = 132,
  hero = false,
  rounded = true,
}: {
  icon: IconName;
  height?: number;
  hero?: boolean;
  rounded?: boolean;
}) {
  const iconSize = hero ? 96 : 56;
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: rounded ? "var(--cp-card-radius)" : 0,
        background:
          "radial-gradient(120% 90% at 78% 18%, rgba(255,194,60,0.28) 0%, rgba(10,110,158,0.10) 45%, var(--cp-surface-alt) 100%)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 200 140"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden
      >
        <circle cx="158" cy="34" r="20" fill="rgba(255,194,60,0.85)" />
        <path
          d="M0 112 Q40 100 80 110 T160 110 T240 110 V140 H0 Z"
          fill="rgba(10,110,158,0.12)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--cp-ink)",
          opacity: 0.92,
        }}
      >
        <Icon name={icon} size={iconSize} stroke={1.6} />
      </div>
    </div>
  );
}
