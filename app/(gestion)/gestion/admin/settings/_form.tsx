"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConfigShape, DuracionOption } from "@/lib/config";

import { updateConfig } from "./actions";

export function SettingsForm({ initial }: { initial: ConfigShape }) {
  return (
    <div className="grid gap-4">
      <HoraCierreSection value={initial.hora_cierre} />
      <PuntoDevolucionSection value={initial.texto_punto_devolucion} />
      <DuracionesSection value={initial.duraciones_disponibles} />
    </div>
  );
}

function HoraCierreSection({ value }: { value: string }) {
  const [current, setCurrent] = useState(value);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      const res = await updateConfig("hora_cierre", current);
      if (res.ok) toast.success("Hora de cierre guardada");
      else toast.error(res.error);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hora de cierre</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="hora_cierre">Formato 24h (HH:MM)</Label>
          <Input
            id="hora_cierre"
            type="time"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="max-w-[180px]"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Marca el límite a partir del cual no se aceptan pedidos. Se muestra al
          cliente en el catálogo.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={submit}
            disabled={pending || current === value}
            size="sm"
          >
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PuntoDevolucionSection({ value }: { value: string }) {
  const [current, setCurrent] = useState(value);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      const res = await updateConfig("texto_punto_devolucion", current);
      if (res.ok) toast.success("Punto de devolución guardado");
      else toast.error(res.error);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Punto de devolución</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="punto_dev">Texto que ven los clientes</Label>
          <textarea
            id="punto_dev"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            rows={3}
            maxLength={280}
            className="border-input min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
          />
          <div className="text-right text-xs text-muted-foreground">
            {current.length} / 280
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={submit}
            disabled={pending || current === value}
            size="sm"
          >
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DuracionesSection({ value }: { value: DuracionOption[] }) {
  const [list, setList] = useState<DuracionOption[]>(value);
  const [pending, start] = useTransition();

  const dirty = JSON.stringify(list) !== JSON.stringify(value);

  const submit = () => {
    start(async () => {
      const res = await updateConfig("duraciones_disponibles", list);
      if (res.ok) toast.success("Duraciones guardadas");
      else toast.error(res.error);
    });
  };

  const updateItem = (i: number, patch: Partial<DuracionOption>) => {
    setList((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const removeItem = (i: number) => {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addItem = () => {
    setList((prev) => [
      ...prev,
      { id: `nueva_${prev.length + 1}`, label: "Nueva duración", horas: 1 },
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duraciones disponibles</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-xs text-muted-foreground">
          Opciones de duración mostradas al cliente al elegir tiempo de
          alquiler. <code>id</code> es interno (sin espacios).
        </p>
        <div className="grid gap-2">
          {list.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_90px_auto] items-end gap-2 rounded-md border p-2"
            >
              <div className="grid gap-1">
                <Label className="text-xs">ID</Label>
                <Input
                  value={it.id}
                  onChange={(e) => updateItem(i, { id: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Etiqueta</Label>
                <Input
                  value={it.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Horas</Label>
                <Input
                  type="number"
                  min={1}
                  value={it.horas}
                  onChange={(e) =>
                    updateItem(i, { horas: Number(e.target.value) || 0 })
                  }
                  className="h-9"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(i)}
                disabled={list.length <= 1}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          Añadir duración
        </Button>
        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={pending || !dirty} size="sm">
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
