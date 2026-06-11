// ui.jsx — shared primitives for Chulo Playa

// ── Button ──
function Button({ children, onClick, theme, variant = 'primary', size = 'lg', full = false, disabled = false, style = {}, leading, trailing }) {
  const t = theme;
  const base = {
    fontFamily: t.body, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: t.btnRadius, display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: 9, transition: 'transform .12s ease, filter .15s ease, background .15s',
    width: full ? '100%' : 'auto', opacity: disabled ? 0.45 : 1,
    fontSize: size === 'lg' ? 17 : size === 'sm' ? 14 : 16,
    padding: size === 'lg' ? '16px 22px' : size === 'sm' ? '9px 14px' : '13px 18px',
    letterSpacing: '0.01em', WebkitTapHighlightColor: 'transparent',
  };
  const variants = {
    primary: { background: t.primary, color: t.onPrimary, boxShadow: t.shadowMd },
    accent: { background: t.accent, color: t.onAccent, boxShadow: t.shadowMd },
    soft: { background: t.surfaceAlt, color: t.ink },
    outline: { background: 'transparent', color: t.ink, boxShadow: `inset 0 0 0 1.5px ${t.line}` },
    ghost: { background: 'transparent', color: t.primary },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {leading}{children}{trailing}
    </button>
  );
}

// ── Quantity stepper ──
function Stepper({ value, onChange, theme, min = 0, max = 9 }) {
  const t = theme;
  const btn = (dir, icon, dis) => (
    <button
      onClick={() => !dis && onChange(value + dir)}
      style={{
        width: 34, height: 34, borderRadius: t.key === 'lino' ? 7 : 999, border: 'none',
        background: dis ? t.surfaceAlt : t.primary, color: dis ? t.inkFaint : t.onPrimary,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dis ? 'default' : 'pointer',
        transition: 'background .15s', flexShrink: 0,
      }}
    >
      <Icon name={icon} size={18} stroke={2.4} />
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {btn(-1, 'minus', value <= min)}
      <div style={{ fontFamily: t.body, fontWeight: 700, fontSize: 18, color: t.ink, minWidth: 18, textAlign: 'center' }}>{value}</div>
      {btn(1, 'plus', value >= max)}
    </div>
  );
}

// ── Illustrated product tile (stylized placeholder, recolors per theme) ──
function ProductImage({ icon, theme, size = '100%', height = 132, radius, rounded = true, hero = false }) {
  const t = theme;
  const r = radius != null ? radius : t.cardRadius;
  const tint = {
    sillas: t.primary, sombrillas: t.accent, hamacas: t.coral, extras: t.accent,
  };
  // backdrop per theme motif
  let backdrop;
  if (t.motif === 'stripes') {
    backdrop = `repeating-linear-gradient(120deg, ${t.surface} 0 16px, ${hexA(t.accent, 0.16)} 16px 32px)`;
  } else if (t.motif === 'line') {
    backdrop = t.surfaceAlt;
  } else {
    backdrop = `radial-gradient(120% 90% at 78% 18%, ${hexA(t.accent, 0.28)} 0%, ${hexA(t.primary, 0.10)} 45%, ${t.surfaceAlt} 100%)`;
  }
  const big = hero ? 96 : 56;
  return (
    <div style={{
      width: size, height, borderRadius: r, background: backdrop, position: 'relative',
      overflow: 'hidden', flexShrink: 0,
      border: t.motif === 'line' ? `1px solid ${t.line}` : 'none',
    }}>
      {/* sun + horizon, hidden on minimalist */}
      {t.motif !== 'line' && (
        <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <circle cx="158" cy="34" r="20" fill={hexA(t.accent, t.motif === 'stripes' ? 0.9 : 0.85)} />
          <path d="M0 112 Q40 100 80 110 T160 110 T240 110 V140 H0 Z" fill={hexA(t.primary, 0.12)} />
        </svg>
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tint[null] }}>
        <div style={{ color: t.motif === 'line' ? t.ink : t.ink, opacity: t.motif === 'line' ? 0.85 : 0.92 }}>
          <Icon name={icon} size={big} stroke={1.6} />
        </div>
      </div>
    </div>
  );
}

