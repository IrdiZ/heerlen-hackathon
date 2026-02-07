import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MigrantAI - Your Guide to the Netherlands",
  description: "Voice-first AI assistant helping immigrants navigate Dutch bureaucracy in any language",
  keywords: ["immigration", "Netherlands", "AI assistant", "Dutch bureaucracy", "form filling"],
  authors: [{ name: "Zen & Magdy" }],
  openGraph: {
    title: "MigrantAI",
    description: "Your voice, your language, your guide to the Netherlands",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
