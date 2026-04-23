import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import { OrganizationSchema, WebSiteSchema } from "@/components/ui/structured-data";
import { siteConfig } from "@/content/site";
import "./globals.css";

// ─── Fonts ──────────────────────────────────────────────────
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// ─── Metadata ───────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Shasvata | Long-Horizon Sustainability Intelligence",
    template: "%s | Shasvata",
  },
  description:
    "Shasvata is building a long-horizon sustainability intelligence platform, beginning with ICCAA and the infrastructure around accountable climate research.",
  keywords: [
    "sustainability intelligence",
    "climate accountability",
    "iccaa",
    "environmental research",
    "shasvata",
    "Shasvata",
  ],
  authors: [{ name: "Shasvata" }],
  creator: "Shasvata",
  publisher: "Shasvata",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Shasvata",
    title: "Shasvata | Long-Horizon Sustainability Intelligence",
    description:
      "A new sustainability intelligence platform, with ICCAA live first and the broader Shasvata operating system rolling out around it.",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Shasvata — Long-Horizon Sustainability Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shasvata | Sustainability Intelligence",
    description: "Shasvata is building infrastructure for long-horizon climate research and accountable intelligence.",
    images: ["/og-default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/logo-icon.png", sizes: "any" },
    ],
    apple: "/logo-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c130f",
  width: "device-width",
  initialScale: 1,
};

// ─── Layout ─────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable}`}
    >
      <body className="font-sans antialiased">
        <OrganizationSchema />
        <WebSiteSchema />
        {children}
      </body>
    </html>
  );
}
