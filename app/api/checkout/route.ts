import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { variantId } = await request.json()
  
  if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID) {
    console.error('LemonSqueezy environment variables not configured')
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
  }

  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY })

  try {
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID,
      variantId,
      {
        checkoutData: {
          custom: { user_id: userId },
        },
      }
    )

    if (!checkout.data?.attributes?.url) {
      throw new Error('No checkout URL returned')
    }

    return NextResponse.json({ url: checkout.data.attributes.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
