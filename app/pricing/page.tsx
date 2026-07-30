import { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing - SellerMind',
  description: 'Choose the plan that fits your Etsy business. Start free, upgrade when you need more.',
  alternates: { canonical: 'https://thesellermind.com/pricing' },
  openGraph: {
    title: 'Pricing - SellerMind',
    description: 'Choose the plan that fits your Etsy business. Start free, upgrade when you need more.',
    url: 'https://thesellermind.com/pricing',
    type: 'website',
    siteName: 'SellerMind',
    images: [{ url: 'https://thesellermind.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - SellerMind',
    description: 'Choose the plan that fits your Etsy business. Start free, upgrade when you need more.',
    images: ['https://thesellermind.com/og-image.png'],
  },
}

export default function PricingPage() {
  return <PricingClient />
}
