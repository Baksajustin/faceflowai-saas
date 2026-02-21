import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { type, priceId, packageId, planId, interval = "monthly" } = await req.json()

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    let sessionConfig: any = {
      customer: customerId,
      mode: type === "subscription" ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    }

    if (type === "credits" && packageId) {
      // Credit purchase
      const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId)
      if (!creditPackage) {
        return NextResponse.json(
          { error: "Invalid credit package" },
          { status: 400 }
        )
      }

      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${creditPackage.name} - ${creditPackage.credits} Credits`,
              description: creditPackage.description,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ]
      sessionConfig.metadata = {
        type: "credits",
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
        userId: user.id,
      }
    } else if (type === "subscription" && planId) {
      // Subscription
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      if (!plan) {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        )
      }

      const priceIdToUse =
        interval === "yearly" ? plan.priceIdYearly : plan.priceIdMonthly

      if (!priceIdToUse) {
        return NextResponse.json(
          { error: "Plan price not configured" },
          { status: 400 }
        )
      }

      sessionConfig.line_items = [
        {
          price: priceIdToUse,
          quantity: 1,
        },
      ]
      sessionConfig.subscription_data = {
        metadata: {
          userId: user.id,
          planId: plan.id,
        },
      }
    } else if (priceId) {
      // Direct price ID (for existing Stripe products)
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ]
    } else {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session", message: error.message },
      { status: 500 }
    )
  }
}
