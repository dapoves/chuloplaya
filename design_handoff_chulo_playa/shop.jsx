// shop.jsx — QR welcome, Catalog, Product sheet

// ─────────────────────────────────────────────────────────────
// QR welcome / splash (landing after scanning the beach QR)
// ─────────────────────────────────────────────────────────────
function QrScreen({ theme, onStart }) {
  const t = theme;
  return (
    <ScreenShell theme={t} bg={t.key === 'lino' ? t.surface : t.bg}>
      {/* decorative top */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {t.motif === 'sun' && (
          <svg viewBox="0 0 402 500" preserveAspectRatio="xMidYMin slice" style={{ position: 'absolute', top: 0, width: '100%' }}>
            <defs><radialGradient id="sky" cx="78%" cy="14%" r="90%">
              <stop offset="0%" stopColor={hexA(t.accent, 0.55)} />
              <stop offset="38%" stopColor={hexA(t.accent, 0.16)} />
              <stop offset="100%" stopColor={hexA(t.primary, 0)} />
            </radialGradient></defs>
            <rect width="402" height="500" fill="url(#sky)" />
            <circle cx="312" cy="92" r="46" fill={hexA(t.accent, 0.9)} />
          </svg>
        )}
        {t.motif === 'stripes' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><Awning theme={t} height={22} /></div>}
        {t.motif === 'line' && <div style={{ position: 'absolute', top: 120, left: 32, right: 32, height: 1, background: t.line }} />}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '78px 30px 30px', position: 'relative' }}>
        <div>
          <ChuloLogo theme={t} size={26} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 26,
            background: t.surface, padding: '7px 13px', borderRadius: 999, boxShadow: t.shadowSm,
          }}>
            <Icon name="qr" size={15} color={t.primary} stroke={2} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: t.inkSoft }}>Código escaneado</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: 24 }}>
          <div style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 46, lineHeight: 1.02, color: t.ink, letterSpacing: t.displaySpacing, textWrap: 'balance' }}>
            La playa,<br />servida.
          </div>
          <p style={{ fontSize: 16.5, lineHeight: 1.45, color: t.inkSoft, marginTop: 16, maxWidth: 290 }}>
            Pide hamacas, sombrillas y sillas desde tu sitio. Te lo llevamos a la arena en minutos.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26, padding: '14px 16px', background: t.surface, borderRadius: t.cardRadius, boxShadow: t.shadowSm }}>
            <div style={{ width: 42, height: 42, borderRadius: t.key === 'lino' ? 8 : 12, background: hexA(t.primary, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="pin" size={22} color={t.primary} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, color: t.ink }}>{BEACH.name}</div>
              <div style={{ fontSize: 13, color: t.inkSoft }}>{BEACH.spot} · {BEACH.city}</div>
            </div>
          </div>
        </div>

        <Button theme={t} full onClick={onStart} trailing={<Icon name="chevron" size={20} stroke={2.4} />}>
          Ver productos
        </Button>
      </div>
    </ScreenShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────────────────────
function CatalogScreen({ theme, cart, cartCount, cartTotalLabel, onOpenProduct, onOpenCart }) {
  const t = theme;
  const [cat, setCat] = React.useState('todos');
  const cats = [{ id: 'todos', label: 'Todo' }, ...CATEGORIES];
  const list = cat === 'todos' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === cat);
  const featured = PRODUCTS.filter((p) => p.tag);

  return (
    <ScreenShell theme={t}>
      {/* Header */}
      <div style={{ flexShrink: 0, paddingTop: 54, background: t.surface, boxShadow: t.shadowSm, position: 'relative', zIndex: 3 }}>
        {t.motif === 'stripes' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><Awning theme={t} height={10} /></div>}
        <div style={{ padding: '8px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ChuloLogo theme={t} size={18} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: t.bg }}>
            <Icon name="pin" size={14} color={t.primary} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: t.inkSoft }}>{BEACH.spot.split(' · ')[0]}</span>
          </div>
        </div>
        {/* category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 18px 14px', scrollbarWidth: 'none' }}>
          {cats.map((c) => (
            <Chip key={c.id} theme={t} active={cat === c.id} onClick={() => setCat(c.id)}
              leading={c.icon ? <Icon name={c.icon} size={16} stroke={2} /> : null}>{c.label}</Chip>
          ))}
        </div>
      </div>

      {/* Scroll body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 18px', paddingBottom: cartCount ? 110 : 28 }}>
        {cat === 'todos' && (
          <div style={{ marginBottom: 22 }}>
            <SectionTitle theme={t} icon="sparkle">Lo más pedido hoy</SectionTitle>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 0 6px', margin: '0 -18px', paddingLeft: 18, paddingRight: 18, scrollbarWidth: 'none' }}>
              {featured.map((p) => (
                <FeaturedCard key={p.id} theme={t} product={p} onClick={() => onOpenProduct(p)} />
              ))}
            </div>
          </div>
        )}

        <SectionTitle theme={t}>{cat === 'todos' ? 'Todo el catálogo' : cats.find((c) => c.id === cat).label}</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          {list.map((p) => (
            <ProductRow key={p.id} theme={t} product={p} qty={qtyInCart(cart, p.id)} onClick={() => onOpenProduct(p)} />
          ))}
        </div>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 16px 26px', zIndex: 5 }}>
          <button onClick={onOpenCart} style={{
            width: '100%', border: 'none', cursor: 'pointer', borderRadius: t.btnRadius + 4,
            background: t.primary, color: t.onPrimary, boxShadow: t.shadowLg,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: t.body, WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon name="bag" size={24} />
              <span style={{ position: 'absolute', top: -7, right: -9, background: t.accent, color: t.onAccent, fontSize: 11, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{cartCount}</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, flex: 1, textAlign: 'left' }}>Ver carrito</span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{cartTotalLabel}</span>
            <Icon name="chevron" size={20} stroke={2.4} />
          </button>
        </div>
      )}
    </ScreenShell>
  );
}

function SectionTitle({ children, theme, icon }) {
  const t = theme;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
      {icon && <Icon name={icon} size={18} color={t.accent === '#FFC23C' ? t.coral : t.primary} stroke={2} />}
      <h2 style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: t.key === 'lino' ? 26 : 21, color: t.ink, margin: 0, letterSpacing: t.displaySpacing }}>{children}</h2>
    </div>
  );
}

function FeaturedCard({ theme, product, onClick }) {
  const t = theme;
  return (
    <button onClick={onClick} style={{
      width: 168, flexShrink: 0, border: 'none', cursor: 'pointer', textAlign: 'left',
      background: t.surface, borderRadius: t.cardRadius, padding: 10, boxShadow: t.shadowSm,
      fontFamily: t.body, WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ position: 'relative' }}>
        <ProductImage icon={product.icon} theme={t} height={104} />
        <div style={{ position: 'absolute', top: 8, left: 8 }}><Tag theme={t}>{product.tag}</Tag></div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: t.ink, marginTop: 9 }}>{product.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 3 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: t.primary }}>{product.base}€</span>
        <span style={{ fontSize: 12.5, color: t.inkFaint }}>/ día</span>
      </div>
    </button>
  );
}

function ProductRow({ theme, product, qty, onClick }) {
  const t = theme;
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
      background: t.surface, borderRadius: t.cardRadius, padding: 10, display: 'flex', gap: 13,
      alignItems: 'center', boxShadow: t.shadowSm, fontFamily: t.body, WebkitTapHighlightColor: 'transparent',
      position: 'relative', boxSizing: 'border-box',
    }}>
      <ProductImage icon={product.icon} theme={t} height={84} size={84} radius={t.cardRadius - 6} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: t.ink }}>{product.name}</span>
          {product.tag && <Tag theme={t}>{product.tag}</Tag>}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.4, color: t.inkSoft, margin: '4px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.desc}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 7 }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: t.primary }}>{product.base}€</span>
          <span style={{ fontSize: 12.5, color: t.inkFaint }}>/ día</span>
        </div>
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: t.key === 'lino' ? 8 : 999, flexShrink: 0,
        background: qty ? t.primary : t.surfaceAlt, color: qty ? t.onPrimary : t.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
        fontWeight: 800, fontSize: 15,
      }}>
        {qty ? qty : <Icon name="plus" size={20} stroke={2.4} />}
      </div>
    </button>
  );
}

function qtyInCart(cart, id) {
  return cart.filter((i) => i.productId === id).reduce((s, i) => s + i.qty, 0);
}

// ─────────────────────────────────────────────────────────────
// Product detail sheet (bottom sheet)
// ─────────────────────────────────────────────────────────────
function ProductSheet({ theme, product, onClose, onAdd }) {
  const t = theme;
  const [dur, setDur] = React.useState('dia');
  const [qty, setQty] = React.useState(1);
  const [hours, setHours] = React.useState(2);
  const unit = priceFor(product.base, dur, hours);
  const total = Math.round(unit * qty * 10) / 10;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(8,24,32,0.42)', backdropFilter: 'blur(2px)', animation: 'cp-fade .2s ease' }} />
      <div style={{
        position: 'relative', background: t.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: '90%', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .28s cubic-bezier(.2,.9,.3,1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.22)', overflow: 'hidden',
      }}>
        {/* grabber + close */}
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ width: 40, height: 5, borderRadius: 999, background: t.line }} />
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, width: 34, height: 34, borderRadius: 999, border: 'none', background: hexA(t.ink, 0.06), color: t.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={18} stroke={2.2} />
        </button>

        <div style={{ overflowY: 'auto', padding: '22px 20px 8px' }}>
          <ProductImage icon={product.icon} theme={t} height={184} hero />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: t.key === 'lino' ? 32 : 26, color: t.ink, margin: 0, letterSpacing: t.displaySpacing, lineHeight: 1.05 }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 20, color: t.primary }}>{product.base}€</span>
                <span style={{ fontSize: 13.5, color: t.inkFaint }}>/ día completo</span>
              </div>
            </div>
            {product.tag && <Tag theme={t}>{product.tag}</Tag>}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5, color: t.inkSoft, margin: '12px 0 0' }}>{product.desc}</p>

          {/* duration selector */}
          <div style={{ marginTop: 22 }}>
            <FieldLabel theme={t} icon="clock">Duración del alquiler</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {DURATIONS.map((d) => {
                const active = dur === d.id;
                const p = priceFor(product.base, d.id, hours);
                return (
                  <button key={d.id} onClick={() => setDur(d.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', cursor: 'pointer',
                    padding: '13px 15px', borderRadius: t.btnRadius, textAlign: 'left', fontFamily: t.body,
                    background: active ? hexA(t.primary, 0.08) : t.bg,
                    border: `2px solid ${active ? t.primary : 'transparent'}`, WebkitTapHighlightColor: 'transparent',
                  }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${active ? t.primary : t.inkFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {active && <div style={{ width: 11, height: 11, borderRadius: 999, background: t.primary }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5, color: t.ink }}>{d.label}</div>
                      <div style={{ fontSize: 12.5, color: t.inkSoft }}>{d.sub}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: active ? t.primary : t.ink }}>
                      {d.perHour ? `${perHourRate(product.base)}€/h` : `${p}€`}
                    </div>
                  </button>
                );
              })}
            </div>
            {dur === 'horas' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: '12px 15px', background: t.bg, borderRadius: t.btnRadius }}>
                <span style={{ fontWeight: 600, fontSize: 14.5, color: t.ink }}>¿Cuántas horas?</span>
                <Stepper theme={t} value={hours} min={1} max={9} onChange={setHours} />
              </div>
            )}
          </div>

          {/* quantity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingBottom: 4 }}>
            <FieldLabel theme={t} icon="bag">Cantidad</FieldLabel>
            <Stepper theme={t} value={qty} min={1} max={9} onChange={setQty} />
          </div>
        </div>

        <FooterBar theme={t} glass={false}>
          <Button theme={t} full onClick={() => onAdd({ productId: product.id, dur, hours, qty, unit })}>
            Añadir · {total}€
          </Button>
        </FooterBar>
      </div>
    </div>
  );
}

function FieldLabel({ children, theme, icon }) {
  const t = theme;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {icon && <Icon name={icon} size={17} color={t.inkSoft} stroke={2} />}
      <span style={{ fontWeight: 700, fontSize: 14.5, color: t.ink, letterSpacing: '0.01em' }}>{children}</span>
    </div>
  );
}

Object.assign(window, { QrScreen, CatalogScreen, ProductSheet, SectionTitle, FieldLabel, qtyInCart });
