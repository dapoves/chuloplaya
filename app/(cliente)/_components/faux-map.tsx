"use client";

import { Icon } from "../_icons/icon";

/**
 * Mapa ilustrativo SVG. No es un mapa real — el handoff lo usa como
 * placeholder visual en LocationScreen y TrackingScreen.
 *
 * `withMotion` activa un punto que recorre la ruta en bucle (estado camino).
 */
export function FauxMap({
  height = 188,
  withMotion = false,
}: {
  height?: number;
  withMotion?: boolean;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: "var(--cp-card-radius)",
        background:
          "linear-gradient(180deg, #DAEBF1 0%, #EAF4F7 60%, #F4ECDC 100%)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--cp-line)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 360 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {/* arena */}
        <path d="M0 140 Q90 130 180 140 T360 140 V200 H0Z" fill="#F4ECDC" />
        {/* orilla */}
        <path
          d="M0 140 Q90 130 180 140 T360 140"
          stroke="#0A6E9E"
          strokeWidth="2"
          fill="none"
          opacity="0.55"
        />
        {/* olas */}
        <path
          d="M0 120 Q60 110 120 120 T240 120 T360 120"
          stroke="#0A6E9E"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />
        {/* ruta */}
        <path
          id="cp-route"
          d="M40 170 Q120 150 200 160 T320 140"
          stroke="#FF7657"
          strokeWidth="3"
          fill="none"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        {/* pin destino */}
        <g transform="translate(312,128)">
          <circle r="10" fill="#FFC23C" />
          <circle r="3.5" fill="#0E2A38" />
        </g>
        {/* punto en movimiento (modo camino) */}
        {withMotion && (
          <circle r="7" fill="#0A6E9E" stroke="#fff" strokeWidth="2">
            <animateMotion dur="4s" repeatCount="indefinite">
              <mpath xlinkHref="#cp-route" />
            </animateMotion>
          </circle>
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 14,
          padding: "5px 10px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: "var(--cp-ink-soft)",
        }}
      >
        <Icon name="nav" size={14} stroke={2.4} color="var(--cp-coral)" />
        En vivo
      </div>
    </div>
  );
}
