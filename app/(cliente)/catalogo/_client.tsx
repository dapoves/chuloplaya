"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ChuloLogo } from "../_components/chulo-mark";
import { Chip } from "../_components/chip";
import { ProductImage } from "../_components/product-image";
import { ScreenShell } from "../_components/screen-shell";
import { Tag } from "../_components/tag";
import { useCart } from "../_components/cart-provider";
import { Icon, categoryIcon, type IconName } from "../_icons/icon";
import { formatEur } from "../_lib/pricing";

export type CatalogProduct = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: number | null;
  totalCargado: number | null;
  tag: string | null;
};

export type CatalogCategory = {
  slug: string;
  label: string;
};

const CATEGORY_ICONS: Record<string, IconName> = {
  sillas: "chair",
  sombrillas: "umbrella",
  hamacas: "lounger",
  extras: "cooler",
};

export function CatalogClient({
  products,
  categories,
  recentOrdersSlot,
  accountLinkSlot,
}: {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  recentOrdersSlot?: ReactNode;
  accountLinkSlot?: ReactNode;
}) {
  const [cat, setCat] = useState<string>("todos");
  const { items, count, subtotal } = useCart();

  const CATS: Array<{ id: string; label: string; icon: IconName | null }> = [
    { id: "todos", label: "Todo", icon: null },
    ...categories.map((c) => ({
      id: c.slug,
      label: c.label,
      icon: CATEGORY_ICONS[c.slug] ?? null,
    })),
  ];

  const list = useMemo(
    () => (cat === "todos" ? products : products.filter((p) => p.categoria === cat)),
    [cat, products]
  );
  // const featured = useMemo(() => products.filter((p) => p.tag), [products]);

  const qtyInCartById = (id: string) =>
    items
      .filter((it) => it.productId === id)
      .reduce((s, it) => s + it.qty, 0);

  return (
    <ScreenShell>
      {/* Header (fijo en el flujo, no scrollea) */}
      <div
        style={{
          flexShrink: 0,
          paddingTop: 24,
          background: "var(--cp-surface)",
          boxShadow: "var(--cp-shadow-sm)",
          position: "sticky",
          top: 0,
          zIndex: 3,
        }}
      >
        <div
          style={{
            padding: "8px 18px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ChuloLogo size={18} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {accountLinkSlot}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "2px 18px 14px",
            scrollbarWidth: "none",
          }}
          className="no-scrollbar"
        >
          {CATS.map((c) => (
            <Chip
              key={c.id}
              active={cat === c.id}
              onClick={() => setCat(c.id)}
              leading={
                c.icon ? <Icon name={c.icon} size={16} stroke={2} /> : null
              }
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Cuerpo scrolleable */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 18px",
          paddingBottom: count > 0 ? 110 : 28,
        }}
      >
        {recentOrdersSlot && (
          <div style={{ marginBottom: 18 }}>{recentOrdersSlot}</div>
        )}

        {/* LO MÁS PEDIDO HOY — desactivado temporalmente
        {cat === "todos" && featured.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <SectionTitle icon="sparkle">Lo más pedido hoy</SectionTitle>
            <div
              style={{
                display: "flex",
                gap: 14,
                overflowX: "auto",
                padding: "4px 0 6px",
                margin: "0 -18px",
                paddingLeft: 18,
                paddingRight: 18,
                scrollbarWidth: "none",
              }}
            >
              {featured.map((p) => (
                <FeaturedCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
        */}

        <SectionTitle>
          {cat === "todos"
            ? "Todo el catálogo"
            : CATS.find((c) => c.id === cat)?.label}
        </SectionTitle>
        {list.length === 0 ? (
          <p
            style={{
              fontSize: 14,
              color: "var(--cp-ink-soft)",
              marginTop: 8,
            }}
          >
            Aún no hay productos en esta categoría.
          </p>
        ) : (
          <div
            key={cat}
            className="cp-anim-fade-in"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 4,
            }}
          >
            {list.map((p, i) => (
              <ProductRow
                key={p.id}
                product={p}
                qtyInCart={qtyInCartById(p.id)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra flotante de carrito */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "0 16px 26px",
              zIndex: 5,
              margin: "0 auto",
              maxWidth: 480,
            }}
          >
            <Link
              href="/carrito"
              className="cp-touchable"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                border: "none",
                cursor: "pointer",
                borderRadius: "calc(var(--cp-btn-radius) + 4px)",
                background: "var(--cp-primary)",
                color: "var(--cp-on-primary)",
                boxShadow: "var(--cp-shadow-lg)",
                padding: "14px 18px",
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon name="bag" size={24} />
                <motion.span
                  key={count}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  style={{
                    position: "absolute",
                    top: -7,
                    right: -9,
                    background: "var(--cp-accent)",
                    color: "var(--cp-on-accent)",
                    fontSize: 11,
                    fontWeight: 800,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {count}
                </motion.span>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  flex: 1,
                  textAlign: "left",
                }}
              >
                Ver carrito
              </span>
              <span style={{ fontWeight: 800, fontSize: 16 }}>
                {formatEur(subtotal)}
              </span>
              <Icon name="chevron" size={20} stroke={2.4} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  );
}

function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: IconName;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 10,
      }}
    >
      {icon && <Icon name={icon} size={18} color="var(--cp-coral)" />}
      <h2
        className="cp-display"
        style={{
          fontSize: 21,
          color: "var(--cp-ink)",
          margin: 0,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

/* FeaturedCard — desactivado junto con "Lo más pedido hoy"
function FeaturedCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      style={{
        width: 168,
        flexShrink: 0,
        textAlign: "left",
        background: "var(--cp-surface)",
        borderRadius: "var(--cp-card-radius)",
        padding: 10,
        boxShadow: "var(--cp-shadow-sm)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ position: "relative" }}>
        <ProductImage icon={categoryIcon(product.categoria)} height={104} />
        {product.tag && (
          <div style={{ position: "absolute", top: 8, left: 8 }}>
            <Tag>{product.tag}</Tag>
          </div>
        )}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "var(--cp-ink)",
          marginTop: 9,
        }}
      >
        {product.nombre}
      </div>
      <div
        style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 3 }}
      >
        <span
          style={{ fontWeight: 800, fontSize: 16, color: "var(--cp-primary)" }}
        >
          {product.precio}€
        </span>
        <span style={{ fontSize: 12.5, color: "var(--cp-ink-faint)" }}>
          / día
        </span>
      </div>
    </Link>
  );
}
*/

function ProductRow({
  product,
  qtyInCart,
  index = 0,
}: {
  product: CatalogProduct;
  qtyInCart: number;
  index?: number;
}) {
  const outOfStock = product.disponible === 0;
  const lastUnit =
    !outOfStock &&
    product.disponible === 1;
  const agotandose =
    !outOfStock &&
    !lastUnit &&
    product.totalCargado != null &&
    product.totalCargado > 0 &&
    product.disponible != null &&
    product.disponible <= product.totalCargado * 0.5;

  return (
    <div style={{ opacity: outOfStock ? 0.5 : 1, transition: "opacity .2s" }}>
    <Link
      href={`/producto/${product.slug}`}
      className="cp-touchable cp-anim-list-item"
      style={{
        width: "100%",
        textAlign: "left",
        background: "var(--cp-surface)",
        borderRadius: "var(--cp-card-radius)",
        padding: 10,
        display: "flex",
        gap: 13,
        alignItems: "center",
        boxShadow: "var(--cp-shadow-sm)",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        "--i": Math.min(index, 8),
      } as React.CSSProperties}
    >
      <div style={{ width: 84, height: 84, flexShrink: 0 }}>
        <ProductImage icon={categoryIcon(product.categoria)} height={84} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{ fontWeight: 700, fontSize: 16, color: "var(--cp-ink)" }}
          >
            {product.nombre}
          </span>
          {product.tag && <Tag>{product.tag}</Tag>}
        </div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.4,
            color: "var(--cp-ink-soft)",
            margin: "4px 0 0",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.descripcion}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
            marginTop: 7,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 17,
              color: "var(--cp-primary)",
            }}
          >
            {product.precio}€
          </span>
          <span style={{ fontSize: 12.5, color: "var(--cp-ink-faint)" }}>
            / día
          </span>
          {outOfStock && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--cp-coral)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Sin stock
            </span>
          )}
          {lastUnit && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--cp-coral)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              ¡Última unidad!
            </span>
          )}
          {agotandose && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "#D97706",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              ¡Agotándose!
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          flexShrink: 0,
          background: qtyInCart
            ? "var(--cp-primary)"
            : "var(--cp-surface-alt)",
          color: qtyInCart ? "var(--cp-on-primary)" : "var(--cp-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-end",
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        {qtyInCart > 0 ? qtyInCart : <Icon name="plus" size={20} stroke={2.4} />}
      </div>
    </Link>
    </div>
  );
}
