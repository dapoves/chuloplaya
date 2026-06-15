"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";

import { Icon } from "../_icons/icon";
import { GoogleMark } from "../_icons/google-mark";
import { requestAccount } from "../_actions/request-account";
import { signInWithGoogle } from "../_actions/auth";
import { ChuloButton } from "./chulo-button";
import { Field } from "./field";

/**
 * Banner inferior que aparece tras enviar pedido si la sesión es anónima.
 * Ofrece crear cuenta con el email para poder ver pedidos futuros.
 */
export function AccountPrompt({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [value, setValue] = useState(email);
  const [status, setStatus] = useState<
    "idle" | "sent" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      setError(null);
      const res = await requestAccount(value);
      if (res.ok) setStatus("sent");
      else {
        setError(res.error);
        setStatus("error");
      }
    });
  };

  const continueWithGoogle = () => {
    start(async () => {
      setError(null);
      // Sesión anónima con pedido en curso → "create" enlaza Google y conserva el pedido.
      const res = await signInWithGoogle("create");
      if ("redirect" in res && res.redirect) {
        window.location.href = res.redirect;
      } else if ("error" in res) {
        setError(res.error);
        setStatus("error");
      }
    });
  };

  return (
    <motion.div
      role="dialog"
      aria-modal
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--cp-surface)",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: "20px 22px 30px",
        boxShadow: "0 -16px 50px rgba(10,42,60,0.2)",
        zIndex: 50,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 34,
          height: 34,
          border: "none",
          borderRadius: 999,
          background: "rgba(14,42,56,0.06)",
          cursor: "pointer",
          color: "var(--cp-ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="close" size={18} stroke={2.2} />
      </button>

      {status === "sent" ? (
        <>
          <div
            className="cp-anim-celebrate"
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "var(--cp-primary-10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cp-primary)",
            }}
          >
            <Icon name="check" size={28} stroke={2.4} />
          </div>
          <div
            className="cp-display"
            style={{ fontSize: 22, marginTop: 12 }}
          >
            Te hemos mandado un enlace
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--cp-ink-soft)",
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            Abre el correo a <b>{value}</b> y haz clic en el enlace para
            confirmar tu cuenta. Tus pedidos quedarán guardados.
          </p>
          <div style={{ marginTop: 14 }}>
            <ChuloButton variant="soft" full onClick={onClose}>
              Cerrar
            </ChuloButton>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "var(--cp-accent-14)",
                color: "var(--cp-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="sparkle" size={20} stroke={2} />
            </div>
            <div
              className="cp-display"
              style={{ fontSize: 22, color: "var(--cp-ink)" }}
            >
              ¿Crear cuenta?
            </div>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--cp-ink-soft)",
              marginTop: 8,
              lineHeight: 1.45,
            }}
          >
            Crea una cuenta con tu email y podrás volver a ver este pedido y
            los próximos sin volver a meter tus datos.
          </p>
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={pending}
              className="cp-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--cp-btn-radius)",
                border: "1.5px solid var(--cp-line)",
                background: "var(--cp-surface)",
                color: "var(--cp-ink)",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 14.5,
                cursor: pending ? "not-allowed" : "pointer",
                opacity: pending ? 0.55 : 1,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <GoogleMark size={18} />
              Crear cuenta con Google
            </button>
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--cp-ink-faint)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span style={{ flex: 1, height: 1, background: "var(--cp-line)" }} />
            o
            <span style={{ flex: 1, height: 1, background: "var(--cp-line)" }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <Field
              type="email"
              placeholder="Tu email"
              value={value}
              leading={<Icon name="mail" size={18} color="var(--cp-ink-faint)" />}
              onChange={(e) => setValue(e.target.value)}
              error={status === "error" ? error : null}
            />
          </div>
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
            }}
          >
            <ChuloButton
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={pending}
            >
              Ahora no
            </ChuloButton>
            <ChuloButton
              size="md"
              full
              onClick={submit}
              disabled={pending || !value.trim()}
            >
              {pending ? "Enviando…" : "Crear cuenta"}
            </ChuloButton>
          </div>
        </>
      )}
    </motion.div>
  );
}
