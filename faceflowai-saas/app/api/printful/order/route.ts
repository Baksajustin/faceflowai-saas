import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createOrder, MOCK_PRODUCTS } from "@/lib/printful"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { items, shippingAddress, imageUrl } = await req.json()

    if (!items?.length || !shippingAddress || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Calculate total
    let subtotal = 0
    const orderItems = items.map((item: any) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId)
      const variant = product?.variants.find((v) => v.id === item.variantId)
      if (!variant) throw new Error("Invalid variant")

      const itemTotal = variant.price * item.quantity
      subtotal += itemTotal

      return {
        variantId: variant.id,
        quantity: item.quantity,
        imageUrl,
      }
    })

    const shipping = 9.99
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    // Get user for Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No payment method on file" },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      customer: user.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.id,
        type: "print_order",
      },
    })

    // Create order in database (pending payment)
    const order = await prisma.printOrder.create({
      data: {
        userId: user.id,
        imageUrl,
        productName: items.map((i: any) => i.productName).join(", "),
        variantName: items.map((i: any) => i.variantName).join(", "),
        quantity: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
        unitPrice: subtotal / items.reduce((sum: number, i: any) => sum + i.quantity, 0),
        totalPrice: total,
        shippingAddress,
        status: "pending_payment",
      },
    })

    // If no Printful API key, just return payment intent (for development)
    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json({
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        total,
        message: "Development mode - Printful not configured",
      })
    }

    // Create Printful order
    const printfulOrder = await createOrder(orderItems, shippingAddress, {
      externalId: order.id,
      retailCosts: {
        subtotal,
        shipping,
        total,
      },
    })

    // Update order with Printful ID
    await prisma.printOrder.update({
      where: { id: order.id },
      data: {
        printfulId: printfulOrder.id.toString(),
      },
    })

    return NextResponse.json({
      orderId: order.id,
      printfulId: printfulOrder.id,
      clientSecret: paymentIntent.client_secret,
      total,
    })
  } catch (error: any) {
    console.error("Printful order error:", error)
    return NextResponse.json(
      { error: "Failed to create order", message: error.message },
      { status: 500 }
    )
  }
}
