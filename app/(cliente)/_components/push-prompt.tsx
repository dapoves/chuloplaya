"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "../_icons/icon";
import { subscribePush } from "../_actions/subscribe-push";
import { ChuloButton } from "./chulo-button";

const DISMISS_KEY = "chuloplaya.push.dismissed";

/**
 * Banner para pedir permiso de notificaciones push. Solo se muestra si:
 * - El navegador soporta SW + Push.
 * - El permiso es "default" (ni concedido ni denegado).
 * - El usuario no lo ha descartado en esta sesión.
 *
 * Si ya hay una suscripción activa o el usuario ya ha respondido, no aparece.
 */
export function PushPrompt({
  vapidPublicKey,
}: {
  vapidPublicKey: string | undefined;
}) {
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vapidPublicKey) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!existing) setShow(true);
      } catch {
        // sin SW listo, no mostramos prompt
      }
    })();
  }, [vapidPublicKey]);

  const enable = () => {
    start(async () => {
      setError(null);
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setShow(false);
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!) as BufferSource,
        });
        const json = sub.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          throw new Error("Subscripción inválida.");
        }
        const res = await subscribePush({
          endpoint: json.endpoint,
          expirationTime: json.expirationTime ?? null,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
        if (!res.ok) throw new Error(res.error);
        setShow(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido.");
      }
    });
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{
        margin: "12px 18px 0",
        padding: "14px 16px",
        background: "var(--cp-surface)",
        borderRadius: "var(--cp-card-radius)",
        boxShadow: "var(--cp-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "var(--cp-primary-10)",
            color: "var(--cp-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="sparkle" size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>
            Avísame cuando se mueva mi pedido
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--cp-ink-soft)",
              marginTop: 2,
            }}
          >
            Recibirás una notificación al aceptar, al ir de camino y al llegar.
          </div>
        </div>
      </div>
      {error && (
        <div style={{ color: "var(--cp-coral)", fontSize: 12.5 }}>{error}</div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <ChuloButton
          variant="outline"
          size="sm"
          onClick={dismiss}
          disabled={pending}
        >
          Ahora no
        </ChuloButton>
        <ChuloButton size="sm" full onClick={enable} disabled={pending}>
          {pending ? "Activando…" : "Activar avisos"}
        </ChuloButton>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Convierte la clave VAPID pública (base64url) en Uint8Array. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
