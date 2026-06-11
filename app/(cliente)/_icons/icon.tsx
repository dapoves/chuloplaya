import type { CSSProperties } from "react";

export type IconName =
  | "chair"
  | "umbrella"
  | "lounger"
  | "cooler"
  | "ball"
  | "towel"
  | "cart"
  | "plus"
  | "minus"
  | "back"
  | "close"
  | "check"
  | "pin"
  | "nav"
  | "clock"
  | "user"
  | "phone"
  | "logout"
  | "bag"
  | "sun"
  | "truck"
  | "sparkle"
  | "qr"
  | "chevron"
  | "edit"
  | "heart"
  | "info"
  | "receipt"
  | "mail";

export function Icon({
  name,
  size = 24,
  stroke = 2,
  color = "currentColor",
  style,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const p = {
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, React.ReactNode> = {
    chair: (
      <g {...p}>
        <path d="M6 4v8M18 4v8M6 12h12M5 12l1 8M19 12l-1 8M6 16h12" />
      </g>
    ),
    umbrella: (
      <g {...p}>
        <path d="M12 3v18M4 11a8 8 0 0 1 16 0z" />
        <path d="M12 21a2 2 0 0 0 2-2" />
      </g>
    ),
    lounger: (
      <g {...p}>
        <path d="M3 17l8-2 10-3M4 17l.5 3M20 12.5l.6-2.2a1.5 1.5 0 0 0-2.9-.8L17 12M3 14l4-1M8 12.6l1.6-3.4" />
      </g>
    ),
    cooler: (
      <g {...p}>
        <rect x="4" y="8" width="16" height="11" rx="2" />
        <path d="M4 12h16M9 8V6h6v2M10 19v2M14 19v2" />
      </g>
    ),
    ball: (
      <g {...p}>
        <circle cx="9" cy="9" r="5" />
        <path d="M13 13l6 6M9 4v10M4 9h10" />
      </g>
    ),
    towel: (
      <g {...p}>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 4v16M9 8h6M9 12h6" />
      </g>
    ),
    cart: (
      <g {...p}>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 11h11l1.8-8H6" />
      </g>
    ),
    plus: (
      <g {...p}>
        <path d="M12 5v14M5 12h14" />
      </g>
    ),
    minus: (
      <g {...p}>
        <path d="M5 12h14" />
      </g>
    ),
    back: (
      <g {...p}>
        <path d="M15 5l-7 7 7 7" />
      </g>
    ),
    close: (
      <g {...p}>
        <path d="M6 6l12 12M18 6L6 18" />
      </g>
    ),
    check: (
      <g {...p}>
        <path d="M4 12l5 5L20 6" />
      </g>
    ),
    pin: (
      <g {...p}>
        <path d="M12 21s7-6.3 7-11a7 7 0 0 0-14 0c0 4.7 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </g>
    ),
    nav: (
      <g {...p}>
        <path d="M3 11l18-7-7 18-2.5-8.5z" />
      </g>
    ),
    clock: (
      <g {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </g>
    ),
    user: (
      <g {...p}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" />
      </g>
    ),
    phone: (
      <g {...p}>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l2 4v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
      </g>
    ),
    logout: (
      <g {...p}>
        <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
        <path d="M16 16l4-4-4-4" />
        <path d="M20 12H10" />
      </g>
    ),
    bag: (
      <g {...p}>
        <path d="M6 8h12l1 12H5L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </g>
    ),
    sun: (
      <g {...p}>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
      </g>
    ),
    truck: (
      <g {...p}>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </g>
    ),
    sparkle: (
      <g {...p}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      </g>
    ),
    qr: (
      <g {...p}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M21 14v7h-7" />
      </g>
    ),
    chevron: (
      <g {...p}>
        <path d="M9 6l6 6-6 6" />
      </g>
    ),
    edit: (
      <g {...p}>
        <path d="M4 20h4L18 10l-4-4L4 16zM14 6l4 4" />
      </g>
    ),
    heart: (
      <g {...p}>
        <path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20z" />
      </g>
    ),
    info: (
      <g {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </g>
    ),
    receipt: (
      <g {...p}>
        <path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21z" />
        <path d="M9 8h6M9 12h6" />
      </g>
    ),
    mail: (
      <g {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </g>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      className={className}
      aria-hidden
    >
      {paths[name] ?? null}
    </svg>
  );
}

/** Mapeo categoría → icono del catálogo. */
export function categoryIcon(categoria: string | null): IconName {
  switch (categoria) {
    case "sillas":
      return "chair";
    case "sombrillas":
      return "umbrella";
    case "hamacas":
      return "lounger";
    case "extras":
      return "cooler";
    default:
      return "sparkle";
  }
}
