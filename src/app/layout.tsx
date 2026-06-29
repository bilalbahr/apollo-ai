import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Apollo — Crop stress detection",
  description: "Find crop stress before the eye can. AI-powered leaf and field diagnostics for precision agriculture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans ${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
