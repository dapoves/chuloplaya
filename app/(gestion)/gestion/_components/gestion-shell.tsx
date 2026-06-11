"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

type Props = {
  email: string;
  role: "admin" | "colaborador" | "cliente";
  logout: () => Promise<void>;
  children: React.ReactNode;
};

const BASE_NAV = [
  { href: "/gestion/jornada", label: "Jornada", icon: CalendarClock },
  { href: "/gestion/pedidos", label: "Pedidos", icon: Inbox },
  { href: "/gestion/clientes", label: "Clientes", icon: Users },
];

const ADMIN_NAV = [
  { href: "/gestion/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/gestion/admin/productos", label: "Productos", icon: Package },
  { href: "/gestion/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/gestion/admin/usuarios", label: "Usuarios", icon: UserCog },
  { href: "/gestion/admin/settings", label: "Ajustes", icon: Settings },
];

const MOBILE_ADMIN_NAV = [
  { href: "/gestion/admin", label: "Admin", icon: LayoutDashboard },
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function useNowLabel() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setNow(`${day}.${month}.${year} · ${time}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function GestionShell({ email, role, logout, children }: Props) {
  const pathname = usePathname();
  const NAV = role === "admin" ? [...BASE_NAV, ...ADMIN_NAV] : BASE_NAV;
  const MOBILE_NAV = role === "admin" ? [...BASE_NAV, ...MOBILE_ADMIN_NAV] : BASE_NAV;
  const now = useNowLabel();

  return (
    <div data-theme="bitacora" className="min-h-dvh pb-24 md:pb-0">
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "4px",
            border: "1px solid rgba(14,42,56,0.32)",
            fontFamily: "var(--font-body)",
          },
        }}
      />

      {/* Tira tinta superior — NO sticky, se queda arriba al hacer scroll */}
      <div className="border-b border-[color:var(--bt-line-strong)] bg-[color:var(--bt-ink)] text-[color:var(--bt-paper)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <span aria-hidden className="text-base">⚓</span>
            <span className="bt-stencil text-[11px] sm:text-xs">
              Chulo Playa · Bitácora
            </span>
            <span className="hidden h-3 w-px bg-white/25 sm:inline-block" />
            <span className="bt-mono hidden text-[10px] uppercase tracking-[0.22em] text-white/70 sm:inline">
              {role === "admin" ? "Capitanía" : "Tripulación"} · {role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bt-mono hidden text-[10px] uppercase tracking-[0.22em] text-white/70 md:inline">
              {now}
            </span>
            <span className="hidden text-[11px] text-white/55 lg:inline">
              {email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="bt-stencil group flex items-center gap-1.5 rounded-[3px] border border-white/25 px-2.5 py-1 text-[10px] text-white/85 transition-colors hover:border-[color:var(--bt-accent)] hover:bg-[color:var(--bt-accent)] hover:text-[color:var(--bt-ink)]"
              >
                <LogOut className="size-3" />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Cabecera secundaria: navegación — sticky top-0, efecto cristal */}
      <header className="sticky top-0 z-10 border-b border-[color:var(--bt-line-strong)] bg-[color:var(--bt-paper)]/80 backdrop-blur-md">
        <nav className="mx-auto hidden max-w-6xl items-center gap-1 px-5 py-2 md:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/gestion/admin"
                ? pathname === "/gestion/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2 rounded-[3px] border px-3 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "border-[color:var(--bt-ink)] bg-[color:var(--bt-ink)] text-[color:var(--bt-paper)] shadow-[0_2px_0_var(--bt-accent)]"
                    : "border-transparent text-[color:var(--bt-ink-soft)] hover:border-[color:var(--bt-line-strong)] hover:bg-[color:var(--bt-card)] hover:text-[color:var(--bt-ink)]"
                )}
              >
                <Icon className="size-3.5" />
                <span className="bt-stencil text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile: título sección actual */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5 md:hidden">
          <div className="flex items-center gap-2">
            <span className="bt-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--bt-ink-faint)]">
              Sección
            </span>
            <span className="bt-stencil text-xs text-[color:var(--bt-ink)]">
              {NAV.find(
                (n) =>
                  n.href === "/gestion/admin"
                    ? pathname === "/gestion/admin"
                    : pathname.startsWith(n.href)
              )?.label ?? "Gestión"}
            </span>
          </div>
          <span className="bt-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--bt-ink-soft)]">
            {now.split(" · ")[1] ?? ""}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>

      {/* Dock móvil */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t md:hidden"
        style={{ background: "#ffffff", borderColor: "rgba(14,42,56,0.32)" }}
      >
        <div className="mx-auto flex max-w-6xl">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors"
                style={{ color: active ? "#0A6E9E" : "#4B6B78" }}
              >
                {active && (
                  <span
                    className="absolute inset-x-3 top-0 h-[2px]"
                    style={{ background: "#0A6E9E" }}
                  />
                )}
                <Icon className="size-[18px]" />
                <span className="bt-stencil text-[9px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
