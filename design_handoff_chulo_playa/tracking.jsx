// tracking.jsx — live order tracking (the hero moment)

const TRACK_STEPS = [
  { key: 'enviado', title: 'Pedido enviado', short: 'Enviado', sub: '"Esperando a que un chulo de playa lo acepte…', icon: 'receipt' },
  { key: 'aceptado', title: '¡Pedido aceptado!', short: 'Aceptado', sub: 'Dani está preparando tus cosas en el chiringuito.', icon: 'check' },
  { key: 'camino', title: 'Dani va de camino', short: 'En camino', sub: 'Cruzando la arena hacia tu sombrilla.', icon: 'truck' },
  { key: 'entregado', title: '¡Entregado!', short: 'Entregado', sub: 'Todo listo en tu sitio. ¡A disfrutar del día!', icon: 'sun' },
  { key: 'devolucion', title: 'Recogida programada', short: 'Devolución', sub: 'Pasaremos a recoger a las 20:00. Sin prisa.', icon: 'clock' },
];

function TrackingScreen({ theme, cart, data, onAddMore, onNewOrder }) {
  const t = theme;
  const [step, setStep] = React.useState(0);
  const [eta, setEta] = React.useState(13);

  // auto-advance through the live states
  React.useEffect(() => {
    if (step >= 3) return;
    const delays = [3200, 3600, 4200];
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, 3)), delays[step]);
    return () => clearTimeout(id);
  }, [step]);

  // ETA countdown while en route
  React.useEffect(() => {
    if (step !== 2) return;
    const id = setInterval(() => setEta((e) => Math.max(2, e - 1)), 1400);
    return () => clearInterval(id);
  }, [step]);

  const cur = TRACK_STEPS[step];
  const accent = step >= 3 ? t.coral : t.primary;

  return (
    <ScreenShell theme={t}>
      <TopBar theme={t} title="Tu pedido" sub={`#CP-2847 · ${BEACH.spot.split(' · ')[0]}`}
        right={<button onClick={onNewOrder} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: t.surface, boxShadow: t.shadowSm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.ink }}><Icon name="close" size={18} stroke={2.2} /></button>} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 24px' }}>
        {/* HERO status */}
        <div key={step} style={{
          position: 'relative', borderRadius: t.cardRadius + 6, overflow: 'hidden',
          background: step >= 3 ? hexA(t.coral, 0.12) : hexA(t.primary, 0.1),
          padding: '22px 20px', animation: 'cp-pop .4s cubic-bezier(.2,.9,.3,1)',
        }}>
          {t.motif === 'stripes' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><Awning theme={t} height={8} /></div>}
          <HeroArt theme={t} step={step} accent={accent} />
          <div style={{ position: 'relative' }}>
            {step < 3 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: t.surface, padding: '5px 11px', borderRadius: 999, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: accent, animation: 'cp-blink 1.1s infinite' }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: t.ink }}>En curso</span>
              </div>
            )}
            <div style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: t.key === 'lino' ? 34 : 28, color: t.ink, letterSpacing: t.displaySpacing, lineHeight: 1.05 }}>{cur.title}</div>
            <p style={{ fontSize: 15, lineHeight: 1.45, color: t.inkSoft, margin: '8px 0 0', maxWidth: 280 }}>{cur.sub}</p>
            {step === 2 && (
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginTop: 14, background: t.surface, padding: '10px 16px', borderRadius: t.btnRadius, boxShadow: t.shadowSm }}>
                <span style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 30, color: accent, letterSpacing: t.displaySpacing }}>{eta}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: t.inkSoft }}>min para llegar</span>
              </div>
            )}
          </div>
        </div>

        {/* Courier card */}
        {step >= 1 && step <= 3 && (
          <div style={{ marginTop: 14, background: t.surface, borderRadius: t.cardRadius, padding: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: t.shadowSm, animation: 'cp-pop .35s ease' }}>
            <div style={{ width: 50, height: 50, borderRadius: 999, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: t.onPrimary, fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 22 }}>D</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, color: t.ink }}>Dani</div>
              <div style={{ fontSize: 12.5, color: t.inkSoft }}>Tu chulo de playa · ★ 4,9</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <CircleBtn theme={t} icon="phone" />
              <CircleBtn theme={t} icon="info" filled />
            </div>
          </div>
        )}

        {/* Live map while en route */}
        {step === 2 && (
          <div style={{ marginTop: 14, borderRadius: t.cardRadius, overflow: 'hidden', height: 160, position: 'relative', boxShadow: t.shadowSm }}>
            <FauxMap theme={t} />
            <svg viewBox="0 0 380 160" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path id="cp-route" d="M70 120 C 130 90, 180 110, 250 60" stroke={hexA(t.primary, 0.5)} strokeWidth="3" strokeDasharray="3 6" fill="none" strokeLinecap="round" />
              <circle r="7" fill={t.primary} stroke="#fff" strokeWidth="2.5">
                <animateMotion dur="4s" repeatCount="indefinite" path="M70 120 C 130 90, 180 110, 250 60" />
              </circle>
              <g transform="translate(250 60)">
                <circle r="9" fill={t.coral} stroke="#fff" strokeWidth="2.5" />
              </g>
            </svg>
          </div>
        )}

        {/* Timeline */}
        <div style={{ marginTop: 18, background: t.surface, borderRadius: t.cardRadius, padding: '16px 18px', boxShadow: t.shadowSm }}>
          {TRACK_STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const upcoming = i > step;
            const last = i === TRACK_STEPS.length - 1;
            const dotColor = done ? t.primary : active ? (i >= 3 ? t.coral : t.primary) : t.surfaceAlt;
            return (
              <div key={s.key} style={{ display: 'flex', gap: 14, opacity: upcoming ? 0.5 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                    background: dotColor, color: (done || active) ? '#fff' : t.inkFaint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? `0 0 0 5px ${hexA(i >= 3 ? t.coral : t.primary, 0.16)}` : 'none',
                    transition: 'all .3s',
                  }}>
                    <Icon name={done ? 'check' : s.icon} size={16} stroke={2.4} />
                  </div>
                  {!last && <div style={{ width: 2, flex: 1, minHeight: 26, background: done ? t.primary : t.line, transition: 'background .3s' }} />}
                </div>
                <div style={{ paddingBottom: last ? 0 : 16, paddingTop: 4 }}>
                  <div style={{ fontWeight: active ? 800 : 600, fontSize: 15, color: active ? t.ink : (done ? t.ink : t.inkSoft) }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 2 }}>{active ? s.sub : done ? 'Completado' : (s.key === 'devolucion' ? 'Hoy a las 20:00' : 'Pendiente')}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button theme={t} variant="soft" full onClick={onAddMore} leading={<Icon name="plus" size={19} stroke={2.4} />}>Ampliar mi pedido</Button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: t.inkFaint, fontSize: 12.5 }}>
            <Icon name="info" size={14} stroke={2} /> Puedes añadir más cosas mientras dure el alquiler
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function CircleBtn({ theme, icon, filled }) {
  const t = theme;
  return (
    <button style={{
      width: 40, height: 40, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: filled ? t.primary : hexA(t.primary, 0.1), color: filled ? t.onPrimary : t.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
    }}><Icon name={icon} size={19} stroke={2} /></button>
  );
}

