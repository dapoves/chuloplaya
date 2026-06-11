"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "accent" | "soft" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
};

const SIZE_STYLES: Record<Size, { padding: string; fontSize: number }> = {
  sm: { padding: "9px 14px", fontSize: 14 },
  md: { padding: "13px 18px", fontSize: 16 },
  lg: { padding: "16px 22px", fontSize: 17 },
};

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--cp-primary)",
    color: "var(--cp-on-primary)",
    boxShadow: "var(--cp-shadow-md)",
  },
  accent: {
    background: "var(--cp-accent)",
    color: "var(--cp-on-accent)",
    boxShadow: "var(--cp-shadow-md)",
  },
  soft: {
    background: "var(--cp-surface-alt)",
    color: "var(--cp-ink)",
  },
  outline: {
    background: "transparent",
    color: "var(--cp-ink)",
    boxShadow: "inset 0 0 0 1.5px var(--cp-line)",
  },
  ghost: {
    background: "transparent",
    color: "var(--cp-primary)",
  },
};

export const ChuloButton = forwardRef<HTMLButtonElement, Props>(
  function ChuloButton(
    {
      variant = "primary",
      size = "lg",
      full = false,
      leading,
      trailing,
      children,
      style,
      disabled,
      ...rest
    },
    ref
  ) {
    const s = SIZE_STYLES[size];
    return (
      <button
        ref={ref}
        disabled={disabled}
        className="cp-btn"
        style={{
          fontFamily: "var(--font-body), system-ui, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.01em",
          borderRadius: "var(--cp-btn-radius)",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          width: full ? "100%" : "auto",
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          padding: s.padding,
          fontSize: s.fontSize,
          transition: "transform .12s ease, filter .15s ease, background .15s, opacity .2s ease-out",
          WebkitTapHighlightColor: "transparent",
          ...VARIANT_STYLES[variant],
          ...style,
        }}
        {...rest}
      >
        {leading}
        {children}
        {trailing}
      </button>
    );
  }
);
