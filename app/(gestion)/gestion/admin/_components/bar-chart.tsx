type Datum = { label: string; value: number; sub?: string };

export function BarChart({
  data,
  formatValue = (v: number) => v.toString(),
}: {
  data: Datum[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div
            key={i}
            className="grid grid-cols-[110px_1fr_70px] items-center gap-3 bt-anim-rise"
            style={{ ["--i" as never]: i }}
          >
            <div className="flex items-center min-w-0">
              <span className="truncate text-sm font-medium text-[color:var(--bt-ink)]">
                {d.label}
              </span>
            </div>
            <div className="relative h-6 overflow-hidden rounded-[3px] border" style={{ borderColor: "rgba(14,42,56,0.12)", background: "#E6DEC9" }}>
              <div
                className="h-full transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%`, background: "#0A6E9E" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 20%)",
                }}
              />
            </div>
            <div className="text-right">
              <span className="bt-mono text-sm font-semibold text-[color:var(--bt-ink)]">
                {formatValue(d.value)}
              </span>
              {d.sub && (
                <span className="bt-mono ml-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--bt-ink-faint)]">
                  {d.sub}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {data.length === 0 && (
        <div className="bt-stencil py-6 text-center text-[11px] text-[color:var(--bt-ink-faint)]">
          Sin datos.
        </div>
      )}
    </div>
  );
}
