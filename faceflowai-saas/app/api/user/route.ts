import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        generationsUsed: true,
        generationsLimit: true,
        creditsBalance: true,
        creditsTotal: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("User fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user", message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { action } = await req.json()

    if (action === "create_portal_session") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user?.stripeCustomerId) {
        return NextResponse.json(
          { error: "No subscription found" },
          { status: 400 }
        )
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      })

      return NextResponse.json({ url: portalSession.url })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("User action error:", error)
    return NextResponse.json(
      { error: "Failed to process request", message: error.message },
      { status: 500 }
    )
  }
}
