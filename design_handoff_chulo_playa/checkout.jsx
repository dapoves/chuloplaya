// checkout.jsx — Cart, Location, Confirm, Tracking

function prodById(id) { return PRODUCTS.find((p) => p.id === id); }
function durLabel(item) {
  const d = DURATIONS.find((x) => x.id === item.dur);
  if (d.perHour) return `${item.hours} h`;
  return d.label;
}

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────
function CartScreen({ theme, cart, onBack, onAddMore, onChangeQty, onContinue, subtotal }) {
  const t = theme;
  return (
    <ScreenShell theme={t}>
      <TopBar theme={t} title="Tu carrito" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 24px' }}>
        {cart.length === 0 ? (
          <Empty theme={t} onAddMore={onAddMore} />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map((item, i) => {
                const p = prodById(item.productId);
                return (
                  <div key={i} style={{ background: t.surface, borderRadius: t.cardRadius, padding: 10, display: 'flex', gap: 12, boxShadow: t.shadowSm }}>
                    <ProductImage icon={p.icon} theme={t} height={76} size={76} radius={t.cardRadius - 6} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5, color: t.ink }}>{p.name}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, padding: '3px 9px', background: t.bg, borderRadius: 999 }}>
                        <Icon name="clock" size={13} color={t.inkSoft} stroke={2} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: t.inkSoft }}>{durLabel(item)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: t.primary }}>{Math.round(item.unit * item.qty * 10) / 10}€</span>
                        <Stepper theme={t} value={item.qty} min={0} max={9} onChange={(v) => onChangeQty(i, v)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={onAddMore} style={{ marginTop: 14, width: '100%', border: `1.5px dashed ${t.line}`, background: 'transparent', borderRadius: t.btnRadius, padding: '13px', cursor: 'pointer', fontFamily: t.body, fontWeight: 700, fontSize: 14.5, color: t.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="plus" size={18} stroke={2.4} /> Añadir más productos
            </button>

            <div style={{ marginTop: 18, background: t.surface, borderRadius: t.cardRadius, padding: '16px 16px', boxShadow: t.shadowSm }}>
              <SummaryRow theme={t} label="Subtotal" value={`${subtotal}€`} />
              <SummaryRow theme={t} label="Entrega a tu ubicación" value="Gratis" valueColor={t.coral} />
              <div style={{ height: 1, background: t.line, margin: '10px 0' }} />
              <SummaryRow theme={t} label="Total" value={`${subtotal}€`} big />
            </div>
          </>
        )}
      </div>
      {cart.length > 0 && (
        <FooterBar theme={t}>
          <Button theme={t} full onClick={onContinue} trailing={<Icon name="chevron" size={20} stroke={2.4} />}>Continuar a la entrega</Button>
        </FooterBar>
      )}
    </ScreenShell>
  );
}

function Empty({ theme, onAddMore }) {
  const t = theme;
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: 84, height: 84, borderRadius: 999, background: t.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <Icon name="bag" size={38} color={t.inkFaint} stroke={1.8} />
      </div>
      <div style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 22, marginTop: 18, color: t.ink }}>Tu carrito está vacío</div>
      <p style={{ color: t.inkSoft, fontSize: 14.5, marginTop: 6 }}>Añade hamacas, sombrillas o sillas para empezar.</p>
      <div style={{ marginTop: 18 }}><Button theme={t} onClick={onAddMore}>Ver productos</Button></div>
    </div>
  );
}

