import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LavasaCare — Local Healthcare Services in Lavasa, Maharashtra",
  description:
    "LavasaCare helps residents and visitors in Lavasa, Maharashtra discover participating healthcare providers and request services: appointments, medicine delivery, health checkup packages, bed availability and more.",
  keywords: [
    "LavasaCare",
    "Lavasa healthcare",
    "appointment booking",
    "medicine delivery",
    "health checkup packages",
    "bed availability",
  ],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "LavasaCare — Local Healthcare Services Platform",
    description:
      "Discover participating hospitals, clinics, pharmacies, labs and ambulance providers in Lavasa, Maharashtra.",
    siteName: "LavasaCare",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#227454",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
