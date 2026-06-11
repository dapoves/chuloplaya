"use client";

import { useState, useTransition } from "react";

import { createAccount, signInWithEmail } from "../../_actions/auth";
import { ChuloButton } from "../../_components/chulo-button";
import { Field } from "../../_components/field";
import { Icon } from "../../_icons/icon";

type Mode = "create" | "login";

/**
 * Formulario de cuenta para invitados: crear cuenta (nombre + teléfono + email,
 * todos obligatorios) o iniciar sesión en una cuenta existente (email).
 * Ambos flujos envían un magic link. Renderiza solo su contenido — el
 * envoltorio (tarjeta) lo pone la página.
 */
export function PromoteAccount({
  initialName = "",
  initialPhone = "",
  loginOnly = false,
}: {
  initialName?: string;
  initialPhone?: string;
  loginOnly?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(loginOnly ? "login" : "create");
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      setError(null);
      const res =
        mode === "create"
          ? await createAccount({ email, name, phone })
          : await signInWithEmail(email);
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  };

  if (sent) {
    return (
      <div className="cp-anim-fade-in" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          className="cp-anim-celebrate"
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "var(--cp-primary-10)",
            color: "var(--cp-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="check" size={22} stroke={2.4} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Mira tu email</div>
          <div style={{ fontSize: 13, color: "var(--cp-ink-soft)" }}>
            Te hemos enviado un enlace para{" "}
            {mode === "create" ? "confirmar tu cuenta" : "iniciar sesión"}.
          </div>
        </div>
      </div>
    );
  }

  const canSubmit =
    mode === "create"
      ? Boolean(name.trim() && phone.trim() && email.trim())
      : Boolean(email.trim());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Toggle crear / iniciar sesión */}
      {!loginOnly && <div
        style={{
          display: "flex",
          gap: 6,
          background: "var(--cp-surface-alt)",
          padding: 4,
          borderRadius: "calc(var(--cp-btn-radius) + 2px)",
        }}
      >
        {(
          [
            { id: "create", label: "Crear cuenta" },
            { id: "login", label: "Iniciar sesión" },
          ] as Array<{ id: Mode; label: string }>
        ).map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setError(null);
              }}
              style={{
                flex: 1,
                padding: 9,
                borderRadius: "calc(var(--cp-btn-radius) - 2px)",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13.5,
                background: active ? "var(--cp-surface)" : "transparent",
                color: active ? "var(--cp-primary)" : "var(--cp-ink-soft)",
                boxShadow: active ? "var(--cp-shadow-sm)" : "none",
                transition: "all .25s cubic-bezier(.25,.1,.25,1)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>}

      <p style={{ fontSize: 13, lineHeight: 1.4, color: "var(--cp-ink-soft)" }}>
        {mode === "create"
          ? "Crea una cuenta para guardar tu nombre, teléfono e historial de pedidos."
          : "Te enviaremos un enlace a tu email para entrar en tu cuenta."}
      </p>

      {mode === "create" && (
        <>
          <Field
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leading={<Icon name="user" size={18} color="var(--cp-ink-faint)" />}
            autoComplete="name"
          />
          <Field
            type="tel"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leading={<Icon name="phone" size={18} color="var(--cp-ink-faint)" />}
            autoComplete="tel"
          />
        </>
      )}

      <Field
        type="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leading={<Icon name="mail" size={18} color="var(--cp-ink-faint)" />}
        autoComplete="email"
        error={error}
      />

      <ChuloButton size="md" full onClick={submit} disabled={pending || !canSubmit}>
        {pending
          ? "Enviando…"
          : mode === "create"
            ? "Crear cuenta"
            : "Enviar enlace"}
      </ChuloButton>
    </div>
  );
}
