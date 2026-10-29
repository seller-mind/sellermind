import type { Metadata, Viewport } from "next";
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
  // SM-07 fix (2026-10-28 QA): /favicon.ico and /apple-touch-icon.png were both
  // 404. Modern browsers honour the declared SVG, so nothing was visibly broken,
  // but RSS readers, some crawlers and the bare-path request all fall back to
  // /favicon.ico. Both files now exist, and are declared here as explicit
  // fallbacks ahead of the SVG so the request never reaches a 404.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
    ],
  },
};

// Copy fix (2026-10-29 audit): the previous descriptions described products that
// do not exist. PodCrisp is a summarization and knowledge-base tool, not a
// transcript / show-notes / chapters product. SaaSLaunch is a Chrome-extension
// starter kit on Cloudflare Workers + Dodo Payments, not a Next.js boilerplate.
const OTHER_TOOLS = [
  {
    name: "PodCrisp",
    url: "https://podcrisp.com",
    description: "AI podcast summary tool — turn episodes into notes you keep",
  },
  {
    name: "SaaSLaunch",
    url: "https://saaslaunch.dev",
    description: "Chrome-extension SaaS starter kit — extension, worker and billing in one repo",
  },
  {
    name: "Parcelglance",
    url: "https://parcelglance.com",
    description: "AI order tracking widget for Shopify — cut WISMO emails 50%",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

        {/* Cross-linking footer — Other Tools */}
        <section
          style={{
            padding: "48px 0",
            background: "#FAFAF8",
            borderTop: "1px solid #E8E5E0",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#8B8680",
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              Other Tools
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {OTHER_TOOLS.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="other-tool-card"
                  style={{
                    width: "180px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #E8E5E0",
                    background: "#FFFFFF",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1A1410",
                      marginBottom: "4px",
                    }}
                  >
                    {tool.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8B8680", lineHeight: "1.5" }}>
                    {tool.description}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Global Disclaimer Footer */}
        <footer className="border-t border-border bg-background-secondary/50 mt-0">
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
