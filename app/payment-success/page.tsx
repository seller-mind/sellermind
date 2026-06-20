import { Metadata } from 'next'
import PaymentSuccessClient from './PaymentSuccessClient'

export const metadata: Metadata = {
  title: 'Payment Successful - SellerMind',
  description: 'Thank you for subscribing to SellerMind Pro.',
  robots: { index: false, follow: false },
}

export default function PaymentSuccessPage() {
  return <PaymentSuccessClient />
}
