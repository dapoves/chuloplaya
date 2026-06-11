# Handoff: Chulo Playa — Web Cliente

## Visión general

Chulo Playa es una aplicación móvil-web que permite a los clientes de playa alquilar sillas, sombrillas y hamacas desde su sitio en la arena, escaneando un código QR. El repartidor ("chulo de playa") les lleva el material directamente. El pago es **siempre en persona**, en el momento de la entrega.

Este paquete documenta la **Web Cliente**: el flujo completo desde el QR hasta el seguimiento del pedido en tiempo real.

---

## Sobre los archivos de diseño

Los archivos incluidos (`.html` + `.jsx`) son **prototipos de referencia de diseño** creados en HTML/React. Son mocks de alta fidelidad con interacciones reales, pensados para comunicar el aspecto, el comportamiento y el flujo exactos que debe tener la aplicación.

**La tarea del desarrollador es recrear estas pantallas en el entorno de la app real** (React Native, Next.js, etc.) usando sus librerías y patrones existentes — no transplantar este código directamente a producción.

Para ver el prototipo en acción: abrir `Chulo Playa.html` en un navegador.

---

## Fidelidad

**Alta fidelidad (hi-fi).** Los mocks son pixel-perfect: colores exactos, tipografías reales (Google Fonts), espaciado medido, animaciones funcionales e interacciones completas. El desarrollador debe reproducir la UI con fidelidad visual alta usando el sistema de diseño de la app.

---

## Flujo de pantallas

```
QR Splash → Catálogo → [Sheet de producto] → Carrito → Ubicación → Confirmación → [Flash pedido enviado] → Seguimiento
```

---

## Pantallas

### 1. QR Splash (`QrScreen`)

**Propósito:** Primera pantalla al escanear el QR de la sombrilla. Orienta al usuario sobre dónde está y qué puede pedir.

**Layout:**
- Fondo decorativo según el tema (sol/rayas/línea) — ver sección Temas
- `padding: 78px 30px 30px` (top despeja dynamic island)
- 3 zonas verticales: logo + badge QR escaneado | headline + descripción + tarjeta de ubicación | CTA principal

**Componentes:**
- **Logo Chulo Playa:** ícono sol+olas + wordmark. Tamaño `26px`
- **Badge "Código escaneado":** pill blanco con icono QR y texto `12.5px` semibold, sombra suave
- **Headline:** `"La playa, servida."` — fuente display, `46px`, `line-height: 1.02`, `text-wrap: balance`
- **Subtítulo:** `16.5px`, `line-height: 1.45`, color `inkSoft`
- **Tarjeta de ubicación:** fondo `surface`, `border-radius: cardRadius`, `padding: 14px 16px`. Icono pin + nombre de playa + spot actual
- **Botón CTA:** primario, ancho completo, `"Ver productos"` con chevron trailing

**Interacción:** tap en CTA → navega a Catálogo con animación `translateX(34px → 0)`

---

### 2. Catálogo (`CatalogScreen`)

**Propósito:** Browse de productos. Primera pantalla de compra.

**Layout:**
- Header fijo (no scrollea): logo + chip de ubicación + chips de categoría (scroll horizontal)
- Body scrolleable: sección "Lo más pedido hoy" (cards horizontales) + grid vertical de productos
- Barra de carrito flotante (aparece cuando `cartCount > 0`)

**Header:**
- `padding-top: 54px` (status bar)
- Logo izquierda, pill de ubicación (sombrilla actual) derecha
- Chips de categoría: `Todo | Sillas | Sombrillas | Hamacas | Extras`
  - Chip activo: fondo `primary`, texto `onPrimary`
  - Chip inactivo: borde `1.5px solid line`, texto `inkSoft`

**FeaturedCard (tarjetas destacadas):**
- Ancho fijo `168px`, scroll horizontal
- Imagen de producto `104px` alto + badge "Top ventas"
- Nombre `700 15px` + precio `800 16px primary`

**ProductRow (lista vertical):**
- Imagen `84×84px` + nombre + descripción (2 líneas clamp) + precio
- Badge contador circular derecha (vacío = `+`, con items = número en `primary`)

**Barra de carrito flotante:**
- `position: absolute`, `bottom: 0`, `padding: 0 16px 26px`
- Fondo `primary`, texto `onPrimary`, sombra `shadowLg`
- Icono bag + badge de cantidad (`accent`) + label "Ver carrito" + total + chevron

---