function SummaryRow({ theme, label, value, big, valueColor }) {
  const t = theme;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: big ? '2px 0' : '4px 0' }}>
      <span style={{ fontSize: big ? 17 : 14.5, fontWeight: big ? 700 : 500, color: big ? t.ink : t.inkSoft }}>{label}</span>
      <span style={{ fontSize: big ? 22 : 14.5, fontWeight: big ? 800 : 700, color: valueColor || (big ? t.primary : t.ink), fontFamily: big ? t.display : t.body, letterSpacing: big ? t.displaySpacing : 0 }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Location & contact
// ─────────────────────────────────────────────────────────────
function LocationScreen({ theme, data, setData, onBack, onContinue }) {
  const t = theme;
  const ready = data.name.trim() && data.phone.trim() && (data.method === 'gps' || data.spot.trim());
  return (
    <ScreenShell theme={t}>
      <TopBar theme={t} title="¿Dónde lo dejamos?" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 24px' }}>
        {/* method toggle */}
        <div style={{ display: 'flex', gap: 8, background: t.surfaceAlt, padding: 4, borderRadius: t.btnRadius + 2 }}>
          {[{ id: 'gps', label: 'Mi ubicación', icon: 'nav' }, { id: 'manual', label: 'Indicar sitio', icon: 'edit' }].map((m) => (
            <button key={m.id} onClick={() => setData({ ...data, method: m.id })} style={{
              flex: 1, padding: '11px', borderRadius: t.btnRadius - 2, border: 'none', cursor: 'pointer', fontFamily: t.body,
              fontWeight: 700, fontSize: 14.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: data.method === m.id ? t.surface : 'transparent', color: data.method === m.id ? t.primary : t.inkSoft,
              boxShadow: data.method === m.id ? t.shadowSm : 'none', transition: 'all .15s',
            }}><Icon name={m.icon} size={17} stroke={2} />{m.label}</button>
          ))}
        </div>

        {data.method === 'gps' ? (
          <div style={{ marginTop: 14, borderRadius: t.cardRadius, overflow: 'hidden', boxShadow: t.shadowSm, position: 'relative', height: 188, background: hexA(t.primary, 0.08) }}>
            <FauxMap theme={t} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, background: hexA(t.surface, 0.92), backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: hexA(t.coral, 0.16), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="nav" size={18} color={t.coral} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.ink }}>Ubicación detectada</div>
                <div style={{ fontSize: 12.5, color: t.inkSoft }}>{BEACH.name} · a 60 m del chiringuito</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <Field theme={t} label="Tu sitio en la arena" icon="pin" placeholder="Ej: Sombrilla 42, fila 3"
              value={data.spot} onChange={(v) => setData({ ...data, spot: v })} />
            <p style={{ fontSize: 12.5, color: t.inkFaint, margin: '8px 4px 0', lineHeight: 1.4 }}>
              Mira el número pintado en el mástil de la sombrilla o cuéntanos una referencia.
            </p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <FieldLabel theme={t} icon="user">Tus datos</FieldLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field theme={t} placeholder="Tu nombre" icon="user" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
            <Field theme={t} placeholder="Teléfono" icon="phone" value={data.phone} onChange={(v) => setData({ ...data, phone: v })} type="tel" />
            <Field theme={t} placeholder="Notas para el repartidor (opcional)" icon="info" value={data.notes} onChange={(v) => setData({ ...data, notes: v })} />
          </div>
        </div>
      </div>
      <FooterBar theme={t}>
        <Button theme={t} full disabled={!ready} onClick={onContinue} trailing={<Icon name="chevron" size={20} stroke={2.4} />}>Revisar pedido</Button>
      </FooterBar>
    </ScreenShell>
  );
}

function Field({ theme, label, placeholder, value, onChange, icon, type = 'text' }) {
  const t = theme;
  const [focus, setFocus] = React.useState(false);
  return (
    <div>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: t.inkSoft, marginBottom: 6, marginLeft: 2 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 52,
        background: t.surface, borderRadius: t.btnRadius, transition: 'box-shadow .15s',
        boxShadow: focus ? `inset 0 0 0 2px ${t.primary}` : `inset 0 0 0 1.5px ${t.line}`,
      }}>
        {icon && <Icon name={icon} size={18} color={focus ? t.primary : t.inkFaint} stroke={2} />}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: t.body, fontSize: 15.5, color: t.ink, minWidth: 0 }} />
      </div>
    </div>
  );
}

