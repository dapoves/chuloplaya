"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ChuloButton } from "../_components/chulo-button";
import { FooterBar } from "../_components/footer-bar";
import { ScreenShell } from "../_components/screen-shell";
import { TopBar } from "../_components/top-bar";
import { useCart } from "../_components/cart-provider";
import { Icon, type IconName } from "../_icons/icon";
import { DURATIONS, type CartItem } from "../_lib/cart-types";
import { formatEur } from "../_lib/pricing";
import { placeOrder } from "../_actions/place-order";

const DELIVERY_STORAGE_KEY = "chuloplaya.delivery.v1";

type DeliveryData = {
  method: "gps" | "manual";
  spot: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  lat: number | null;
  lng: number | null;
};

function durLabel(item: CartItem) {
  const d = DURATIONS.find((x) => x.id === item.dur) ?? DURATIONS[1];
  if (d.perHour) return `${item.hours} h`;
  return d.label;
}

export function ConfirmClient() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [delivery, setDelivery] = useState<DeliveryData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDelivery(JSON.parse(raw) as DeliveryData);
      }
    } catch {
      // ignore
    }
  }, []);

  // Solo redirigir al catálogo si el carrito está vacío Y el pedido NO acaba de enviarse.
  useEffect(() => {
    if (!submitted && items.length === 0) router.replace("/catalogo");
  }, [items.length, router, submitted]);

  if (!delivery) return null;

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    const res = await placeOrder({
      name: delivery.name,
      phone: delivery.phone,
      email: delivery.email,
      notes: delivery.notes,
      method: delivery.method,
      spot: delivery.spot,
      lat: delivery.lat,
      lng: delivery.lng,
      items: items.map((it) => ({
        productId: it.productId,
        cantidad: it.qty,
        dur: it.dur,
        hours: it.hours,
      })),
    });
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error);
      return;
    }
    // Guardar info para la pantalla "enviado" y opcional sign-up.
    try {
      sessionStorage.setItem(
        "chuloplaya.justPlaced.v1",
        JSON.stringify({
          orderId: res.orderId,
          isAnonymous: res.isAnonymous,
          email: delivery.email,
        })
      );
    } catch {
      // ignore
    }
    // Marcar como enviado ANTES de clear() para que el useEffect defensivo
    // no redirija al catálogo cuando el carrito queda vacío.
    setSubmitted(true);
    clear();
    router.replace("/pedido/enviado");
  };

  return (
    <ScreenShell>
      <TopBar title="Confirmar pedido" />

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 24px" }}>
        {/* Card entrega */}
        <Card className="cp-anim-list-item" index={0}>
          <RowLine
            icon="pin"
            title={
              delivery.method === "gps"
                ? "Mi ubicación (GPS)"
                : delivery.spot || "Tu sitio"
            }
            sub="Playa del Puerto de Sagunto · València"
          />
          <Divider />
          <RowLine
            icon="user"
            title={delivery.name || "Tú"}
            sub={delivery.phone || "Sin teléfono"}
          />
          <Divider />
          <RowLine
            icon="clock"
            title="Entrega estimada"
            sub="En 10 – 15 min a tu sombrilla"
            accent
          />
        </Card>

        <div className="cp-anim-list-item" style={{ marginTop: 18, "--i": 1 } as React.CSSProperties}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name="bag" size={17} color="var(--cp-ink-soft)" />
            <span
              style={{
                fontWeight: 700,
                fontSize: 14.5,
                color: "var(--cp-ink)",
              }}
            >
              Tu pedido
            </span>
          </div>
          <Card style={{ marginTop: 10 }}>
            {items.map((item, i) => (
              <div key={`${item.productId}-${i}`}>
                {i > 0 && <Divider />}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "4px 0",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      textAlign: "center",
                      fontWeight: 800,
                      color: "var(--cp-primary)",
                      fontSize: 15,
                    }}
                  >
                    {item.qty}×
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: "var(--cp-ink)",
                      }}
                    >
                      {item.nombre}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--cp-ink-soft)",
                      }}
                    >
                      {durLabel(item)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14.5,
                      color: "var(--cp-ink)",
                    }}
                  >
                    {formatEur(Math.round(item.unit * item.qty * 10) / 10)}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div
          className="cp-anim-list-item"
          style={{
            marginTop: 18,
            background: "var(--cp-surface)",
            borderRadius: "var(--cp-card-radius)",
            padding: 16,
            boxShadow: "var(--cp-shadow-sm)",
            "--i": 2,
          } as React.CSSProperties}
        >
          <SummaryRow label="Subtotal" value={formatEur(subtotal)} />
          <SummaryRow
            label="Entrega"
            value="Gratis"
            valueColor="var(--cp-coral)"
          />
          <Divider />
          <SummaryRow label="Total" value={formatEur(subtotal)} big />
        </div>

        {error && (
          <p
            key={error}
            className="cp-anim-shake"
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "var(--cp-coral-14)",
              color: "var(--cp-coral)",
              fontWeight: 600,
              fontSize: 13.5,
              borderRadius: "var(--cp-btn-radius)",
            }}
          >
            {error}
          </p>
        )}
      </div>

      <FooterBar>
        <ChuloButton
          variant="accent"
          full
          disabled={submitting}
          onClick={submit}
          leading={
            submitting ? (
              <svg className="cp-anim-spin" width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.4} strokeDasharray="42 14" strokeLinecap="round" />
              </svg>
            ) : (
              <Icon name="check" size={20} stroke={2.6} />
            )
          }
        >
          {submitting
            ? "Enviando…"
            : `Confirmar y pedir · ${formatEur(subtotal)}`}
        </ChuloButton>
      </FooterBar>
    </ScreenShell>
  );
}

function Card({
  children,
  style,
  className,
  index,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--cp-surface)",
        borderRadius: "var(--cp-card-radius)",
        padding: "14px 16px",
        boxShadow: "var(--cp-shadow-sm)",
        ...(index !== undefined ? { "--i": index } : {}),
        ...style,
      } as React.CSSProperties}
    >
      {children}
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

function RowLine({
  icon,
  title,
  sub,
  accent,
}: {
  icon: IconName;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: accent ? "var(--cp-coral-14)" : "var(--cp-primary-10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon
          name={icon}
          size={19}
          color={accent ? "var(--cp-coral)" : "var(--cp-primary)"}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--cp-ink)" }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: accent ? "var(--cp-coral)" : "var(--cp-ink-soft)",
            fontWeight: accent ? 700 : 400,
          }}
        >
          {sub}
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
}: {
  label: string;
  value: string;
  big?: boolean;
  valueColor?: string;
}) {
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
      <span
        className={big ? "cp-display" : undefined}
        style={{
          fontSize: big ? 22 : 14.5,
          fontWeight: big ? 800 : 700,
          color: valueColor ?? (big ? "var(--cp-primary)" : "var(--cp-ink)"),
        }}
      >
        {value}
      </span>
    </div>
  );
}