### 3. Sheet de producto (`ProductSheet`)

**Propósito:** Detalle de producto. Selector de duración y cantidad. Se abre por encima del catálogo.

**Layout:**
- Overlay con backdrop blur `rgba(8,24,32,0.42)`, tap fuera = cerrar
- Sheet anclado al bottom, `border-top-radius: 28px`, `max-height: 90%`
- Grabber visible `40×5px`, botón close `34px` top-right

**Contenido (scrolleable):**
- Imagen hero `184px` alto
- Nombre en display `26-32px` + precio base + tag si existe
- Descripción `14.5px` color `inkSoft`
- Selector de duración: 3 opciones radio-style (Medio día / Día completo / Por horas)
  - Activo: borde `2px solid primary`, fondo `hexA(primary, 0.08)`
  - Precio calculado a la derecha de cada opción
  - Si "Por horas": aparece stepper inline para elegir `1–9 horas`
- Stepper de cantidad (`1–9`)

**Footer del sheet:**
- Botón primario ancho completo: `"Añadir · {total}€"`
- Padding `14px 18px 30px` (home indicator)

**Lógica de precios:**
```
Medio día:     base × 0.6
Día completo:  base × 1.0
Por horas:     (base / 6) × horas
```

---

### 4. Carrito (`CartScreen`)

**Propósito:** Revisión del pedido antes de continuar.

**Layout:**
- TopBar con back + título "Tu carrito"
- Lista scrolleable de items
- Resumen de costes
- Footer con CTA

**Item del carrito:**
- Card `surface`, imagen `76×76px`, nombre bold, chip duración con icono reloj
- Precio total a la izquierda, stepper (min=0, elimina el item) a la derecha

**Botón "Añadir más productos":** dashed border, primario ghost, icono `+`

**Resumen:**
- "Subtotal → X€"
- "Entrega a tu ubicación → Gratis" (color `coral`)
- Separador
- "Total → X€" (fuente display, `22px 800`)

**Estado vacío:** ilustración + "Tu carrito está vacío" + botón "Ver productos"

**Footer CTA:** `"Continuar a la entrega"` con chevron — aparece solo si `cartCount > 0`

---

### 5. Ubicación y datos de contacto (`LocationScreen`)

**Propósito:** Capturar dónde entregar y datos del cliente.

**Layout:**
- TopBar con back + título "¿Dónde lo dejamos?"
- Toggle GPS / Manual
- Mapa o campo de texto condicional
- Sección "Tus datos"
- Footer con CTA (deshabilitado hasta formulario válido)

**Toggle de método:**
- Segmented control 2 opciones: "Mi ubicación" (icono nav) | "Indicar sitio" (icono edit)
- Activo: fondo `surface` + sombra; inactivo: transparente

**Modo GPS:**
- Mapa SVG ilustrativo `188px` alto con pin animado en posición detectada
- Overlay inferior: icono nav coral + "Ubicación detectada" + nombre de playa + distancia

**Modo manual:**
- Campo de texto con placeholder `"Ej: Sombrilla 42, fila 3"`
- Texto de ayuda `12.5px inkFaint` bajo el campo

**Campos de datos:**
- Nombre (requerido)
- Teléfono — type `tel` (requerido)
- Notas para el repartidor (opcional)
- Cada campo: altura `52px`, icono leading, focus ring `2px solid primary`

**CTA:** habilitado solo si `name + phone + (gps | spot)` están rellenos

---

### 6. Confirmación (`ConfirmScreen`)

**Propósito:** Revisión final antes de enviar el pedido.

**Layout:**
- TopBar "Confirmar pedido"
- Card de entrega (pin + usuario + ETA)
- Card del pedido (lista de items)
- Resumen de costes
- Footer CTA de confirmación

**Card de entrega:**
- 3 filas `RowLine`: ubicación | nombre+teléfono | ETA estimado
- ETA: `"En 10 – 15 min a tu sombrilla"`, color `coral`, icono reloj
- Icono en chip circular `38px`, fondo `hexA(primary, 0.1)` o `hexA(coral, 0.14)` para ETA

**Card del pedido:**
- Por cada item: `qty ×` en `primary bold` + nombre + duración + precio

**Resumen de costes:**
- Igual que en Carrito (sin sección de método de pago — pago siempre en persona)

**Footer CTA:**
- Variante `accent`, con icono check leading
- Texto: `"Confirmar y pedir · {total}€"`

---

