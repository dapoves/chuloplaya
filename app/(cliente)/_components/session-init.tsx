"use client";

import { useEffect } from "react";

import { initSession } from "../_actions/init-session";

/** Garantiza que existe una sesión Supabase (anónima o real) al montar el layout cliente. */
export function SessionInit() {
  useEffect(() => {
    initSession();
  }, []);
  return null;
}
