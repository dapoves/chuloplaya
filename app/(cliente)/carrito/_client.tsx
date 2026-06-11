"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { ChuloButton } from "../_components/chulo-button";
import { FooterBar } from "../_components/footer-bar";
import { ProductImage } from "../_components/product-image";
import { ScreenShell } from "../_components/screen-shell";
import { Stepper } from "../_components/stepper";
import { TopBar } from "../_components/top-bar";
import { useCart } from "../_components/cart-provider";
import { Icon, categoryIcon } from "../_icons/icon";
import { DURATIONS, type CartItem } from "../_lib/cart-types";
import { formatEur } from "../_lib/pricing";

function durLabel(item: CartItem) {
  const d = DURATIONS.find((x) => x.id === item.dur) ?? DURATIONS[1];
  if (d.perHour) return `${item.hours} h`;
  return d.label;
}

export function CartClient() {
  const router = useRouter();
  const { items, subtotal, changeQty } = useCart();

  return (
    <ScreenShell>
      <TopBar title="Tu carrito" />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 18px 24px",
        }}
      >
        {items.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.productId}-${item.dur}-${item.hours}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <CartLine
                      item={item}
                      onChange={(v) => changeQty(i, v)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Link
              href="/catalogo"
              style={{
                marginTop: 14,
                width: "100%",
                border: "1.5px dashed var(--cp-line)",
                background: "transparent",
                borderRadius: "var(--cp-btn-radius)",
                padding: 13,
                fontWeight: 700,
                fontSize: 14.5,
                color: "var(--cp-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <Icon name="plus" size={18} stroke={2.4} /> Añadir más productos
            </Link>

            <div
              style={{
                marginTop: 18,
                background: "var(--cp-surface)",
                borderRadius: "var(--cp-card-radius)",
                padding: 16,
                boxShadow: "var(--cp-shadow-sm)",
              }}
            >
              <SummaryRow label="Subtotal" value={formatEur(subtotal)} />
              <SummaryRow
                label="Entrega a tu ubicación"
                value="Gratis"
                valueColor="var(--cp-coral)"
              />
              <Divider />
              <SummaryRow label="Total" value={formatEur(subtotal)} big animated />
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <FooterBar>
          <ChuloButton
            full
            onClick={() => router.push("/ubicacion")}
            trailing={<Icon name="chevron" size={20} stroke={2.4} />}
          >
            Continuar a la entrega
          </ChuloButton>
        </FooterBar>
      )}
    </ScreenShell>
  );
}

function Empty() {
  return (
    <div className="cp-anim-fade-in" style={{ textAlign: "center", padding: "60px 20px" }}>
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 999,
          background: "var(--cp-surface-alt)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
        }}
      >
        <Icon name="bag" size={38} color="var(--cp-ink-faint)" stroke={1.8} />
      </div>
      <div
        className="cp-display"
        style={{ fontSize: 22, marginTop: 18, color: "var(--cp-ink)" }}
      >
        Tu carrito está vacío
      </div>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 14.5, marginTop: 6 }}>
        Añade hamacas, sombrillas o sillas para empezar.
      </p>
      <div style={{ marginTop: 18 }}>
        <Link href="/catalogo" style={{ textDecoration: "none" }}>
          <ChuloButton>Ver productos</ChuloButton>
        </Link>
      </div>
    </div>
  );
}

function CartLine({
  item,
  onChange,
}: {
  item: CartItem;
  onChange: (n: number) => void;
}) {
  const lineTotal = Math.round(item.unit * item.qty * 10) / 10;
  return (
    <div
      style={{
        background: "var(--cp-surface)",
        borderRadius: "var(--cp-card-radius)",
        padding: 10,
        display: "flex",
        gap: 12,
        boxShadow: "var(--cp-shadow-sm)",
      }}
    >
      <div style={{ width: 76, height: 76, flexShrink: 0 }}>
        <ProductImage icon={categoryIcon(item.categoria)} height={76} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontWeight: 700, fontSize: 15.5, color: "var(--cp-ink)" }}
        >
          {item.nombre}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            marginTop: 4,
            padding: "3px 9px",
            background: "var(--cp-bg)",
            borderRadius: 999,
          }}
        >
          <Icon name="clock" size={13} color="var(--cp-ink-soft)" />
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--cp-ink-soft)",
            }}
          >
            {durLabel(item)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <span
            style={{ fontWeight: 800, fontSize: 16, color: "var(--cp-primary)" }}
          >
            {formatEur(lineTotal)}
          </span>
          <Stepper value={item.qty} min={0} max={9} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  big,
  valueColor,
  animated,
}: {
  label: string;
  value: string;
  big?: boolean;
  valueColor?: string;
  animated?: boolean;
}) {
  const Wrapper = animated ? motion.span : "span";
  const animProps = animated
    ? { initial: { scale: 0.95 }, animate: { scale: 1 }, transition: { duration: 0.15 } }
    : {};
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: big ? "2px 0" : "4px 0",
      }}
    >
      <span
        style={{
          fontSize: big ? 17 : 14.5,
          fontWeight: big ? 700 : 500,
          color: big ? "var(--cp-ink)" : "var(--cp-ink-soft)",
        }}
      >
        {label}
      </span>
      <Wrapper
        key={animated ? value : undefined}
        className={big ? "cp-display" : undefined}
        style={{
          fontSize: big ? 22 : 14.5,
          fontWeight: big ? 800 : 700,
          color: valueColor ?? (big ? "var(--cp-primary)" : "var(--cp-ink)"),
          display: "inline-block",
        }}
        {...animProps}
      >
        {value}
      </Wrapper>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--cp-line)",
        margin: "10px 0",
      }}
    />
  );
}