### 7. Flash pedido enviado (`PlacedScreen`)

**Propósito:** Confirmación visual rápida. Dura ~1,9 segundos y avanza automáticamente a Seguimiento.

**Layout:**
- Fondo `primary` a pantalla completa
- Centro: icono check en círculo blanco `70px` animado (`cp-pop`)
- Título `"¡Pedido enviado!"` fuente display blanco `30px`
- Subtítulo con nombre de playa

---

### 8. Seguimiento (`TrackingScreen`)

**Propósito:** La pantalla estrella. Muestra el estado en tiempo real del pedido.

**Estados del pedido (se avanza automáticamente en el prototipo):**

| # | key | Título | Sub |
|---|-----|--------|-----|
| 0 | enviado | Pedido enviado | Esperando que el chiringuito lo acepte… |
| 1 | aceptado | ¡Pedido aceptado! | Dani está preparando tus cosas |
| 2 | camino | Dani va de camino | Cruzando la arena hacia tu sombrilla |
| 3 | entregado | ¡Entregado! | Todo listo en tu sitio |
| 4 | devolucion | Recogida programada | Pasaremos a recoger a las 20:00 |

**Hero card:**
- Fondo `hexA(primary, 0.1)` (o `coral` en estado entregado)
- Badge "En curso" con punto parpadeante animado (oculto en estado ≥3)
- Título estado en display font `28-34px`
- Subtítulo del estado
- **Contador ETA** (solo en estado `camino`): número grande display + "min para llegar"
  - Descuenta 1 cada ~1.4s en el prototipo

**Card del repartidor** (estados 1–3):
- Avatar circular con gradiente `primary → accent`, inicial "D"
- Nombre + rating
- Botones circulares: teléfono (soft) + info (filled primary)

**Mapa en vivo** (solo estado `camino`):
- SVG faux-map `160px` alto
- Punto animado en ruta con `<animateMotion>` de 4s loop

**Timeline vertical:**
- 5 pasos, línea vertical entre ellos
- Completado: punto `primary` + icono check + línea `primary`
- Activo: punto `primary`/`coral` + glow `hexA(primary, 0.16)` + texto bold
- Pendiente: punto `surfaceAlt` + opacidad 0.5

**Acciones:**
- Botón "Ampliar mi pedido" (soft) → vuelve al catálogo
- Botón ✕ en TopBar → resetea pedido y vuelve a QR

---

## Interacciones y comportamiento

### Navegación
- Adelante: slide `translateX(34px → 0)` con `opacity 0→1`, duración `340ms`, easing `cubic-bezier(.2,.85,.3,1)`
- Atrás: slide `translateX(-34px → 0)` con `opacity 0→1`, mismos tiempos
- Sheet de producto: sube desde abajo (`translateY(100% → 0)`), `280ms`, `cubic-bezier(.2,.9,.3,1)`
- Overlay del sheet: fade in `200ms`

### Animaciones de estado
- `cp-pop`: aparición de elementos con `scale(.94→1) + opacity(0→1)`, `400ms`
- `cp-blink`: punto de estado activo, parpadeo suave `1.1s infinite`
- Avance auto de estados en seguimiento: delays `3200ms → 3600ms → 4200ms`

### Persistencia
El estado de la app (`screen`, `cart`, `data`) se guarda en `localStorage` con key `chuloplaya.state.v1`. Al recargar, el usuario retoma donde lo dejó.

### Hit targets
Todos los botones táctiles tienen mínimo `38–44px` de altura. Botones principales ≥ `52px`.

### Reducción de movimiento
`@media (prefers-reduced-motion: reduce)` → todas las animaciones se reducen a `0.001s`.

---

## Gestión de estado

```
screen: 'qr' | 'catalog' | 'cart' | 'location' | 'confirm' | 'placed' | 'tracking'
cart: Array<{ productId, dur, hours, qty, unit }>
data: { method: 'gps'|'manual', spot, name, phone, notes }
sheet: Product | null   // producto abierto en el sheet
```

### Operaciones del carrito
- **addToCart:** si el mismo `productId + dur + hours` ya existe → incrementa qty; si no → añade nuevo item
- **changeQty(i, v):** si `v <= 0` → elimina el item; si no → actualiza qty
- **subtotal:** `sum(item.unit × item.qty)` redondeado a 1 decimal

---

## Tokens de diseño — 3 temas

El diseño tiene **3 direcciones visuales** intercambiables. Seleccionar una para producción.

