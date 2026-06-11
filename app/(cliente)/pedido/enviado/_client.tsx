"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Icon } from "../../_icons/icon";

const PLACED_KEY = "chuloplaya.justPlaced.v1";

export function EnviadoClient() {
  const router = useRouter();

  useEffect(() => {
    let orderId: string | null = null;
    try {
      const raw = sessionStorage.getItem(PLACED_KEY);
      if (raw) orderId = (JSON.parse(raw) as { orderId?: string }).orderId ?? null;
    } catch {
      // ignore
    }
    const fallback = "/catalogo";
    const id = setTimeout(() => {
      router.replace(orderId ? `/pedido/${orderId}` : fallback);
    }, 1900);
    return () => clearTimeout(id);
  }, [router]);

  return (
    <div
      className="cp-anim-fade-in"
      style={{
        minHeight: "100dvh",
        background: "var(--cp-primary)",
        color: "var(--cp-on-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 30,
      }}
    >
      <div
        className="cp-anim-celebrate"
        style={{
          width: 96,
          height: 96,
          borderRadius: 999,
          background: "rgba(255,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 999,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cp-primary)",
          }}
        >
          <Icon name="check" size={40} stroke={3} />
        </div>
      </div>
      <div
        className="cp-display cp-anim-fade-in"
        style={{ fontSize: 30, marginTop: 22, animationDelay: "400ms" }}
      >
        ¡Pedido enviado!
      </div>
      <p
        className="cp-anim-fade-in"
        style={{
          fontSize: 15.5,
          opacity: 0.85,
          marginTop: 8,
          maxWidth: 280,
          animationDelay: "550ms",
        }}
      >
        Lo estamos mandando a los chulos de playa del Puerto de Sagunto.
      </p>
    </div>
  );
}
