import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Card PokeAPI",
  description: "Pokédex con data layer avanzado, filtros y detalle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main"
          className="skip-link fixed left-4 top-4 z-50 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white opacity-0 transition focus:opacity-100"
        >
          Saltar al contenido
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
