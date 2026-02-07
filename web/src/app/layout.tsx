import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic, Noto_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { isRTL, type Locale } from "@/i18n/config";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  
  return {
    title: t("title"),
    description: t("description"),
    keywords: ["immigration", "Netherlands", "AI assistant", "Dutch bureaucracy", "form filling"],
    authors: [{ name: "Zen & Magdy" }],
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "MigrantAI",
    },
    openGraph: {
      title: "MigrantAI",
      description: t("description"),
      type: "website",
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale() as Locale;
  const messages = await getMessages();
  const rtl = isRTL(locale);

  // Select appropriate font based on locale
  const fontClass = locale === 'ar' 
    ? notoArabic.variable 
    : locale === 'uk' 
      ? notoSans.variable 
      : inter.className;

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
      </head>
      <body className={`${fontClass} ${notoArabic.variable} ${notoSans.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegistration />
          <OfflineIndicator />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
