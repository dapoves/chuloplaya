"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ChuloButton } from "../_components/chulo-button";
import { FauxMap } from "../_components/faux-map";
import { Field, TextareaField } from "../_components/field";
import { FooterBar } from "../_components/footer-bar";
import { ScreenShell } from "../_components/screen-shell";
import { TopBar } from "../_components/top-bar";
import { useCart } from "../_components/cart-provider";
import { Icon, type IconName } from "../_icons/icon";

const STORAGE_KEY = "chuloplaya.delivery.v1";

type Method = "gps" | "manual";

type DeliveryData = {
  method: Method;
  spot: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  lat: number | null;
  lng: number | null;
};

export function UbicacionClient({
  prefill,
}: {
  prefill: { name: string; email: string; phone: string; isAnonymous: boolean };
}) {
  const router = useRouter();
  const { items } = useCart();

  const [data, setData] = useState<DeliveryData>({
    method: "gps",
    spot: "",
    name: prefill.name,
    phone: prefill.phone,
    email: prefill.email,
    notes: "",
    lat: null,
    lng: null,
  });
  const [gpsState, setGpsState] = useState<
    "idle" | "requesting" | "ok" | "error"
  >("idle");
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Rehidratar desde localStorage para no perder datos al volver.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DeliveryData>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData((cur) => ({ ...cur, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persistir cambios.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  // Redirigir a catálogo si no hay items.
  useEffect(() => {
    if (items.length === 0) router.replace("/catalogo");
  }, [items.length, router]);

  const requestGps = () => {
    if (!("geolocation" in navigator)) {
      setGpsState("error");
      setGpsError("Tu navegador no permite geolocalización.");
      return;
    }
    setGpsState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData((d) => ({
          ...d,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setGpsState("ok");
      },
      (err) => {
        setGpsState("error");
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Has denegado el permiso de ubicación."
            : "No hemos podido detectar tu ubicación."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Auto-pedir GPS la primera vez que se entra en modo gps.
  useEffect(() => {
    if (data.method === "gps" && gpsState === "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      requestGps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.method]);

  const ready =
    data.name.trim() &&
    data.phone.trim() &&
    data.email.trim() &&
    (data.method === "gps"
      ? data.lat !== null && data.lng !== null
      : data.spot.trim());

  return (
    <ScreenShell>
      <TopBar title="¿Dónde lo dejamos?" />

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 24px" }}>
        {/* Toggle método */}
        <div
          style={{
            display: "flex",
            gap: 8,
            background: "var(--cp-surface-alt)",
            padding: 4,
            borderRadius: "calc(var(--cp-btn-radius) + 2px)",
          }}
        >
          {(
            [
              { id: "gps", label: "Mi ubicación", icon: "nav" },
              { id: "manual", label: "Indicar sitio", icon: "edit" },
            ] as Array<{ id: Method; label: string; icon: IconName }>
          ).map((m) => {
            const active = data.method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setData({ ...data, method: m.id })}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: "calc(var(--cp-btn-radius) - 2px)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  background: active ? "var(--cp-surface)" : "transparent",
                  color: active ? "var(--cp-primary)" : "var(--cp-ink-soft)",
                  boxShadow: active ? "var(--cp-shadow-sm)" : "none",
                  transition: "all .25s cubic-bezier(.25,.1,.25,1)",
                }}
              >
                <Icon name={m.icon} size={17} />
                {m.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {data.method === "gps" ? (
            <motion.div
              key="gps"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                marginTop: 14,
                borderRadius: "var(--cp-card-radius)",
                overflow: "hidden",
                boxShadow: "var(--cp-shadow-sm)",
                position: "relative",
              }}
            >
              <FauxMap height={188} />
              <div
                style={{
                  padding: 12,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  className={gpsState === "requesting" ? "cp-anim-pulse" : undefined}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "var(--cp-coral-14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="nav" size={18} color="var(--cp-coral)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--cp-ink)",
                    }}
                  >
                    {gpsState === "ok"
                      ? "Ubicación detectada"
                      : gpsState === "requesting"
                        ? "Detectando ubicación…"
                        : gpsState === "error"
                          ? "Sin ubicación"
                          : "Pulsa para detectar"}
                  </div>
                  <div
                    className={gpsState === "error" ? "cp-anim-shake" : undefined}
                    key={gpsState === "error" ? gpsError : undefined}
                    style={{ fontSize: 12.5, color: gpsState === "error" ? "var(--cp-coral)" : "var(--cp-ink-soft)" }}
                  >
                    {gpsState === "ok" && data.lat !== null && data.lng !== null
                      ? `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`
                      : gpsState === "error"
                        ? gpsError ?? "No hemos podido detectarte."
                        : "Te buscaremos en la playa del Puerto de Sagunto"}
                  </div>
                </div>
                {gpsState !== "ok" && (
                  <button
                    type="button"
                    onClick={requestGps}
                    className="cp-btn"
                    style={{
                      border: "none",
                      background: "var(--cp-primary)",
                      color: "var(--cp-on-primary)",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "8px 12px",
                      borderRadius: 999,
                      cursor: "pointer",
                    }}
                  >
                    {gpsState === "requesting" ? "…" : "Reintentar"}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ marginTop: 14 }}
            >
              <Field
                label="Tu sitio en la arena"
                placeholder="Ej: Sombrilla 42, fila 3"
                leading={<Icon name="pin" size={18} color="var(--cp-ink-faint)" />}
                value={data.spot}
                onChange={(e) => setData({ ...data, spot: e.target.value })}
                helper="Mira el número pintado en el mástil o cuéntanos una referencia."
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name="user" size={17} color="var(--cp-ink-soft)" />
            <span
              style={{
                fontWeight: 700,
                fontSize: 14.5,
                color: "var(--cp-ink)",
              }}
            >
              Tus datos
            </span>
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Field
              placeholder="Tu nombre"
              leading={<Icon name="user" size={18} color="var(--cp-ink-faint)" />}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoComplete="name"
            />
            <Field
              placeholder="Teléfono"
              type="tel"
              leading={<Icon name="phone" size={18} color="var(--cp-ink-faint)" />}
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              autoComplete="tel"
            />
            <Field
              placeholder="Email"
              type="email"
              leading={<Icon name="mail" size={18} color="var(--cp-ink-faint)" />}
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              autoComplete="email"
              helper={
                prefill.isAnonymous
                  ? "Al confirmar te ofreceremos crear cuenta con este email."
                  : undefined
              }
            />
            <TextareaField
              placeholder="Notas para el repartidor (opcional)"
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      <FooterBar>
        <ChuloButton
          full
          disabled={!ready}
          onClick={() => router.push("/confirmar")}
          trailing={<Icon name="chevron" size={20} stroke={2.4} />}
        >
          Revisar pedido
        </ChuloButton>
      </FooterBar>
    </ScreenShell>
  );
}
