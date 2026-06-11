// theme.jsx — Chulo Playa visual directions
// Three distinct brand directions the user can switch between live.

const THEMES = {
  // ── Dirección A: Costa — fresco, veraniego, azules de mar + arena + sol ──
  costa: {
    key: 'costa',
    name: 'Costa',
    tagline: 'Fresco y veraniego',
    bg: '#EAF4F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F4ECDC',
    ink: '#0E2A38',
    inkSoft: '#4B6B78',
    inkFaint: '#8AA3AD',
    line: 'rgba(14,42,56,0.10)',
    primary: '#0A6E9E',
    primaryDeep: '#075578',
    onPrimary: '#FFFFFF',
    accent: '#FFC23C',
    onAccent: '#0E2A38',
    coral: '#FF7657',
    cardRadius: 22,
    btnRadius: 16,
    pillRadius: 999,
    display: "'Gabarito', system-ui, sans-serif",
    body: "'Hanken Grotesk', system-ui, sans-serif",
    displayWeight: 800,
    displayTransform: 'none',
    displaySpacing: '-0.02em',
    shadowSm: '0 2px 8px rgba(10,42,60,0.06)',
    shadowMd: '0 10px 30px rgba(10,70,110,0.12)',
    shadowLg: '0 24px 50px rgba(10,70,110,0.18)',
    motif: 'sun',
    statusDark: false,
  },

  // ── Dirección B: Lino — minimalista, mucho blanco, un acento coral ──
  lino: {
    key: 'lino',
    name: 'Lino',
    tagline: 'Minimalista y limpio',
    bg: '#F7F5F1',
    surface: '#FFFFFF',
    surfaceAlt: '#F0EDE6',
    ink: '#16140F',
    inkSoft: '#5C574E',
    inkFaint: '#A39C8F',
    line: 'rgba(22,20,15,0.12)',
    primary: '#16140F',
    primaryDeep: '#000000',
    onPrimary: '#FBFAF7',
    accent: '#E2533B',
    onAccent: '#FFFFFF',
    coral: '#E2533B',
    cardRadius: 10,
    btnRadius: 8,
    pillRadius: 6,
    display: "'Instrument Serif', Georgia, serif",
    body: "'Schibsted Grotesk', system-ui, sans-serif",
    displayWeight: 400,
    displayTransform: 'none',
    displaySpacing: '-0.01em',
    shadowSm: '0 1px 0 rgba(22,20,15,0.05)',
    shadowMd: '0 6px 24px rgba(22,20,15,0.07)',
    shadowLg: '0 18px 44px rgba(22,20,15,0.10)',
    motif: 'line',
    statusDark: false,
  },

  // ── Dirección C: Toldo — retro chiringuito, rayas, nostalgia ──
  toldo: {
    key: 'toldo',
    name: 'Toldo',
    tagline: 'Retro chiringuito',
    bg: '#F6ECD6',
    surface: '#FFFDF7',
    surfaceAlt: '#FBE9D0',
    ink: '#27353B',
    inkSoft: '#5E6E6C',
    inkFaint: '#9AA39C',
    line: 'rgba(39,53,59,0.14)',
    primary: '#C8402F',
    primaryDeep: '#A52F22',
    onPrimary: '#FFF6E9',
    accent: '#1F6E7A',
    onAccent: '#FFF6E9',
    coral: '#E07A3E',
    cardRadius: 18,
    btnRadius: 12,
    pillRadius: 999,
    display: "'Shrikhand', Georgia, serif",
    body: "'Hanken Grotesk', system-ui, sans-serif",
    displayWeight: 400,
    displayTransform: 'none',
    displaySpacing: '0',
    shadowSm: '0 2px 0 rgba(39,53,59,0.08)',
    shadowMd: '0 8px 22px rgba(39,53,59,0.12)',
    shadowLg: '0 18px 40px rgba(39,53,59,0.18)',
    motif: 'stripes',
    statusDark: false,
  },
};

// ── Brand mark: a little sun-over-umbrella, recolored per theme ──
function ChuloMark({ size = 36, theme, style = {} }) {
  const t = theme;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
      {/* sun */}
      <circle cx="24" cy="17" r="8.5" fill={t.accent} />
      {t.motif === 'sun' && [...Array(8)].map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 24 + Math.cos(a) * 11, y1 = 17 + Math.sin(a) * 11;
        const x2 = 24 + Math.cos(a) * 14.5, y2 = 17 + Math.sin(a) * 14.5;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.accent} strokeWidth="2.4" strokeLinecap="round" />;
      })}
      {/* wave / horizon */}
      <path d="M5 36 Q14 31 24 36 T43 36" stroke={t.primary} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M5 42 Q14 37 24 42 T43 42" stroke={t.primary} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

// Wordmark lockup used in headers / splash
function ChuloLogo({ theme, size = 22, stacked = false, mono = false, color }) {
  const t = theme;
  const c = color || (mono ? t.onPrimary : t.ink);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: stacked ? 6 : 10, flexDirection: stacked ? 'column' : 'row' }}>
      <ChuloMark size={size * 1.5} theme={mono ? { ...t, primary: c, accent: t.accent } : t} />
      <div style={{
        fontFamily: t.display, fontWeight: t.displayWeight,
        fontSize: size, lineHeight: 1, color: c,
        letterSpacing: t.displaySpacing, textAlign: stacked ? 'center' : 'left',
      }}>
        Chulo<span style={{ color: t.key === 'lino' ? t.accent : (mono ? c : t.primary) }}> Playa</span>
      </div>
    </div>
  );
}

window.THEMES = THEMES;
window.ChuloMark = ChuloMark;
window.ChuloLogo = ChuloLogo;
