import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header, MobileNav } from "@/components/shared/Header";
import { CookieConsentBanner } from "@/components/shared/CookieConsentBanner";
import { UsageBanner } from "@/components/shared/UsageBanner";

export const viewport: Viewport = {
  themeColor: "#E07A5F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
  return (
    <ClerkProvider>
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
                  SellerMind is not responsible for any outcomes resulting from the use of AI-generated content. The tool is provided "as is" without warranties of any kind.
                </p>
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
    </ClerkProvider>
  );
}
