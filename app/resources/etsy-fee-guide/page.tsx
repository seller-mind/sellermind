import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Etsy Fee Calculator Guide 2026 | SellerMind",
  description:
    "Download the ultimate guide to Etsy fees. Learn about all 7 fee types, calculate your true profit margin, and price your products for maximum profit.",
  openGraph: {
    title: "Free Etsy Fee Calculator Guide 2026 | SellerMind",
    description:
      "The complete 20-page guide to Etsy fees, profit margins, and pricing strategies. Download free.",
    url: "https://thesellermind.com/resources/etsy-fee-guide",
    siteName: "SellerMind",
    type: "website",
  },
};

export default function EtsyFeeGuidePage() {
  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-[#1B4332] text-[#B7E4C7] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider">
            SELLERMIND
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#1B4332] text-center leading-tight mb-3">
          The Ultimate Etsy Fee Calculator Guide 2026
        </h1>
        <p className="text-lg text-[#2D6A4F] text-center mb-8 max-w-2xl mx-auto">
          Stop losing money on Etsy fees. Download the free 20-page guide and price
          your products for profit.
        </p>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
          {/* Text side */}
          <div className="flex-1">
            <ul className="space-y-3">
              {[
                "Complete breakdown of all 7 Etsy fee types with 2026 rates",
                "Profit margin calculator with step-by-step pricing formulas",
                "3 real case studies showing how sellers increased profits by 40-70%",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px]">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#D8F3DC] text-[#1B4332] rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-500 text-sm mt-4">
              📄 20 pages · 📊 Fee reference tables · 🧮 Pricing templates
            </p>
          </div>

          {/* Book preview */}
          <div className="flex-1 flex justify-center">
            <div
              className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-xl p-8 text-white max-w-[300px] shadow-2xl"
              style={{ transform: "perspective(800px) rotateY(-5deg)" }}
            >
              <span className="inline-block bg-[#52B788] text-white px-3 py-1 rounded-full text-xs font-semibold">
                FREE GUIDE
              </span>
              <h3 className="text-lg font-bold mt-3 mb-2">
                The Ultimate Etsy Fee Calculator Guide 2026
              </h3>
              <p className="text-sm opacity-80 mb-4">
                Everything about Etsy fees, profit margins & smart pricing
              </p>
              <p className="text-xs opacity-50">By SellerMind · 20 Pages</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-2">
            Get Your Free Copy
          </h2>
          <p className="text-gray-500 mb-6">
            Enter your email and we&apos;ll send the PDF instantly.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3.5 border-2 border-[#D8F3DC] rounded-xl text-base outline-none focus:border-[#52B788] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#1B4332] text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-[#2D6A4F] transition-colors whitespace-nowrap cursor-pointer"
            >
              Download Free Guide →
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            🔒 No spam. Unsubscribe anytime. Your email stays safe.
          </p>
        </div>

        {/* Social Proof */}
        <p className="text-center text-gray-500 text-sm pb-6">
          Join <strong className="text-[#1B4332]">2,400+ Etsy sellers</strong>{" "}
          who&apos;ve already downloaded this guide
        </p>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Made by{" "}
            <a
              href="https://thesellermind.com"
              className="text-[#2D6A4F] hover:underline"
            >
              SellerMind
            </a>{" "}
            — Free Etsy fee calculator & profit analyzer
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2026 SellerMind. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
