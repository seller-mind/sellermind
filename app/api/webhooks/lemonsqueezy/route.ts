import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-signature')

  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error('LemonSqueezy webhook secret not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const hmac = createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
  hmac.update(body)
  const digest = hmac.digest('hex')

  if (signature !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(body)
    const { meta, data } = event
    const type = meta?.event_name

    if (!type) {
      return NextResponse.json({ error: 'No event type' }, { status: 400 })
    }

    const userId = data?.attributes?.custom_data?.user_id
    if (!userId) {
      console.log('No user_id in webhook, skipping')
      return NextResponse.json({ received: true })
    }

    const client = await clerkClient()

    switch (type) {
      case 'subscription_created':
      case 'subscription_updated':
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'active',
            lemonSubscriptionId: data.id,
            lemonCustomerId: data.attributes.customer_id,
            lemonPlan: data.attributes.first_subscription_item?.variant_name || 'Pro',
            currentPeriodEnd: data.attributes.renews_at,
          },
        })
        break

      case 'subscription_cancelled':
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'cancelled',
            cancelAtPeriodEnd: data.attributes.ends_at,
          },
        })
        break

      case 'subscription_expired':
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            subscriptionStatus: 'expired',
          },
        })
        break

      case 'subscription_payment_failed':
        console.log('Subscription payment failed for user:', userId)
        break

      default:
        console.log('Unhandled webhook event type:', type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
