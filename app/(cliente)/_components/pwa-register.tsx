"use client";

import { useEffect } from "react";

/**
 * Registra el service worker. Solo en cliente y solo si el navegador soporta SW.
 * Inocuo si el SW ya está registrado (el navegador hace dedupe).
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const url = "/sw.js";
    navigator.serviceWorker.register(url, { scope: "/" }).catch(() => {
      // Silencioso: el SW no es crítico para la app.
    });
  }, []);
  return null;
}