### Tema A: Costa *(recomendado)*
> Fresco y veraniego — azules de mar, arena, sol

| Token | Valor |
|-------|-------|
| `bg` | `#EAF4F7` |
| `surface` | `#FFFFFF` |
| `surfaceAlt` | `#F4ECDC` |
| `ink` | `#0E2A38` |
| `inkSoft` | `#4B6B78` |
| `inkFaint` | `#8AA3AD` |
| `line` | `rgba(14,42,56,0.10)` |
| `primary` | `#0A6E9E` |
| `primaryDeep` | `#075578` |
| `onPrimary` | `#FFFFFF` |
| `accent` | `#FFC23C` |
| `onAccent` | `#0E2A38` |
| `coral` | `#FF7657` |
| `cardRadius` | `22px` |
| `btnRadius` | `16px` |
| `pillRadius` | `999px` |
| `display font` | Gabarito 800 |
| `body font` | Hanken Grotesk |
| `shadowSm` | `0 2px 8px rgba(10,42,60,0.06)` |
| `shadowMd` | `0 10px 30px rgba(10,70,110,0.12)` |
| `shadowLg` | `0 24px 50px rgba(10,70,110,0.18)` |

### Tema B: Lino
> Minimalista y limpio — mucho blanco, acento coral

| Token | Valor |
|-------|-------|
| `bg` | `#F7F5F1` |
| `surface` | `#FFFFFF` |
| `surfaceAlt` | `#F0EDE6` |
| `ink` | `#16140F` |
| `inkSoft` | `#5C574E` |
| `inkFaint` | `#A39C8F` |
| `primary` | `#16140F` |
| `accent` | `#E2533B` |
| `coral` | `#E2533B` |
| `cardRadius` | `10px` |
| `btnRadius` | `8px` |
| `pillRadius` | `6px` |
| `display font` | Instrument Serif 400 |
| `body font` | Schibsted Grotesk |

### Tema C: Toldo
> Retro chiringuito — rayas, nostalgia veraniega

| Token | Valor |
|-------|-------|
| `bg` | `#F6ECD6` |
| `surface` | `#FFFDF7` |
| `surfaceAlt` | `#FBE9D0` |
| `ink` | `#27353B` |
| `inkSoft` | `#5E6E6C` |
| `primary` | `#C8402F` |
| `accent` | `#1F6E7A` |
| `coral` | `#E07A3E` |
| `cardRadius` | `18px` |
| `btnRadius` | `12px` |
| `display font` | Shrikhand 400 |
| `body font` | Hanken Grotesk |

---

## Tipografía

| Rol | Uso | Tamaños usados |
|-----|-----|----------------|
| Display | Headlines, precios totales, logo | 22–46px |
| Body | Todo el resto | 12.5–17px |

**Escala de texto usada:**
- `46px display` — Hero headline (QR Splash)
- `28–34px display` — Estado activo en Tracking
- `26–32px display` — Nombre de producto en sheet
- `22px display 800` — Total en carrito
- `17–18px body 700–800` — Precios, cantidades
- `16–16.5px body 700` — Nombres de producto, CTAs, nav titles
- `15–15.5px body 600–700` — Labels de opciones, nombres en cards
- `14–14.5px body 500–700` — Descripciones, labels de campo
- `13px body 400` — Texto secundario, subtítulos
- `12.5px body 600` — Chips, badges, metadatos
- `11px body 700 uppercase` — Tags ("Top ventas")

---

## Catálogo de productos

| ID | Categoría | Nombre | Precio base/día |
|----|-----------|--------|-----------------|
| `silla-plegable` | sillas | Silla plegable | 4€ |
| `tumbona` | sillas | Tumbona reclinable | 6€ |
| `silla-nino` | sillas | Sillita infantil | 3€ |
| `sombrilla-clasica` | sombrillas | Sombrilla clásica | 5€ |
| `sombrilla-xl` | sombrillas | Sombrilla XL con anclaje | 8€ |
| `parasol` | sombrillas | Parasol toldo | 10€ |
| `hamaca-ind` | hamacas | Hamaca individual | 7€ |
| `hamaca-doble` | hamacas | Hamaca doble | 12€ |
| `nevera` | extras | Neverita con hielo | 6€ |
| `palas` | extras | Set de palas | 3€ |
| `toalla` | extras | Toalla XL | 4€ |

**Productos destacados** (`tag: 'Top ventas'`): Silla plegable, Sombrilla clásica, Hamaca individual

