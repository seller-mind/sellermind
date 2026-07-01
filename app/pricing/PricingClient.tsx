'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PricingClient() {
  const [email, setEmail] = useState('')
  const [savedEmail, setSavedEmail] = useState('')

  useEffect(() => {
    // Load saved email from localStorage
    const stored = localStorage.getItem('sellermind_email')
    if (stored) {
      setEmail(stored)
      setSavedEmail(stored)
    }
  }, [])

  const saveEmail = () => {
    if (email && email.includes('@')) {
      localStorage.setItem('sellermind_email', email.toLowerCase())
      setSavedEmail(email.toLowerCase())
    }
  }

  // Dodo Payments direct checkout (replaces /api/checkout flow on 2026-06-15)
  const DODO_CHECKOUT_URLS: Record<string, string> = {
    monthly:
      'https://checkout.dodopayments.com/buy/pdt_0Nh4as9LEJmfoZNpeaHC6?quantity=1&redirect_url=https://thesellermind.com/payment-success',
    yearly:
      'https://checkout.dodopayments.com/buy/pdt_0Nh4asKyfYxPzDnExvRVo?quantity=1&redirect_url=https://thesellermind.com/payment-success',
  }

  const handleSubscribe = (planId: string) => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address first.')
      return
    }
    const target = DODO_CHECKOUT_URLS[planId]
    if (!target) {
      alert('Invalid plan selected.')
      return
    }
    const normalized = email.toLowerCase()
    // Persist email so post-checkout return can re-link the session
    localStorage.setItem('sellermind_email', normalized)
    setSavedEmail(normalized)
    // Pre-fill email on Dodo checkout page (Dodo accepts ?email= in URL)
    const url = `${target}&email=${encodeURIComponent(normalized)}`
    window.location.href = url
  }

  // Check for checkout success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      const emailParam = params.get('email')
      if (emailParam) {
        localStorage.setItem('sellermind_email', emailParam.toLowerCase())
        setEmail(emailParam.toLowerCase())
        setSavedEmail(emailParam.toLowerCase())
      }
      // Clean up URL
      window.history.replaceState({}, '', '/pricing')
    }
  }, [])

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground-primary mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          Start with 3 free AI uses every month across all 10 tools. Upgrade to Pro for unlimited access.
        </p>
      </div>

      {/* Email Input Section */}
      <div className="max-w-md mx-auto mb-12 px-4">
        <div className="bg-white rounded-xl border border-border p-6">
          <label htmlFor="email" className="block text-sm font-medium text-foreground-primary mb-2">
            Your Email Address
          </label>
          <div className="flex gap-2">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={saveEmail}
              disabled={!email || !email.includes('@') || email.toLowerCase() === savedEmail}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
          {savedEmail && (
            <p className="mt-2 text-xs text-foreground-muted">
              ✓ Using {savedEmail} — your free uses are tracked by this email.
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground-primary">Free</h2>
            <p className="text-4xl font-bold text-foreground-primary mt-2">
              $0<span className="text-lg font-normal text-foreground-muted">/month</span>
            </p>
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
              <span className="text-foreground-secondary">Access to all 10 AI tools</span>
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

          <div className="space-y-3">
            <Link
              href="/tools"
              className="block w-full py-3 px-4 text-center font-medium rounded-lg bg-white text-[#E07A5F] border-2 border-[#E07A5F] hover:bg-[#E07A5F]/5 transition-colors"
            >
              Start Free →
            </Link>
            <p className="text-xs text-center text-foreground-muted">
              No signup · Uses tracked by email
            </p>
          </div>
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
              onClick={() => handleSubscribe('monthly')}
              className="w-full py-3 px-4 text-center font-medium rounded-lg bg-[#E07A5F] text-white hover:bg-[#d46a50] transition-colors"
            >
              Subscribe Monthly
            </button>
            <button
              onClick={() => handleSubscribe('yearly')}
              className="w-full py-3 px-4 text-center font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Subscribe Yearly (Save $40)
            </button>
          </div>
        </div>
      </div>


      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <details className="bg-white rounded-xl border border-border p-6 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>Do I need to create an account?</span>
              <svg className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-foreground-secondary">
              No! Just enter your email and start using the tools. Your email is used to track your free usage and link your Pro subscription — no password needed.
            </p>
          </details>

          <details className="bg-white rounded-xl border border-border p-6 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              <span>What counts as an &quot;AI use&quot;?</span>
              <svg className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-foreground-secondary">
              Each time you generate content using any of our AI tools (listing, tag generator, SEO analyzer, reply, marketing, review, batch, etc.), it counts as one use. All 10 AI tools share the same 3 free uses per month.
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
              You can cancel anytime. Contact us at support and your access continues until the end of your billing period.
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
              You can cancel your subscription at any time. EU/EEA customers also have a statutory 14-day right of withdrawal under EU Consumer Rights Directive 2011/83/EU. Outside of statutory rights, refunds are at our sole discretion.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}
