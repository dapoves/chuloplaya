"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useCart } from "./cart-provider";
import { ChuloButton } from "./chulo-button";
import { ProductImage } from "./product-image";
import { Stepper } from "./stepper";
import { Tag } from "./tag";
import { Icon, categoryIcon, type IconName } from "../_icons/icon";
import { calcUnit, formatEur, perHourRate } from "../_lib/pricing";
import { DURATIONS, type DurationId, type CartItem } from "../_lib/cart-types";

export type ProductLite = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  tag?: string | null;
  disponible?: number | null;
};

type Mode = "sheet" | "page";

export function ProductSheet({
  product,
  mode,
}: {
  product: ProductLite;
  mode: Mode;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [dur, setDur] = useState<DurationId>("dia");
  const [qty, setQty] = useState(1);
  const [hours, setHours] = useState(2);

  const unit = calcUnit(product.precio, dur, hours);
  const total = Math.round(unit * qty * 10) / 10;

  const [closing, setClosing] = useState(false);

  const close = () => {
    if (mode === "sheet") {
      setClosing(true);
      setTimeout(() => router.back(), 250);
    } else {
      router.push("/catalogo");
    }
  };

  const handleAdd = () => {
    const item: CartItem = {
      productId: product.id,
      slug: product.slug,
      nombre: product.nombre,
      categoria: product.categoria,
      base: product.precio,
      dur,
      hours,
      qty,
      unit,
    };
    addItem(item);
    close();
  };

  const iconName: IconName = categoryIcon(product.categoria);

  const body = (
    <div
      style={{
        background: "var(--cp-surface)",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: mode === "sheet" ? "90vh" : "100vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.22)",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
      }}
      className={mode === "page" ? "cp-anim-slide-up" : undefined}
    >
      {/* Grabber */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 40,
            height: 5,
            borderRadius: 999,
            background: "var(--cp-line)",
          }}
        />
      </div>
      {/* Close */}
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 3,
          width: 34,
          height: 34,
          borderRadius: 999,
          border: "none",
          background: "rgba(14,42,56,0.06)",
          color: "var(--cp-ink)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="close" size={18} stroke={2.2} />
      </button>

      <div style={{ overflowY: "auto", padding: "22px 20px 8px" }}>
        <ProductImage icon={iconName} height={184} hero />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              className="cp-display"
              style={{
                fontSize: 26,
                color: "var(--cp-ink)",
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {product.nombre}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 5,
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: "var(--cp-primary)",
                }}
              >
                {product.precio}€
              </span>
              <span style={{ fontSize: 13.5, color: "var(--cp-ink-faint)" }}>
                / día completo
              </span>
            </div>
          </div>
          {product.tag && <Tag>{product.tag}</Tag>}
        </div>
        {product.descripcion && (
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.5,
              color: "var(--cp-ink-soft)",
              margin: "12px 0 0",
            }}
          >
            {product.descripcion}
          </p>
        )}

        {/* Selector de duración */}
        <div style={{ marginTop: 22 }}>
          <FieldLabel icon="clock">Duración del alquiler</FieldLabel>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 10,
            }}
          >
            {DURATIONS.map((d) => {
              const active = dur === d.id;
              const price = calcUnit(product.precio, d.id, hours);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDur(d.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    cursor: "pointer",
                    padding: "13px 15px",
                    borderRadius: "var(--cp-btn-radius)",
                    textAlign: "left",
                    background: active ? "var(--cp-primary-10)" : "var(--cp-bg)",
                    border: `2px solid ${active ? "var(--cp-primary)" : "transparent"}`,
                    transition: "border-color .2s ease-out, background .2s ease-out",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: `2px solid ${active ? "var(--cp-primary)" : "var(--cp-ink-faint)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {active && (
                      <div
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 999,
                          background: "var(--cp-primary)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: "var(--cp-ink)",
                      }}
                    >
                      {d.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--cp-ink-soft)",
                      }}
                    >
                      {d.sub}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: active ? "var(--cp-primary)" : "var(--cp-ink)",
                    }}
                  >
                    {d.perHour
                      ? `${perHourRate(product.precio)}€/h`
                      : `${price}€`}
                  </div>
                </button>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {dur === "horas" && (
              <motion.div
                key="hours-picker"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                    padding: "12px 15px",
                    background: "var(--cp-bg)",
                    borderRadius: "var(--cp-btn-radius)",
                  }}
                >
                  <span
                    style={{ fontWeight: 600, fontSize: 14.5, color: "var(--cp-ink)" }}
                  >
                    ¿Cuántas horas?
                  </span>
                  <Stepper value={hours} min={1} max={9} onChange={setHours} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cantidad */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 18,
            paddingBottom: 4,
          }}
        >
          <FieldLabel icon="bag">Cantidad</FieldLabel>
          <Stepper value={qty} min={1} max={9} onChange={setQty} />
        </div>
      </div>

      <div
        style={{
          padding: "14px 18px 30px",
          background: "var(--cp-surface)",
          borderTop: "1px solid var(--cp-line)",
        }}
      >
        <ChuloButton full onClick={handleAdd}>
          Añadir ·{" "}
          <motion.span
            key={total}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {formatEur(total)}
          </motion.span>
        </ChuloButton>
      </div>
    </div>
  );

  if (mode === "page") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--cp-bg)",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <motion.button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(8,24,32,0.42)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          cursor: "pointer",
        }}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: closing ? "100%" : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        style={{ position: "relative", width: "100%" }}
      >
        {body}
      </motion.div>
    </div>
  );
}

function FieldLabel({
  icon,
  children,
}: {
  icon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      {icon && <Icon name={icon} size={17} color="var(--cp-ink-soft)" />}
      <span
        style={{
          fontWeight: 700,
          fontSize: 14.5,
          color: "var(--cp-ink)",
          letterSpacing: "0.01em",
        }}
      >
        {children}
      </span>
    </div>
  );
}
