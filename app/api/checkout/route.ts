import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isClerkConfigured } from '@/lib/clerk-helpers'

// Safe auth function that handles Clerk not configured
async function getUserId(): Promise<string | null> {
  if (!isClerkConfigured()) {
    return null
  }
  try {
    const { userId } = auth()
    return userId
  } catch (error) {
    console.warn('Clerk auth error:', error)
    return null
  }
}

// Creem API helper - following official docs: https://docs.creem.io/features/checkout/checkout-api
async function createCreemCheckout(params: {
  productId: string
  requestId: string
  successUrl: string
  userId: string
}) {
  const apiKey = process.env.CREEM_API_KEY
  if (!apiKey) {
    throw new Error('Creem API key not configured')
  }

  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://api.creem.io'
    : 'https://test-api.creem.io'

  const response = await fetch(`${baseUrl}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: params.productId,
      request_id: params.requestId,
      success_url: params.successUrl,
      metadata: {
        user_id: params.userId,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Creem checkout API error:', data)
    throw new Error(data.message || 'Failed to create checkout session')
  }

  return {
    checkoutId: data.id,
    checkoutUrl: data.checkout_url,
  }
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (isClerkConfigured() && !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let productId: string
  try {
    const body = await request.json()
    // Accept both 'productId' and 'variantId' for compatibility
    productId = body.productId || body.variantId || ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Map plan names to Creem product IDs
  const productIdMap: Record<string, string> = {
    monthly: process.env.CREEM_PRODUCT_ID_MONTHLY || '',
    yearly: process.env.CREEM_PRODUCT_ID_YEARLY || '',
  }

  const creemProductId = productIdMap[productId] || productId

  if (!creemProductId) {
    return NextResponse.json(
      { error: 'Invalid product selection' },
      { status: 400 }
    )
  }

  if (!process.env.CREEM_API_KEY) {
    console.error('Creem API key not configured')
    return NextResponse.json(
      { error: 'Payment service not configured' },
      { status: 500 }
    )
  }

  try {
    const siteUrl = process.env.SITE_URL || 'https://thesellermind.com'
    const checkout = await createCreemCheckout({
      productId: creemProductId,
      requestId: `sellermind_${userId || 'anon'}_${Date.now()}`,
      successUrl: `${siteUrl}/pricing?checkout=success`,
      userId: userId || 'anonymous',
    })

    if (!checkout.checkoutUrl) {
      throw new Error('No checkout URL returned from Creem')
    }

    return NextResponse.json({ url: checkout.checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
