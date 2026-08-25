import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileStickyCta from "@/components/MobileStickyCta";
import { siteConfig } from "@/lib/site";
import { getSeo } from "@/lib/seo";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const homeSeo = getSeo("/");

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: homeSeo.title,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: homeSeo.description,
  openGraph: {
    title: homeSeo.title,
    description: homeSeo.description,
    type: "website",
    locale: "ja_JP",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.siteName,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  areaServed: "JP",
  address: {
    "@type": "PostalAddress",
    addressRegion: "栃木県",
    addressCountry: "JP",
  },
  sameAs: [siteConfig.lineUrl],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <div className="h-16 sm:hidden" aria-hidden="true" />
        <MobileStickyCta />
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${siteConfig.webAnalyticsToken}"}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
