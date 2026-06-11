"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ChuloButton } from "../../_components/chulo-button";
import { FauxMap } from "../../_components/faux-map";
import { ScreenShell } from "../../_components/screen-shell";
import { TopBar } from "../../_components/top-bar";
import { Icon, type IconName } from "../../_icons/icon";
import { createRealtimeClient } from "@/lib/supabase/realtime";
import type { Database } from "@/lib/types/database.types";

import { AccountPrompt } from "../../_components/account-prompt";
import { PushPrompt } from "../../_components/push-prompt";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type ItemStatus = Database["public"]["Enums"]["item_status"];

export type TrackingItem = {
  id: string;
  cantidad: number;
  estado: ItemStatus;
  horaDevolucion: string | null;
  productNombre: string;
  productCategoria: string;
  productPrecio: number;
  colaboradorNombre: string | null;
};

type StepKey =
  | "enviado"
  | "aceptado"
  | "camino"
  | "entregado"
  | "devolucion";

function formatHora(raw: string): string {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return raw;
}

function getSteps(colaborador: string | null, horaDevolucion: string | null): Array<{
  key: StepKey;
  title: string;
  sub: string;
  icon: IconName;
}> {
  const nombre = colaborador ?? "tu chulo de playa";
  const horaFmt = horaDevolucion ? formatHora(horaDevolucion) : null;
  return [
    {
      key: "enviado",
      title: "Pedido enviado",
      sub: "Esperando a que un chulo de playa lo acepte…",
      icon: "receipt",
    },
    {
      key: "aceptado",
      title: "¡Pedido aceptado!",
      sub: `${nombre} está preparando tus cosas.`,
      icon: "check",
    },
    {
      key: "camino",
      title: "Va de camino",
      sub: `${nombre} está cruzando la arena hacia tu sombrilla.`,
      icon: "truck",
    },
    {
      key: "entregado",
      title: "¡Entregado!",
      sub: `${nombre} ha dejado todo listo. ¡A disfrutar del día!`,
      icon: "sun",
    },
    {
      key: "devolucion",
      title: "Recogida programada",
      sub: horaFmt
        ? `${nombre} pasará a recoger a las ${horaFmt}.`
        : `${nombre} pasará a recoger cuando termine el alquiler.`,
      icon: "clock",
    },
  ];
}

const STATUS_TO_STEP: Record<ItemStatus, number> = {
  enviado: 0,
  aceptado: 1,
  en_camino: 2,
  entregado: 3,
  pendiente_devolucion: 4,
  devuelto: 4,
  cancelado: 0,
};

/** El paso "del pedido" es el más temprano de todos sus items. */
function deriveStep(items: TrackingItem[]): number {
  if (items.length === 0) return 0;
  return items
    .map((it) => STATUS_TO_STEP[it.estado] ?? 0)
    .reduce((a, b) => Math.min(a, b), 4);
}

