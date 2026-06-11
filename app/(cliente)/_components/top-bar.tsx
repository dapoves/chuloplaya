"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Icon } from "../_icons/icon";

export function TopBar({
  title,
  sub,
  onBack,
  backHref,
  showBack = true,
  right,
  onColor = false,
}: {
  title?: string;
  sub?: string;
  onBack?: () => void;
  backHref?: string;
  showBack?: boolean;
  right?: ReactNode;
  onColor?: boolean;
}) {
  const router = useRouter();
  const fg = onColor ? "var(--cp-on-primary)" : "var(--cp-ink)";

  const handleBack = () => {
    if (onBack) onBack();
    else if (backHref) router.push(backHref);
    else router.back();
  };

  const iconBtnStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: onColor ? "rgba(255,255,255,0.18)" : "var(--cp-surface)",
    color: fg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: onColor ? "none" : "var(--cp-shadow-sm)",
    flexShrink: 0,
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div
      style={{
        paddingTop: 56,
        paddingLeft: 18,
        paddingRight: 18,
        paddingBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {showBack ? (
        <button type="button" onClick={handleBack} aria-label="Volver" style={iconBtnStyle}>
          <Icon name="back" size={20} stroke={2.2} />
        </button>
      ) : (
        <div style={{ width: 38 }} />
      )}
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        {title && (
          <div
            style={{
              fontWeight: 700,
              fontSize: 16.5,
              color: fg,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        )}
        {sub && (
          <div
            style={{
              fontWeight: 500,
              fontSize: 12.5,
              color: onColor ? "rgba(255,255,255,0.8)" : "var(--cp-ink-soft)",
              marginTop: 1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {right || <div style={{ width: 38 }} />}
    </div>
  );
}
