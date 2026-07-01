import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { Header, MobileNav } from "@/components/shared/Header";
import { CookieConsentBanner } from "@/components/shared/CookieConsentBanner";
import { UsageBanner } from "@/components/shared/UsageBanner";

// F-UX-06 fix: removed `maximumScale: 1` (WCAG 2.1 SC 1.4.4 Resize Text).
// Users must be able to pinch-zoom on mobile; blocking it fails Level AA a11y
// and creates EAA/ADA compliance risk. If any layout breaks under zoom, fix
// it in CSS (overflow-x, min-width) — do not disable user scaling.
export const viewport: Viewport = {
  themeColor: "#E07A5F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SellerMind - Your AI Partner for Thriving Etsy Shop",
  description:
    "AI-powered tools for Etsy sellers: generate optimized listings, craft customer replies, create holiday marketing copy, handle negative reviews, and batch optimize your entire shop.",
  keywords: [
    "Etsy",
    "AI",
    "listing generator",
    "Etsy seller tools",
    "Etsy marketing",
    "customer service",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SellerMind",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CSP nonce injected by middleware.ts (2026-07-01 P3 fix). Reading the
  // header via next/headers() has two effects:
  //   (1) it opts this layout into dynamic rendering, which is required
  //       for the nonce to be fresh on every request;
  //   (2) it signals Next.js to auto-apply the nonce attribute to all of
  //       its own framework-injected hydration <script> tags.
  // We ALSO thread the nonce through any manually-authored <script> below
  // (currently: SW registration) so those are accepted by the CSP too.
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SellerMind" />
      </head>
      <body className="min-h-screen bg-background-primary antialiased">
        <Header />
        <UsageBanner />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />

        {/* Global Disclaimer Footer */}
        <footer className="border-t border-border bg-background-secondary/50 mt-8">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center space-y-3">
              <p className="text-sm text-foreground-muted">
                <strong>SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc.</strong> Etsy is a trademark of Etsy, Inc.
              </p>
              <p className="text-xs text-foreground-muted">
                AI-generated content is for reference only. Please review and edit before publishing on your shop.
              </p>
              <p className="text-xs text-foreground-muted">
                SellerMind is not responsible for any outcomes resulting from the use of AI-generated content. The tool is provided &quot;as is&quot; without warranties of any kind.
              </p>
              {/* Legal page links */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
                <Link href="/blog" className="text-xs text-foreground-muted hover:text-primary transition-colors">
                  Blog
                </Link>
                <span className="text-xs text-foreground-muted">|</span>
                <Link href="/pricing" className="text-xs text-foreground-muted hover:text-primary transition-colors">
                  Pricing
                </Link>
                <span className="text-xs text-foreground-muted">|</span>
                <Link href="/privacy" className="text-xs text-foreground-muted hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-xs text-foreground-muted">|</span>
                <Link href="/terms" className="text-xs text-foreground-muted hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <span className="text-xs text-foreground-muted">|</span>
                <Link href="/dmca" className="text-xs text-foreground-muted hover:text-primary transition-colors">
                  DMCA Policy
                </Link>
                {/* F-003 fix: /cookies page existed as an orphan (canonical
                    declared but no inbound link). Adding footer entry so both
                    users and crawlers can reach it. */}
                <span className="text-xs text-foreground-muted">|</span>
                <Link href="/cookies" className="text-xs text-foreground-muted hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <CookieConsentBanner />

        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