export function TrackingLive({
  orderId,
  ubicacionTexto,
  motivoCancelacion,
  initialItems,
}: {
  orderId: string;
  ubicacionTexto: string | null;
  motivoCancelacion: string | null;
  initialItems: TrackingItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<TrackingItem[]>(initialItems);
  const [accountState, setAccountState] = useState<
    null | { isAnonymous: boolean; email: string }
  >(null);

  // Realtime subscription a order_items de este pedido.
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createRealtimeClient();
      if (!active) return;
      const ch = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "order_items",
            filter: `order_id=eq.${orderId}`,
          },
          async (payload) => {
            const id =
              (payload.new as { id?: string })?.id ??
              (payload.old as { id?: string })?.id;
            if (!id) return;

            if (payload.eventType === "DELETE") {
              setItems((cur) => cur.filter((x) => x.id !== id));
              return;
            }

            const { data } = await supabase
              .from("order_items")
              .select(
                "id, cantidad, estado, hora_devolucion, product:products(nombre, categoria, precio), colaborador:profiles!colaborador_asignado_id(display_name)"
              )
              .eq("id", id)
              .maybeSingle();
            if (!data) return;
            const row: TrackingItem = {
              id: data.id,
              cantidad: data.cantidad,
              estado: data.estado,
              horaDevolucion: data.hora_devolucion,
              productNombre: data.product?.nombre ?? "—",
              productCategoria: data.product?.categoria ?? "extras",
              productPrecio: Number(data.product?.precio ?? 0),
              colaboradorNombre: data.colaborador?.display_name ?? null,
            };
            setItems((cur) => {
              const exists = cur.some((x) => x.id === row.id);
              return exists
                ? cur.map((x) => (x.id === row.id ? row : x))
                : [...cur, row];
            });
          }
        )
        .subscribe();
      cleanup = () => {
        supabase.removeChannel(ch);
      };
    })();

    return () => {
      active = false;
      if (cleanup) cleanup();
    };
  }, [orderId]);

  // Leer flag "just placed" para mostrar prompt opcional de crear cuenta.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("chuloplaya.justPlaced.v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        orderId: string;
        isAnonymous: boolean;
        email: string;
      };
      if (parsed.orderId === orderId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAccountState({
          isAnonymous: parsed.isAnonymous,
          email: parsed.email,
        });
      }
    } catch {
      // ignore
    }
  }, [orderId]);

  const step = useMemo(() => deriveStep(items), [items]);
  const colaboradorNombre = useMemo(
    () => items.find((it) => it.colaboradorNombre)?.colaboradorNombre ?? null,
    [items]
  );
  const horaDevolucion = useMemo(
    () => items.find((it) => it.horaDevolucion)?.horaDevolucion ?? null,
    [items]
  );
  const STEPS = useMemo(
    () => getSteps(colaboradorNombre, horaDevolucion),
    [colaboradorNombre, horaDevolucion]
  );
  const cur = STEPS[step];
  const isLate = step >= 3;
  const accentVar = isLate ? "var(--cp-coral)" : "var(--cp-primary)";

  const allCancelled = items.length > 0 && items.every((it) => it.estado === "cancelado");
  const allDevuelto = items.length > 0 && items.every((it) => it.estado === "devuelto" || it.estado === "cancelado");
  const someCancelled = !allCancelled && items.some((it) => it.estado === "cancelado");
  const showCancelBanner = Boolean(motivoCancelacion);

  const subtotal = useMemo(
    () =>
      items.reduce((acc, it) => acc + it.productPrecio * it.cantidad, 0),
    [items]
  );

  const closePrompt = () => {
    try {
      sessionStorage.removeItem("chuloplaya.justPlaced.v1");
    } catch {
      // ignore
    }
    setAccountState(null);
  };

  return (
    <ScreenShell>
      <TopBar
        title="Tu pedido"
        sub={`#${orderId.slice(0, 8).toUpperCase()}${
          ubicacionTexto ? ` · ${ubicacionTexto.split(" · ")[0]}` : ""
        }`}
        onBack={() => router.push("/")}
        right={
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => router.push("/")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: "none",
              background: "var(--cp-surface)",
              boxShadow: "var(--cp-shadow-sm)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cp-ink)",
            }}
          >
            <Icon name="close" size={18} stroke={2.2} />
          </button>
        }
        showBack={false}
      />

      <PushPrompt vapidPublicKey={VAPID_PUBLIC_KEY} />

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 40px" }}>
        {/* Banner motivo cancelación (cuando hay algunos items cancelados, no todos) */}
        {showCancelBanner && someCancelled && (
          <div
            style={{
              marginBottom: 14,
              padding: "12px 14px",
              borderRadius: "var(--cp-card-radius)",
              background: "rgba(220, 38, 38, 0.08)",
              color: "rgb(127, 29, 29)",
              boxShadow: "var(--cp-shadow-sm)",
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}
            >
              Parte del pedido cancelado
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>
              {motivoCancelacion}
            </div>
          </div>
        )}

        {/* HERO — completado */}
        {allDevuelto && !allCancelled ? (
          <div
            className="cp-anim-pop"
            style={{
              position: "relative",
              borderRadius: "calc(var(--cp-card-radius) + 6px)",
              overflow: "hidden",
              background: "var(--cp-primary-10)",
              padding: "22px 20px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "var(--cp-surface)",
                padding: "5px 11px",
                borderRadius: 999,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "var(--cp-primary)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cp-ink)" }}>
                Completado
              </span>
            </div>
            <div
              className="cp-display"
              style={{ fontSize: 28, color: "var(--cp-ink)", lineHeight: 1.05 }}
            >
              ¡Hasta pronto!
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.45,
                color: "var(--cp-ink-soft)",
                margin: "8px 0 0",
                maxWidth: 280,
              }}
            >
              El material ha sido recogido. ¡Esperamos verte de nuevo en la playa!
            </p>
          </div>
        ) : null}

        {/* HERO — sustituido por aviso de cancelación si todos los items están cancelados */}
        {!allDevuelto && allCancelled ? (
          <div
            className="cp-anim-shake"
            style={{
              position: "relative",
              borderRadius: "calc(var(--cp-card-radius) + 6px)",
              overflow: "hidden",
              background: "rgba(220, 38, 38, 0.10)",
              padding: "22px 20px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "var(--cp-surface)",
                padding: "5px 11px",
                borderRadius: 999,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "rgb(220, 38, 38)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--cp-ink)",
                }}
              >
                Cancelado
              </span>
            </div>
            <div
              className="cp-display"
              style={{ fontSize: 26, color: "var(--cp-ink)", lineHeight: 1.1 }}
            >
              Pedido cancelado
            </div>
            {motivoCancelacion ? (
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: "var(--cp-ink-soft)",
                  margin: "10px 0 0",
                }}
              >
                <strong style={{ color: "var(--cp-ink)" }}>Motivo:</strong>{" "}
                {motivoCancelacion}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  color: "var(--cp-ink-soft)",
                  margin: "8px 0 0",
                }}
              >
                Hemos cancelado tu pedido. Contáctanos si crees que es un error.
              </p>
            )}
          </div>
        ) : !allDevuelto ? (
        <div
          key={step}
          className="cp-anim-pop"
          style={{
            position: "relative",
            borderRadius: "calc(var(--cp-card-radius) + 6px)",
            overflow: "hidden",
            background: isLate ? "var(--cp-coral-14)" : "var(--cp-primary-10)",
            padding: "22px 20px",
          }}
        >
          {step < 3 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "var(--cp-surface)",
                padding: "5px 11px",
                borderRadius: 999,
                marginBottom: 12,
              }}
            >
              <span
                className="cp-anim-blink"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: accentVar,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--cp-ink)",
                }}
              >
                En curso
              </span>
            </div>
          )}
          <div
            className="cp-display"
            style={{
              fontSize: 28,
              color: "var(--cp-ink)",
              lineHeight: 1.05,
            }}
          >
            {cur.title}
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.45,
              color: "var(--cp-ink-soft)",
              margin: "8px 0 0",
              maxWidth: 280,
            }}
          >
            {cur.sub}
          </p>
          {step === 2 && (
            <div
              className="cp-anim-pop"
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 6,
                marginTop: 14,
                background: "var(--cp-surface)",
                padding: "10px 16px",
                borderRadius: "var(--cp-btn-radius)",
                boxShadow: "var(--cp-shadow-sm)",
              }}
            >
              <span
                className="cp-display"
                style={{ fontSize: 30, color: accentVar }}
              >
                5 – 10
              </span>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--cp-ink-soft)",
                }}
              >
                min para llegar
              </span>
            </div>
          )}
          {step === 4 && horaDevolucion && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 6,
                marginTop: 14,
                background: "var(--cp-surface)",
                padding: "10px 16px",
                borderRadius: "var(--cp-btn-radius)",
                boxShadow: "var(--cp-shadow-sm)",
              }}
            >
              <span
                className="cp-display"
                style={{ fontSize: 30, color: accentVar }}
              >
                {formatHora(horaDevolucion)}
              </span>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--cp-ink-soft)",
                }}
              >
                hora de recogida
              </span>
            </div>
          )}
        </div>
        ) : null}

        {/* Mapa cuando va en camino */}
        {!allCancelled && !allDevuelto && step === 2 && (
          <div className="cp-anim-fade-in" style={{ marginTop: 14 }}>
            <FauxMap height={160} withMotion />
          </div>
        )}

        {/* Timeline — se oculta si el pedido está cancelado o completado */}
        {!allCancelled && !allDevuelto && (
        <div
          style={{
            marginTop: 18,
            background: "var(--cp-surface)",
            borderRadius: "var(--cp-card-radius)",
            padding: "16px 18px",
            boxShadow: "var(--cp-shadow-sm)",
          }}
        >
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const upcoming = i > step;
            const last = i === STEPS.length - 1;
            const dotBg = done
              ? "var(--cp-primary)"
              : active
                ? i >= 3
                  ? "var(--cp-coral)"
                  : "var(--cp-primary)"
                : "var(--cp-surface-alt)";
            const dotColor =
              done || active ? "#fff" : "var(--cp-ink-faint)";
            const glow =
              active
                ? `0 0 0 5px ${i >= 3 ? "var(--cp-coral-14)" : "var(--cp-primary-16)"}`
                : "none";
            return (
              <div
                key={s.key}
                style={{
                  display: "flex",
                  gap: 14,
                  opacity: upcoming ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      flexShrink: 0,
                      background: dotBg,
                      color: dotColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: glow,
                      transition: "all .3s",
                    }}
                  >
                    <Icon
                      name={done ? "check" : s.icon}
                      size={16}
                      stroke={2.4}
                    />
                  </div>
                  {!last && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 26,
                        background: done
                          ? "var(--cp-primary)"
                          : "var(--cp-line)",
                        transition: "background .3s",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    paddingBottom: last ? 0 : 16,
                    paddingTop: 4,
                  }}
                >
                  <div
                    style={{
                      fontWeight: active ? 800 : 600,
                      fontSize: 15,
                      color:
                        active || done
                          ? "var(--cp-ink)"
                          : "var(--cp-ink-soft)",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--cp-ink-soft)",
                      marginTop: 2,
                    }}
                  >
                    {active
                      ? s.sub
                      : done
                        ? "Completado"
                        : s.key === "devolucion"
                          ? horaDevolucion
                            ? `Recogida a las ${formatHora(horaDevolucion)}`
                            : "Al final del alquiler"
                          : "Pendiente"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Resumen del pedido */}
        <div
          style={{
            marginTop: 18,
            background: "var(--cp-surface)",
            borderRadius: "var(--cp-card-radius)",
            padding: "14px 16px",
            boxShadow: "var(--cp-shadow-sm)",
          }}
        >
          {items.map((it, i) => (
            <div key={it.id}>
              {i > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "var(--cp-line)",
                    margin: "10px 0",
                  }}
                />
              )}
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
                  {it.cantidad}×
                </div>
                <div
                  style={{
                    flex: 1,
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: "var(--cp-ink)",
                  }}
                >
                  {it.productNombre}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--cp-ink-soft)",
                  }}
                >
                  estado · {it.estado.replace("_", " ")}
                </div>
              </div>
            </div>
          ))}
          {items.length > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px dashed var(--cp-line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{ fontSize: 13.5, color: "var(--cp-ink-soft)" }}
              >
                Precio base estimado
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "var(--cp-primary)",
                }}
              >
                ~{subtotal.toFixed(0)}€
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {!allDevuelto && !allCancelled && (
          <Link href="/catalogo" style={{ textDecoration: "none" }}>
            <ChuloButton
              variant="soft"
              full
              leading={<Icon name="plus" size={19} stroke={2.4} />}
            >
              Ampliar mi pedido
            </ChuloButton>
          </Link>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "var(--cp-ink-faint)",
              fontSize: 12.5,
            }}
          >
            <Icon name="info" size={14} />
            Puedes añadir más cosas mientras dure el alquiler
          </div>
        </div>
      </div>

      {accountState?.isAnonymous && (
        <AccountPrompt
          email={accountState.email}
          onClose={closePrompt}
        />
      )}
    </ScreenShell>
  );
}
