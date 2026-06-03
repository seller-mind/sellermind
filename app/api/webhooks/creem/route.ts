import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

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

  if (!verifyCreemSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody)
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
      return NextResponse.json({ received: true, skipped: true })
    }

    // Extract email from metadata or customer data
    const email =
      eventData?.metadata?.email ||
      eventData?.customer?.email ||
      eventData?.customer_email ||
      eventData?.custom_data?.email

    if (!email) {
      console.log('No email in webhook data, skipping')
      return NextResponse.json({ received: true })
    }

    const normalizedEmail = email.toLowerCase()
    const now = new Date().toISOString()

    switch (eventType) {
      case 'checkout.completed': {
        const planProductId = eventData?.product?.id || eventData?.product_id || ''
        const isMonthly = planProductId === process.env.CREEM_PRODUCT_ID_MONTHLY
        const planName = isMonthly ? 'Pro Monthly' : 'Pro Yearly'

        await supabaseAdmin
          .from('sellermind_users')
          .upsert({
            email: normalizedEmail,
            subscription_status: 'active',
            subscription_plan: planName,
            creem_checkout_id: eventData?.id,
            creem_customer_id: eventData?.customer?.id || eventData?.customer_id,
            current_period_end: eventData?.billing_period?.end || eventData?.current_period_end_date,
            updated_at: now,
          }, { onConflict: 'email' })

        console.log(`Checkout completed for ${normalizedEmail}: ${planName}`)
        break
      }

      case 'subscription.active': {
        await supabaseAdmin
          .from('sellermind_users')
          .upsert({
            email: normalizedEmail,
            subscription_status: 'active',
            creem_subscription_id: eventData?.id,
            creem_customer_id: eventData?.customer?.id || eventData?.customer_id,
            current_period_end: eventData?.current_period_end_date,
            updated_at: now,
          }, { onConflict: 'email' })

        console.log(`Subscription activated for ${normalizedEmail}`)
        break
      }

      case 'subscription.paid': {
        await supabaseAdmin
          .from('sellermind_users')
          .update({
            subscription_status: 'active',
            current_period_end: eventData?.current_period_end_date,
            updated_at: now,
          })
          .eq('email', normalizedEmail)

        console.log(`Subscription payment received for ${normalizedEmail}`)
        break
      }

      case 'subscription.update': {
        await supabaseAdmin
          .from('sellermind_users')
          .update({
            subscription_status: 'active',
            current_period_end: eventData?.current_period_end_date,
            updated_at: now,
          })
          .eq('email', normalizedEmail)

        console.log(`Subscription updated for ${normalizedEmail}`)
        break
      }

      case 'subscription.canceled': {
        await supabaseAdmin
          .from('sellermind_users')
          .update({
            subscription_status: 'cancelled',
            current_period_end: eventData?.current_period_end_date || now,
            updated_at: now,
          })
          .eq('email', normalizedEmail)

        console.log(`Subscription cancelled for ${normalizedEmail}`)
        break
      }

      case 'subscription.expired': {
        await supabaseAdmin
          .from('sellermind_users')
          .update({
            subscription_status: 'expired',
            updated_at: now,
          })
          .eq('email', normalizedEmail)

        console.log(`Subscription expired for ${normalizedEmail}`)
        break
      }

      case 'subscription.paused': {
        await supabaseAdmin
          .from('sellermind_users')
          .update({
            subscription_status: 'paused',
            updated_at: now,
          })
          .eq('email', normalizedEmail)

        console.log(`Subscription paused for ${normalizedEmail}`)
        break
      }

      case 'refund.created': {
        console.log(`Refund created for ${normalizedEmail}`)
        break
      }

      case 'dispute.created': {
        console.log(`Dispute/chargeback for ${normalizedEmail}`)
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
