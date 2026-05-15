import type { Metadata, Viewport } from "next";
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
  title: "CAVO",
  description:
    "Premium faith streetwear brand. Faith Archives graphic tee & Essentials basic tee. Cotton Australia 250 Coolbreeze. Limited to 21 pieces.",
  keywords:
    "CAVO, faith streetwear, christian clothing, oversized t-shirt, faith archives, essentials, basic tee",
  authors: [{ name: "CAVO" }],
  creator: "CAVO",
  publisher: "CAVO",
  openGraph: {
    title: "CAVO — Ordinary People. Extraordinary Calling.",
    description:
      "DROP 01: THE CALLING. Faith Archives + Essentials. Limited to 21 pieces.",
    url: "https://cavo.vercel.app",
    siteName: "CAVO",
    images: [
      {
        url: "/models/logo.png",
        width: 1200,
        height: 630,
        alt: "CAVO",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAVO",
    description: "Ordinary people. Extraordinary calling.",
    images: ["/models/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
