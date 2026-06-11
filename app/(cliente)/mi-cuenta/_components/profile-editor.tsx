"use client";

import { useState, useTransition } from "react";

import { updateProfile } from "../../_actions/update-profile";
import { ChuloButton } from "../../_components/chulo-button";
import { Field } from "../../_components/field";
import { Icon } from "../../_icons/icon";

export function ProfileEditor({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [feedback, setFeedback] = useState<
    | { kind: "ok"; text: string }
    | { kind: "err"; text: string }
    | null
  >(null);
  const [pending, start] = useTransition();

  const dirty = name !== initialName || phone !== initialPhone;

  const submit = () => {
    start(async () => {
      setFeedback(null);
      const res = await updateProfile({
        display_name: name,
        phone,
      });
      if (res.ok) {
        setFeedback({ kind: "ok", text: "Guardado." });
      } else {
        setFeedback({ kind: "err", text: res.error });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field
        label="Nombre"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leading={<Icon name="user" size={18} color="var(--cp-ink-faint)" />}
        autoComplete="name"
      />
      <Field
        label="Teléfono"
        type="tel"
        placeholder="600 000 000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        leading={<Icon name="phone" size={18} color="var(--cp-ink-faint)" />}
        autoComplete="tel"
      />
      <ChuloButton
        size="md"
        onClick={submit}
        disabled={!dirty || pending}
        full
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </ChuloButton>
      {feedback && (
        <span
          key={feedback.text}
          className={feedback.kind === "ok" ? "cp-anim-fade-in" : "cp-anim-shake"}
          style={{
            fontSize: 12.5,
            color:
              feedback.kind === "ok" ? "var(--cp-primary)" : "var(--cp-coral)",
          }}
        >
          {feedback.text}
        </span>
      )}
    </div>
  );
}
