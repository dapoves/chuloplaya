"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createCategory,
  type ProductFormState,
} from "./actions";

export type ProductInitial = {
  id?: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  category_id: string;
  activo: boolean;
};

export type CategoryOption = { id: string; nombre: string; slug: string };

type FormAction = (
  prev: ProductFormState,
  formData: FormData
) => Promise<ProductFormState>;

export function ProductForm({
  initial,
  action,
  submitLabel,
  categories: initialCategories,
}: {
  initial: ProductInitial;
  action: FormAction;
  submitLabel: string;
  categories: CategoryOption[];
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) toast.success(state.ok);
    if (state?.error) toast.error(state.error);
  }, [state]);

  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [categoryId, setCategoryId] = useState(initial.category_id);
  const [newCat, setNewCat] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [creatingCat, startCreatingCat] = useTransition();
  const [catError, setCatError] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Field id="nombre" label="Nombre">
            <Input id="nombre" name="nombre" defaultValue={initial.nombre} required maxLength={80} />
          </Field>

          <Field id="slug" label="Slug (URL)" hint="Se genera del nombre si lo dejas vacío.">
            <Input
              id="slug"
              name="slug"
              defaultValue={initial.slug}
              placeholder="silla-plegable"
              maxLength={60}
            />
          </Field>

          <Field id="descripcion" label="Descripción">
            <textarea
              id="descripcion"
              name="descripcion"
              defaultValue={initial.descripcion}
              rows={3}
              maxLength={400}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="precio" label="Precio (€/día)">
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.5"
                min="0"
                defaultValue={initial.precio}
                required
              />
            </Field>

            <Field id="category_id" label="Categoría">
              <div className="flex flex-col gap-2">
                <select
                  id="category_id"
                  name="category_id"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-9 rounded-md border bg-transparent px-2 text-sm"
                >
                  <option value="">— Sin categoría —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {showNewCat ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={creatingCat || !newCat.trim()}
                      onClick={() =>
                        startCreatingCat(async () => {
                          setCatError(null);
                          const res = await createCategory(newCat);
                          if (res.error) {
                            setCatError(res.error);
                            toast.error(res.error);
                            return;
                          }
                          toast.success("Categoría creada");
                          if (res.id) {
                            const fresh: CategoryOption = {
                              id: res.id,
                              nombre: newCat.trim(),
                              slug: "",
                            };
                            setCategories((cs) => [...cs, fresh]);
                            setCategoryId(res.id);
                            setShowNewCat(false);
                            setNewCat("");
                          }
                        })
                      }
                    >
                      {creatingCat ? "Creando…" : "Crear"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNewCat(false);
                        setNewCat("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="self-start px-0"
                    onClick={() => setShowNewCat(true)}
                  >
                    + Nueva categoría
                  </Button>
                )}
                {catError ? (
                  <p className="text-xs text-destructive">{catError}</p>
                ) : null}
              </div>
            </Field>
          </div>

          <Field id="imagen_url" label="URL de imagen (opcional)">
            <Input
              id="imagen_url"
              name="imagen_url"
              type="url"
              defaultValue={initial.imagen_url}
              placeholder="https://…"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={initial.activo}
              className="size-4"
            />
            Visible en el catálogo
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
