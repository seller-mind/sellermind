import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing - SellerMind',
  description: 'Choose the plan that fits your Etsy business. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  const handleSubscribe = async (variantId: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout. Please try again.')
      }
    } catch {
      alert('Failed to create checkout. Please try again.')
    }
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground-primary mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          Start with 3 free AI uses every month. Upgrade to Pro for unlimited access to all tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground-primary">Free</h2>
            <p className="text-4xl font-bold text-foreground-primary mt-2">$0<span className="text-lg font-normal text-foreground-muted">/month</span></p>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">3 AI uses per month</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">All SEO tools (unlimited)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Listing Generator</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Auto Reply</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Holiday Marketing</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Review Response</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Batch Optimization</span>
            </li>
          </ul>

          <Link
            href="/sign-up"
            className="block w-full py-3 px-4 text-center font-medium rounded-lg border border-border text-foreground-primary hover:bg-background-secondary transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-2xl border-2 border-[#E07A5F] p-8 shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#E07A5F] text-white text-sm font-medium px-4 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground-primary">Pro</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold text-foreground-primary">$19.99</span>
              <span className="text-foreground-muted">/month</span>
            </div>
            <p className="text-sm text-foreground-muted mt-1">or $199/year (save $40)</p>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#E07A5F] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary"><strong>Unlimited</strong> AI uses</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#E07A5F] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Everything in Free</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#E07A5F] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Priority support</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#E07A5F] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground-secondary">Early access to new features</span>
            </li>
          </ul>

          <div className="space-y-3">
            <button
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_MONTHLY || 'monthly')}
              className="w-full py-3 px-4 text-center font-medium rounded-lg bg-[#E07A5F] text-white hover:bg-[#d46a50] transition-colors"
            >
              Subscribe Monthly
            </button>
            <button
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_YEARLY || 'yearly')}
              className="w-full py-3 px-4 text-center font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Subscribe Yearly (Save $40)
            </button>
          </div>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="mt-12 max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800">7-Day Money-Back Guarantee</h3>
              <p className="text-green-700 text-sm">Not satisfied? Get a full refund within 7 days (for accounts with ≤10 AI uses).</p>
            </div>
          </div>
          <p className="text-sm text-green-700">
            <strong>EU Customers:</strong> You have 14 days to request a refund under EU consumer protection laws.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <details className="bg-white rounded-xl border border-border p-6 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>What counts as an "AI use"?</span>
              <svg className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-foreground-secondary">
              Each time you generate content using our AI tools (listing, reply, marketing, review, batch), it counts as one use. SEO tools like tag generator and SEO analyzer are always free and unlimited.
            </p>
          </details>

          <details className="bg-white rounded-xl border border-border p-6 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>Do unused uses roll over to the next month?</span>
              <svg className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-foreground-secondary">
              No, free uses reset on the 1st of each month and do not roll over. Upgrade to Pro for unlimited access.
            </p>
          </details>

          <details className="bg-white rounded-xl border border-border p-6 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>How do I cancel my subscription?</span>
              <svg className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-foreground-secondary">
              You can cancel anytime from your account settings. Your access continues until the end of your billing period.
            </p>
          </details>

          <details className="bg-white rounded-xl border border-border p-6 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>Can I get a refund?</span>
              <svg className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-foreground-secondary">
              Yes! We offer a 7-day money-back guarantee for accounts with 10 or fewer AI uses. EU customers have 14 days under consumer protection laws. Contact us through our support channels.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}
