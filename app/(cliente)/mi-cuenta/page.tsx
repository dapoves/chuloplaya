import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "../_actions/auth";
import { Icon } from "../_icons/icon";
import { ScreenShell } from "../_components/screen-shell";
import { TopBar } from "../_components/top-bar";
import { ProfileEditor } from "./_components/profile-editor";
import { PromoteAccount } from "./_components/promote-account";

export const dynamic = "force-dynamic";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ScreenShell>
        <TopBar title="Mi cuenta" backHref="/catalogo" />
        <div style={{ padding: "0 22px 30px", flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
          <section
            style={{
              background: "var(--cp-surface)",
              borderRadius: "var(--cp-card-radius)",
              boxShadow: "var(--cp-shadow-sm)",
              padding: "18px 18px 20px",
            }}
          >
            <PromoteAccount loginOnly />
          </section>
        </div>
      </ScreenShell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const isAnonymous = Boolean(user.is_anonymous);

  return (
    <ScreenShell>
      <TopBar title="Mi cuenta" backHref="/catalogo" />
      <div
        style={{
          flex: 1,
          padding: "0 22px 30px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <section
          style={{
            background: "var(--cp-surface)",
            borderRadius: "var(--cp-card-radius)",
            boxShadow: "var(--cp-shadow-sm)",
            padding: "18px 18px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--cp-primary-10)",
                color: "var(--cp-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="user" size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {profile?.display_name?.trim() ||
                  (isAnonymous ? "Invitado" : user.email) ||
                  "Sin nombre"}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--cp-ink-soft)",
                  marginTop: 2,
                }}
              >
                {isAnonymous
                  ? "Cuenta temporal · sin email"
                  : user.email ?? "Sin email"}
              </div>
            </div>
          </div>
          {isAnonymous ? (
            <PromoteAccount
              initialName={profile?.display_name ?? ""}
              initialPhone={profile?.phone ?? ""}
            />
          ) : (
            <ProfileEditor
              initialName={profile?.display_name ?? ""}
              initialPhone={profile?.phone ?? ""}
            />
          )}
        </section>

        <Link
          href="/mis-pedidos"
          className="cp-touchable"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            background: "var(--cp-surface)",
            borderRadius: "var(--cp-card-radius)",
            boxShadow: "var(--cp-shadow-sm)",
            textDecoration: "none",
            color: "var(--cp-ink)",
          }}
        >
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
            }}
          >
            <Icon name="receipt" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Mis pedidos</div>
            <div style={{ fontSize: 12.5, color: "var(--cp-ink-soft)" }}>
              Historial completo
            </div>
          </div>
          <Icon name="chevron" size={18} color="var(--cp-ink-faint)" />
        </Link>

        {!isAnonymous && (
          <form action={signOut}>
            <button
              type="submit"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                padding: "13px 16px",
                background: "var(--cp-coral)",
                border: "none",
                borderRadius: "var(--cp-btn-radius)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14.5,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Icon name="logout" size={18} />
              Cerrar sesión
            </button>
          </form>
        )}
      </div>
    </ScreenShell>
  );
}
