import { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing - SellerMind',
  description: 'Choose the plan that fits your Etsy business. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  return <PricingClient />
}
