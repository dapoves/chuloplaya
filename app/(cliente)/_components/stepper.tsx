"use client";

import { Icon } from "../_icons/icon";

function StepperBtn({
  icon,
  onClick,
  disabled,
  label,
}: {
  icon: "plus" | "minus";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-label={label}
      className="cp-btn"
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: "none",
        background: disabled ? "var(--cp-surface-alt)" : "var(--cp-primary)",
        color: disabled ? "var(--cp-ink-faint)" : "var(--cp-on-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        transition: "background .15s, transform .1s ease",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <Icon name={icon} size={18} stroke={2.4} />
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 9,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <StepperBtn
        icon="minus"
        label="Quitar uno"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      />
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          minWidth: 18,
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          color: "var(--cp-ink)",
        }}
      >
        {value}
      </div>
      <StepperBtn
        icon="plus"
        label="Añadir uno"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      />
    </div>
  );
}
