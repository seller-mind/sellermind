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
    // Creem uses 'eventType' field for event type
    const eventType = event.eventType
    const eventData = event.object || event.data || event

    // Filter: only process events for SellerMind products
    const productId =
      eventData?.product?.id ||
      eventData?.product_id ||
      eventData?.product

    const sellerMindProductIds = [
      process.env.CREEM_PRODUCT_ID_MONTHLY,
      process.env.CREEM_PRODUCT_ID_YEARLY,
    ].filter(Boolean)

    if (
      productId &&
      sellerMindProductIds.length > 0 &&
      !sellerMindProductIds.includes(productId)
    ) {
      // Not a SellerMind product event, skip
      return NextResponse.json({ received: true, skipped: true })
    }

    // Extract user_id from metadata
    const userId =
      eventData?.metadata?.user_id ||
      eventData?.custom_data?.user_id ||
      eventData?.metadata?.userId
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

    switch (eventType) {
      case 'checkout.completed': {
        // A checkout was completed - activate subscription
        const planProductId =
          eventData?.product?.id || eventData?.product_id || ''
        const isMonthly =
          planProductId === process.env.CREEM_PRODUCT_ID_MONTHLY
        const planName = isMonthly ? 'Pro Monthly' : 'Pro Yearly'

        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            subscriptionPlan: planName,
            creemCheckoutId: eventData?.id,
            creemCustomerId:
              eventData?.customer?.id || eventData?.customer_id,
            currentPeriodEnd:
              eventData?.billing_period?.end ||
              eventData?.current_period_end_date,
          },
        })
        console.log(
          `Checkout completed for user ${userId}: ${planName}`
        )
        break
      }

      case 'subscription.active': {
        // New subscription created
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            creemSubscriptionId: eventData?.id,
            creemCustomerId:
              eventData?.customer?.id || eventData?.customer_id,
            currentPeriodEnd:
              eventData?.current_period_end_date,
          },
        })
        console.log(`Subscription activated for user ${userId}`)
        break
      }

      case 'subscription.paid': {
        // Recurring payment processed - extend access
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            currentPeriodEnd:
              eventData?.current_period_end_date,
          },
        })
        console.log(`Subscription payment received for user ${userId}`)
        break
      }

      case 'subscription.update': {
        // Subscription modified
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            currentPeriodEnd:
              eventData?.current_period_end_date,
          },
        })
        console.log(`Subscription updated for user ${userId}`)
        break
      }

      case 'subscription.canceled': {
        // Subscription canceled - access continues until period end
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'cancelled',
            cancelAtPeriodEnd:
              eventData?.current_period_end_date ||
              new Date().toISOString(),
          },
        })
        console.log(`Subscription cancelled for user ${userId}`)
        break
      }

      case 'subscription.expired': {
        // Subscription expired - payment retries may happen
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'expired',
          },
        })
        console.log(`Subscription expired for user ${userId}`)
        break
      }

      case 'subscription.paused': {
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'paused',
          },
        })
        console.log(`Subscription paused for user ${userId}`)
        break
      }

      case 'refund.created': {
        // Refund processed - may need to revoke access
        console.log(`Refund created for user ${userId}`)
        break
      }

      case 'dispute.created': {
        console.log(`Dispute/chargeback for user ${userId}`)
        break
      }

      default:
        console.log('Unhandled Creem webhook event:', eventType)
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
