import type { ReactNode } from "react";

type Tone = "primary" | "accent" | "coral" | "success";

const TONE_BAR: Record<Tone, string> = {
  primary: "var(--bt-primary)",
  accent: "var(--bt-accent)",
  coral: "var(--bt-coral)",
  success: "var(--bt-success)",
};

const TONE_ICON_BG: Record<Tone, string> = {
  primary: "var(--bt-primary-12)",
  accent: "var(--bt-accent-18)",
  coral: "var(--bt-coral-14)",
  success: "var(--bt-success-14)",
};

const TONE_ICON_COLOR: Record<Tone, string> = {
  primary: "var(--bt-primary-deep)",
  accent: "var(--bt-ink)",
  coral: "var(--bt-coral)",
  success: "var(--bt-success)",
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="relative flex h-full items-stretch overflow-hidden rounded-[4px] border border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card)] shadow-[0_1px_0_var(--bt-line)]">
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: TONE_BAR[tone] }}
      />
      <div className="flex flex-1 items-start gap-3 p-4 pl-5">
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[3px]"
            style={{ background: TONE_ICON_BG[tone], color: TONE_ICON_COLOR[tone] }}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <span className="bt-stencil text-[10px] text-[color:var(--bt-ink-soft)]">
            {label}
          </span>
          <div className="bt-mono text-2xl font-bold leading-tight text-[color:var(--bt-ink)]">
            {value}
          </div>
          {hint && (
            <div className="bt-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--bt-ink-faint)]">
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
