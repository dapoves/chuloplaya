import { CartProvider } from "./_components/cart-provider";
import { PwaRegister } from "./_components/pwa-register";
import { SessionInit } from "./_components/session-init";

export default function ClienteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-theme="costa"
      className="min-h-dvh"
      style={{ background: "var(--cp-bg)" }}
    >
      <SessionInit />
      <PwaRegister />
      <CartProvider>
        <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
          {children}
        </div>
      </CartProvider>
    </div>
  );
}