// ── Pill / chip ──
function Chip({ children, active, onClick, theme, leading }) {
  const t = theme;
  return (
    <button onClick={onClick} style={{
      fontFamily: t.body, fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
      padding: '9px 15px', borderRadius: t.pillRadius, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      border: active ? 'none' : `1.5px solid ${t.line}`,
      background: active ? t.primary : t.surface,
      color: active ? t.onPrimary : t.inkSoft,
      transition: 'all .15s', WebkitTapHighlightColor: 'transparent',
    }}>{leading}{children}</button>
  );
}

// ── Tag (small label) ──
function Tag({ children, theme, tone = 'accent' }) {
  const t = theme;
  const bg = tone === 'accent' ? hexA(t.accent, t.key === 'lino' ? 1 : 0.92) : hexA(t.primary, 0.1);
  const col = tone === 'accent' ? t.onAccent : t.primary;
  return (
    <span className="cp-tag" style={{
      fontFamily: t.body, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
      textTransform: 'uppercase', padding: '4px 9px', borderRadius: t.key === 'lino' ? 4 : 999,
      background: bg, color: col,
    }}>{children}</span>
  );
}

// ── Striped awning ribbon (toldo motif) ──
function Awning({ theme, height = 16 }) {
  const t = theme;
  return (
    <div style={{ height, width: '100%', display: 'flex', overflow: 'hidden' }}>
      {[...Array(16)].map((_, i) => (
        <div key={i} style={{ flex: 1, background: i % 2 ? t.primary : t.surface, borderBottom: i % 2 ? 'none' : `1px solid ${t.line}` }} />
      ))}
    </div>
  );
}

// hex with alpha
function hexA(hex, a) {
  if (!hex || hex[0] !== '#') return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// ── Screen chrome ──
// Top bar that clears the dynamic island. variant: 'plain' | 'onColor'
function TopBar({ theme, title, onBack, right, onColor = false, sub, compact = false }) {
  const t = theme;
  const fg = onColor ? t.onPrimary : t.ink;
  const iconBtn = (icon, fn, key) => (
    <button key={key} onClick={fn} style={{
      width: 38, height: 38, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: onColor ? hexA('#ffffff', 0.18) : t.surface,
      color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: onColor ? 'none' : t.shadowSm, flexShrink: 0, WebkitTapHighlightColor: 'transparent',
    }}>{icon}</button>
  );
  return (
    <div style={{
      paddingTop: 56, paddingLeft: 18, paddingRight: 18, paddingBottom: compact ? 8 : 12,
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      {onBack ? iconBtn(<Icon name="back" size={20} stroke={2.2} />, onBack, 'b') : <div style={{ width: 38 }} />}
      <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
        {title && <div style={{ fontFamily: t.body, fontWeight: 700, fontSize: 16.5, color: fg, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>}
        {sub && <div style={{ fontFamily: t.body, fontWeight: 500, fontSize: 12.5, color: onColor ? hexA('#fff', 0.8) : t.inkSoft, marginTop: 1 }}>{sub}</div>}
      </div>
      {right || <div style={{ width: 38 }} />}
    </div>
  );
}

// Sticky footer action bar (clears home indicator)
function FooterBar({ children, theme, glass = true }) {
  const t = theme;
  return (
    <div style={{
      flexShrink: 0, padding: '14px 18px 30px',
      background: glass ? hexA(t.bg, 0.86) : t.bg,
      backdropFilter: glass ? 'blur(14px)' : 'none', WebkitBackdropFilter: glass ? 'blur(14px)' : 'none',
      borderTop: `1px solid ${t.line}`,
    }}>{children}</div>
  );
}

// Full-height screen column
function ScreenShell({ children, theme, bg }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: bg || theme.bg, fontFamily: theme.body, color: theme.ink,
      position: 'relative', overflow: 'hidden',
    }}>{children}</div>
  );
}

Object.assign(window, { Button, Stepper, ProductImage, Chip, Tag, Awning, hexA, TopBar, FooterBar, ScreenShell });