---

## Componentes UI reutilizables

| Componente | Descripción |
|------------|-------------|
| `Button` | 5 variantes: `primary`, `accent`, `soft`, `outline`, `ghost`. 3 tamaños: `sm`, `md`, `lg` |
| `Stepper` | Incrementa/decrementa con botones circulares. min/max configurables |
| `Chip` | Filtro de categoría. Activo/inactivo. Soporte para icono leading |
| `Tag` | Badge pequeño `11px uppercase`. Variante `accent` por defecto |
| `ProductImage` | Placeholder ilustrado que recolorea según el tema activo |
| `TopBar` | Barra de título con back, right action, subtítulo. Altura dinámica con `padding-top: 56px` |
| `FooterBar` | Barra de acción inferior con glassmorphism. `padding-bottom: 30px` para home indicator |
| `ScreenShell` | Wrapper `flex column 100%h` con color de fondo del tema |
| `Field` | Input con icono leading, focus ring animado, label opcional |
| `Awning` | Decoración de rayas verticales del tema Toldo |
| `Icon` | Set completo de iconos SVG inline (sin dependencias) |

---

## Iconos

Set de línea SVG puro, sin librería externa. Iconos disponibles:

`chair` · `umbrella` · `lounger` · `cooler` · `ball` · `towel` · `cart` · `plus` · `minus` · `back` · `close` · `check` · `pin` · `nav` · `clock` · `user` · `phone` · `bag` · `sun` · `truck` · `sparkle` · `qr` · `chevron` · `edit` · `heart` · `info` · `receipt`

Todos usan `stroke`, `fill: none`, `strokeLinecap: round`. Tamaño base `24×24px` viewBox.

---

## Assets

- **Fuentes:** Google Fonts (Gabarito, Hanken Grotesk, Schibsted Grotesk, Instrument Serif, Shrikhand)
- **Imágenes de producto:** No hay fotos reales — los productos usan ilustraciones generadas con SVG/CSS. En producción se deben reemplazar por fotografías reales.
- **Mapa:** Ilustración SVG inline (no usa Google Maps ni librería de mapas). En producción reemplazar con mapa real (Mapbox, Google Maps, etc.)
- **Logo:** SVG inline en el componente `ChuloMark`. No hay archivo de logo externo.

---

## Archivos de diseño

| Archivo | Contenido |
|---------|-----------|
| `Chulo Playa.html` | Punto de entrada. Carga fuentes, estilos globales, animaciones CSS y scripts |
| `theme.jsx` | Tokens de diseño de los 3 temas + componentes `ChuloMark` y `ChuloLogo` |
| `data.jsx` | Catálogo de productos, duraciones, precios, datos de playa e icono SVG set |
| `ui.jsx` | Componentes primitivos: Button, Stepper, Chip, Tag, ProductImage, TopBar, FooterBar, ScreenShell, Field, Awning, Icon, hexA |
| `shop.jsx` | Pantallas: QrScreen, CatalogScreen, ProductSheet + SectionTitle, FieldLabel |
| `checkout.jsx` | Pantallas: CartScreen, LocationScreen, ConfirmScreen + SummaryRow, Field, FauxMap, Card, RowLine |
| `tracking.jsx` | Pantallas: TrackingScreen, PlacedScreen + TRACK_STEPS, HeroArt, CircleBtn |
| `app.jsx` | App principal: máquina de estados, navegación, persistencia localStorage, escala responsive, panel Tweaks |

---

## Preguntas frecuentes para el desarrollador

**¿Cómo funciona el estado de navegación?**
Simple máquina de estados con un string `screen`. No hay router. En producción usar React Navigation / Next.js Router / etc.

**¿Cómo se sabe en qué sombrilla está el cliente?**
El QR de cada sombrilla lleva un parámetro en la URL (ej: `?spot=42&fila=3`). El prototipo tiene el valor hardcodeado en `BEACH.spot`. En producción leer del query string.

**¿Cómo se implementa el seguimiento en tiempo real?**
El prototipo simula los estados con `setTimeout`. En producción usar WebSockets, Server-Sent Events o polling corto desde el backend.

**¿El pago es online?**
No. El pago es siempre en persona, en la entrega. No hay integración de pasarela de pago.

**¿Qué tema usar en producción?**
Los 3 están diseñados para producción. El recomendado es **Costa** (azul marino + arena + sol), que encaja mejor con el concepto de playa fresca y veraniega.
