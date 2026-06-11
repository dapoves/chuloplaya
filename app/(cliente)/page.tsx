import Link from "next/link";

import { ChuloLogo } from "./_components/chulo-mark";
import { ChuloButton } from "./_components/chulo-button";
import { RecentOrders } from "./_components/recent-orders";
import { ScreenShell } from "./_components/screen-shell";
import { WelcomeIntro } from "./_components/welcome-intro";
import { Icon } from "./_icons/icon";

export const dynamic = "force-dynamic";

export default async function QrSplashPage() {
  return (
    <ScreenShell>
      {/* Decoración superior — sol y degradado del tema Costa */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 402 500"
          preserveAspectRatio="xMidYMin slice"
          style={{ position: "absolute", top: 0, width: "100%" }}
        >
          <defs>
            <radialGradient id="cp-sky" cx="78%" cy="14%" r="90%">
              <stop offset="0%" stopColor="rgba(255,194,60,0.55)" />
              <stop offset="38%" stopColor="rgba(255,194,60,0.16)" />
              <stop offset="100%" stopColor="rgba(10,110,158,0)" />
            </radialGradient>
          </defs>
          <rect width="402" height="500" fill="url(#cp-sky)" />
          <circle cx="312" cy="92" r="46" fill="rgba(255,194,60,0.9)" />
        </svg>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "78px 30px 30px",
          position: "relative",
        }}
      >
        <div className="cp-anim-fade-in">
          <ChuloLogo size={26} />
        </div>

        <WelcomeIntro />

        <div>
          <div className="cp-anim-fade-in" style={{ animationDelay: "1050ms" }}>
            <RecentOrders />
          </div>

          <div
            className="cp-anim-fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
              padding: "14px 16px",
              background: "var(--cp-surface)",
              borderRadius: "var(--cp-card-radius)",
              boxShadow: "var(--cp-shadow-sm)",
              animationDelay: "1180ms",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--cp-primary-10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="pin" size={22} color="var(--cp-primary)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>
                Playa del Puerto de Sagunto
              </div>
              <div style={{ fontSize: 13, color: "var(--cp-ink-soft)" }}>
                Puerto de Sagunto · València
              </div>
            </div>
          </div>
        </div>

        <div
          className="cp-anim-fade-in"
          style={{ marginTop: 16, animationDelay: "1320ms" }}
        >
          <Link href="/catalogo" style={{ textDecoration: "none" }}>
            <ChuloButton
              full
              trailing={<Icon name="chevron" size={20} stroke={2.4} />}
            >
              Ver productos
            </ChuloButton>
          </Link>
        </div>
      </div>
    </ScreenShell>
  );
}