function FauxMap({ theme }) {
  const t = theme;
  return (
    <svg viewBox="0 0 380 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="380" height="200" fill={hexA(t.primary, 0.07)} />
      {/* sea */}
      <path d="M0 0 H380 V70 Q300 95 200 80 T0 78 Z" fill={hexA(t.primary, 0.18)} />
      <path d="M0 78 Q120 92 200 80 T380 70 V96 Q260 110 160 98 T0 100 Z" fill={hexA(t.accent, 0.22)} />
      {/* roads */}
      <path d="M40 200 L120 90 M250 200 L210 120 M300 60 L380 130" stroke={hexA(t.ink, 0.1)} strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* pin */}
      <g transform="translate(190 118)">
        <ellipse cx="0" cy="6" rx="14" ry="5" fill={hexA(t.ink, 0.12)} />
        <path d="M0 -34 C-13 -34 -20 -24 -20 -15 C-20 -3 0 8 0 8 C0 8 20 -3 20 -15 C20 -24 13 -34 0 -34Z" fill={t.coral} />
        <circle cx="0" cy="-16" r="6.5" fill="#fff" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Confirm
// ─────────────────────────────────────────────────────────────
function ConfirmScreen({ theme, cart, data, subtotal, onBack, onPlace }) {
  const t = theme;
  return (
    <ScreenShell theme={t}>
      <TopBar theme={t} title="Confirmar pedido" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 24px' }}>
        {/* delivery card */}
        <Card theme={t}>
          <RowLine theme={t} icon="pin" title={data.method === 'gps' ? 'Mi ubicación (GPS)' : data.spot || 'Tu sitio'} sub={`${BEACH.name} · ${BEACH.city}`} />
          <Divider theme={t} />
          <RowLine theme={t} icon="user" title={data.name || 'Tú'} sub={data.phone || 'Sin teléfono'} />
          <Divider theme={t} />
          <RowLine theme={t} icon="clock" title="Entrega estimada" sub="En 10 – 15 min a tu sombrilla" accent />
        </Card>

        <div style={{ marginTop: 18 }}>
          <FieldLabel theme={t} icon="bag">Tu pedido</FieldLabel>
          <Card theme={t} style={{ marginTop: 10 }}>
            {cart.map((item, i) => {
              const p = prodById(item.productId);
              return (
                <React.Fragment key={i}>
                  {i > 0 && <Divider theme={t} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                    <div style={{ width: 30, textAlign: 'center', fontWeight: 800, color: t.primary, fontSize: 15 }}>{item.qty}×</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: t.ink }}>{p.name}</div>
                      <div style={{ fontSize: 12.5, color: t.inkSoft }}>{durLabel(item)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: t.ink }}>{Math.round(item.unit * item.qty * 10) / 10}€</div>
                  </div>
                </React.Fragment>
              );
            })}
          </Card>
        </div>

        <div style={{ marginTop: 18, background: t.surface, borderRadius: t.cardRadius, padding: 16, boxShadow: t.shadowSm }}>
          <SummaryRow theme={t} label="Subtotal" value={`${subtotal}€`} />
          <SummaryRow theme={t} label="Entrega" value="Gratis" valueColor={t.coral} />
          <div style={{ height: 1, background: t.line, margin: '10px 0' }} />
          <SummaryRow theme={t} label="Total" value={`${subtotal}€`} big />
        </div>
      </div>
      <FooterBar theme={t}>
        <Button theme={t} variant="accent" full onClick={onPlace} leading={<Icon name="check" size={20} stroke={2.6} />}>Confirmar y pedir · {subtotal}€</Button>
      </FooterBar>
    </ScreenShell>
  );
}

function Card({ children, theme, style = {} }) {
  return <div style={{ background: theme.surface, borderRadius: theme.cardRadius, padding: '14px 16px', boxShadow: theme.shadowSm, ...style }}>{children}</div>;
}
function Divider({ theme }) { return <div style={{ height: 1, background: theme.line, margin: '10px 0' }} />; }
function RowLine({ theme, icon, title, sub, accent }) {
  const t = theme;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: t.key === 'lino' ? 8 : 11, background: accent ? hexA(t.coral, 0.14) : hexA(t.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={19} color={accent ? t.coral : t.primary} stroke={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: t.ink }}>{title}</div>
        <div style={{ fontSize: 13, color: accent ? t.coral : t.inkSoft, fontWeight: accent ? 700 : 400 }}>{sub}</div>
      </div>
    </div>
  );
}

Object.assign(window, { CartScreen, LocationScreen, ConfirmScreen, Card, Divider, RowLine, SummaryRow, Field, prodById, durLabel });
