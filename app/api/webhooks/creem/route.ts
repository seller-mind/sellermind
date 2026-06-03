import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { isClerkConfigured } from '@/lib/clerk-helpers'

// Verify Creem webhook signature with timing-safe comparison
function verifyCreemSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('CREEM_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const signature = request.headers.get('creem-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await request.text()

  // Verify webhook signature
  if (!verifyCreemSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody)
    const { type, data } = event

    // Extract user_id from metadata
    const userId = data?.metadata?.user_id || data?.custom_data?.user_id
    if (!userId || userId === 'anonymous') {
      console.log('No user_id in webhook data, skipping Clerk update')
      return NextResponse.json({ received: true })
    }

    // Only update Clerk if it's properly configured
    if (!isClerkConfigured()) {
      console.log('Clerk not configured, skipping user metadata update')
      return NextResponse.json({ received: true })
    }

    // Dynamically import Clerk to avoid errors when not configured
    const { clerkClient } = await import('@clerk/nextjs/server')
    const client = await clerkClient()

    switch (type) {
      case 'checkout.completed': {
        // A checkout was completed - activate subscription
        const productId = data?.product_id || ''
        const isMonthly = productId === process.env.CREEM_PRODUCT_ID_MONTHLY
        const planName = isMonthly ? 'Pro Monthly' : 'Pro Yearly'

        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            subscriptionPlan: planName,
            creemCheckoutId: data?.id,
            creemCustomerId: data?.customer_id,
            currentPeriodEnd: data?.billing_period?.end,
          },
        })
        console.log(`Subscription activated for user ${userId}: ${planName}`)
        break
      }

      case 'subscription.created': {
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            creemSubscriptionId: data?.id,
            creemCustomerId: data?.customer_id,
            currentPeriodEnd: data?.billing_period?.end,
          },
        })
        console.log(`Subscription created for user ${userId}`)
        break
      }

      case 'subscription.updated': {
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            currentPeriodEnd: data?.billing_period?.end,
          },
        })
        console.log(`Subscription updated for user ${userId}`)
        break
      }

      case 'subscription.cancelled': {
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'cancelled',
            cancelAtPeriodEnd: data?.cancellation?.at_period_end
              ? data?.billing_period?.end
              : new Date().toISOString(),
          },
        })
        console.log(`Subscription cancelled for user ${userId}`)
        break
      }

      case 'subscription.expired': {
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'expired',
          },
        })
        console.log(`Subscription expired for user ${userId}`)
        break
      }

      case 'payment.succeeded': {
        console.log(`Payment succeeded for user ${userId}`)
        // Payment success is already handled by subscription events
        break
      }

      case 'payment.failed': {
        console.log(`Payment failed for user ${userId}`)
        // Don't immediately cancel - let the subscription events handle it
        break
      }

      default:
        console.log('Unhandled Creem webhook event type:', type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Creem webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
