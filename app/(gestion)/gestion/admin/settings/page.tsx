import { getConfigAll } from "@/lib/config";

import { SettingsForm } from "./_form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const config = await getConfigAll();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Parámetros que afectan al catálogo cliente y al flujo de pedidos.
        </p>
      </div>
      <SettingsForm initial={config} />
    </div>
  );
}
