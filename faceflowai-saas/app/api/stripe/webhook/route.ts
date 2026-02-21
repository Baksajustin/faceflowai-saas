import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const signature = headers().get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    console.log("Stripe webhook received:", event.type)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed", message: error.message },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata

  if (!metadata?.userId) {
    console.error("No userId in session metadata")
    return
  }

  const userId = metadata.userId

  // Handle credit purchase
  if (metadata.type === "credits" && metadata.credits) {
    const creditsToAdd = parseInt(metadata.credits)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          creditsBalance: { increment: creditsToAdd },
          creditsTotal: { increment: creditsToAdd },
        },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount: creditsToAdd,
          type: "purchase",
          description: `Purchased ${creditsToAdd} credits`,
          stripePaymentId: session.payment_intent as string,
        },
      }),
    ])

    console.log(`Added ${creditsToAdd} credits to user ${userId}`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error("User not found for customer:", customerId)
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id

  // Determine plan tier
  let tier = "pro"
  const plan = subscription.metadata?.planId
  if (plan) {
    tier = plan
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "active",
      subscriptionTier: tier,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`Activated subscription for user ${user.id}, tier: ${tier}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "past_due",
    },
  })

  console.log(`Marked subscription as past_due for user ${user.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "canceled",
      subscriptionTier: "free",
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      generationsLimit: 10, // Reset to free tier
    },
  })

  console.log(`Canceled subscription for user ${user.id}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  // Update period end if changed
  await prisma.user.update({
    where: { id: user.id },
    data: {
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })
}

// Disable body parsing for webhooks
export const runtime = 'nodejs';
  },
}
