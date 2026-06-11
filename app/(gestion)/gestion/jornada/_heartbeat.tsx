"use client";

import { useEffect } from "react";

import { heartbeat } from "./actions";

export function Heartbeat({ intervalMs = 30_000 }: { intervalMs?: number }) {
  useEffect(() => {
    let cancelled = false;
    void heartbeat();
    const t = setInterval(() => {
      if (cancelled) return;
      void heartbeat();
    }, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs]);

  return null;
}