// big illustration in the hero, varies by step
function HeroArt({ theme, step, accent }) {
  const t = theme;
  return (
    <div style={{ position: 'absolute', top: -10, right: -6, width: 130, height: 130, opacity: 0.9, pointerEvents: 'none' }}>
      <svg viewBox="0 0 130 130" style={{ width: '100%', height: '100%' }}>
        {step >= 3 ? (
          <g>
            <circle cx="84" cy="40" r="26" fill={hexA(t.accent, 0.9)} />
            {[...Array(8)].map((_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={i} x1={84 + Math.cos(a) * 30} y1={40 + Math.sin(a) * 30} x2={84 + Math.cos(a) * 38} y2={40 + Math.sin(a) * 38} stroke={hexA(t.accent, 0.9)} strokeWidth="4" strokeLinecap="round" />;
            })}
          </g>
        ) : (
          <g>
            <circle cx="92" cy="34" r="20" fill={hexA(accent, 0.18)} />
            <g transform="translate(48 30)" stroke={hexA(accent, 0.7)} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <Icon name={step === 2 ? 'truck' : step === 1 ? 'bag' : 'receipt'} size={56} color={hexA(accent, 0.8)} stroke={3} />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

// ── Confirmation flash (between confirm and tracking) ──
function PlacedScreen({ theme, onDone }) {
  const t = theme;
  React.useEffect(() => { const id = setTimeout(onDone, 1900); return () => clearTimeout(id); }, []);
  return (
    <ScreenShell theme={t} bg={t.primary}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.onPrimary, textAlign: 'center', padding: 30 }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: hexA('#fff', 0.16), display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'cp-pop .5s cubic-bezier(.2,1.2,.3,1)' }}>
          <div style={{ width: 70, height: 70, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.primary }}>
            <Icon name="check" size={40} stroke={3} />
          </div>
        </div>
        <div style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 30, marginTop: 22, letterSpacing: t.displaySpacing }}>¡Pedido enviado!</div>
        <p style={{ fontSize: 15.5, opacity: 0.85, marginTop: 8, maxWidth: 260 }}>Lo estamos mandando al chiringuito de {BEACH.name}.</p>
      </div>
    </ScreenShell>
  );
}

Object.assign(window, { TrackingScreen, PlacedScreen, TRACK_STEPS });
