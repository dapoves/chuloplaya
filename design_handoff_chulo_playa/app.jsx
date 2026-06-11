// app.jsx — Chulo Playa client app: state machine, navigation, tweaks, device frame

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "costa",
  "accent": "#FFC23C",
  "corners": 1,
  "showTags": true
}/*EDITMODE-END*/;

function readableOn(hex) {
  let h = (hex || '#000').slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#0E2A38' : '#FFFFFF';
}

const LS_KEY = 'chuloplaya.state.v1';

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // derive theme from tweaks
  const base = THEMES[tw.direction] || THEMES.costa;
  const theme = React.useMemo(() => ({
    ...base,
    accent: tw.accent || base.accent,
    onAccent: readableOn(tw.accent || base.accent),
    cardRadius: Math.max(2, Math.round(base.cardRadius * tw.corners)),
    btnRadius: Math.max(2, Math.round(base.btnRadius * tw.corners)),
  }), [base, tw.accent, tw.corners]);

  // ── app state ──
  const persisted = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
  }, []);
  const [screen, setScreen] = React.useState(persisted.screen || 'qr');
  const [dir, setDir] = React.useState(1);
  const [cart, setCart] = React.useState(persisted.cart || []);
  const [sheet, setSheet] = React.useState(null); // product object or null
  const [data, setData] = React.useState(persisted.data || { method: 'gps', spot: '', name: '', phone: '', notes: '' });

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ screen, cart, data })); } catch (e) {}
  }, [screen, cart, data]);

  // ── derived ──
  const subtotal = Math.round(cart.reduce((s, i) => s + i.unit * i.qty, 0) * 10) / 10;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── nav ──
  const go = (s, d = 1) => { setDir(d); setScreen(s); };

  // ── cart ops ──
  const addToCart = (item) => {
    setCart((c) => {
      const idx = c.findIndex((x) => x.productId === item.productId && x.dur === item.dur && x.hours === item.hours);
      if (idx >= 0) { const copy = [...c]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty }; return copy; }
      return [...c, item];
    });
    setSheet(null);
  };
  const changeQty = (i, v) => setCart((c) => v <= 0 ? c.filter((_, j) => j !== i) : c.map((x, j) => j === i ? { ...x, qty: v } : x));
  const resetOrder = () => { setCart([]); setData({ method: 'gps', spot: '', name: '', phone: '', notes: '' }); go('qr', -1); };

  // ── device scaling ──
  const W = 402, H = 874;
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 120) / H, (window.innerWidth - 40) / W));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  const anim = dir === 1 ? 'cp-in-right' : 'cp-in-left';

  let body;
  switch (screen) {
    case 'qr': body = <QrScreen theme={theme} onStart={() => go('catalog')} />; break;
    case 'catalog': body = <CatalogScreen theme={theme} cart={cart} cartCount={cartCount} cartTotalLabel={`${subtotal}€`} onOpenProduct={setSheet} onOpenCart={() => go('cart')} />; break;
    case 'cart': body = <CartScreen theme={theme} cart={cart} subtotal={subtotal} onBack={() => go('catalog', -1)} onAddMore={() => go('catalog', -1)} onChangeQty={changeQty} onContinue={() => go('location')} />; break;
    case 'location': body = <LocationScreen theme={theme} data={data} setData={setData} onBack={() => go('cart', -1)} onContinue={() => go('confirm')} />; break;
    case 'confirm': body = <ConfirmScreen theme={theme} cart={cart} data={data} subtotal={subtotal} onBack={() => go('location', -1)} onPlace={() => go('placed')} />; break;
    case 'placed': body = <PlacedScreen theme={theme} onDone={() => go('tracking')} />; break;
    case 'tracking': body = <TrackingScreen theme={theme} cart={cart} data={data} onAddMore={() => go('catalog')} onNewOrder={resetOrder} />; break;
    default: body = <QrScreen theme={theme} onStart={() => go('catalog')} />;
  }

  // apply tags toggle by hiding tags via CSS var? simplest: pass through PRODUCTS unaffected; toggle handled with a class
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '20px 0' }} className={tw.showTags ? '' : 'cp-no-tags'}>
      <div style={{ width: W * scale, height: H * scale, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <IOSDevice width={W} height={H} dark={false}>
            <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.bg }}>
              <div key={screen} style={{ height: '100%', animation: `${anim} .34s cubic-bezier(.2,.85,.3,1)` }}>
                {body}
              </div>
              {sheet && <ProductSheet theme={theme} product={sheet} onClose={() => setSheet(null)} onAdd={addToCart} />}
            </div>
          </IOSDevice>
        </div>
      </div>

      <div style={{ fontFamily: theme.body, fontSize: 12.5, color: '#9aa3ad', textAlign: 'center', letterSpacing: '0.02em' }}>
        Chulo Playa · Web Cliente — dirección <strong style={{ color: '#6b7680' }}>{base.name}</strong> · {base.tagline}
      </div>

      <Tweaks theme={theme} base={base} tw={tw} setTweak={setTweak} />
    </div>
  );
}

function Tweaks({ theme, base, tw, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Dirección visual" />
      <TweakRadio label="Estilo" value={tw.direction}
        options={[{ value: 'costa', label: 'Costa' }, { value: 'lino', label: 'Lino' }, { value: 'toldo', label: 'Toldo' }]}
        onChange={(v) => setTweak({ direction: v, accent: THEMES[v].accent })} />
      <div style={{ fontFamily: theme.body, fontSize: 12.5, color: '#8a93a0', margin: '-2px 2px 4px', lineHeight: 1.4 }}>
        {base.tagline}.
      </div>

      <TweakSection label="Ajustes" />
      <TweakColor label="Color de acento" value={tw.accent}
        options={[base.accent, base.coral, base.primary, '#2ECCB0', '#E2533B']}
        onChange={(v) => setTweak('accent', v)} />
      <TweakSlider label="Esquinas" value={tw.corners} min={0.3} max={1.6} step={0.1}
        onChange={(v) => setTweak('corners', v)} />
      <TweakToggle label='Etiquetas "Top ventas"' value={tw.showTags}
        onChange={(v) => setTweak('showTags', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
