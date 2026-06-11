import type { Metadata } from "next";
import { Geist, Geist_Mono, Gabarito, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gabarito = Gabarito({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Chulo Playa",
  description: "Alquiler de material de playa en el Puerto de Sagunto",
  manifest: "/manifest.webmanifest",
  applicationName: "Chulo Playa",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chulo Playa",
  },
};

export const viewport = {
  themeColor: "#0A6E9E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${gabarito.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
