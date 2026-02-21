import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateImage } from "@/lib/replicate"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { prompt, modelId, width = 1024, height = 1024 } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Get user with current usage
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has available generations
    const hasFreeGenerations = user.generationsUsed < user.generationsLimit
    const hasActiveSubscription =
      user.subscriptionStatus === "active" &&
      user.currentPeriodEnd &&
      new Date(user.currentPeriodEnd) > new Date()
    const hasCredits = user.creditsBalance > 0

    if (!hasFreeGenerations && !hasActiveSubscription && !hasCredits) {
      return NextResponse.json(
        {
          error: "No generations available",
          code: "NO_CREDITS",
          message: "You've used all your free generations. Upgrade to continue.",
        },
        { status: 403 }
      )
    }

    // Generate images using Replicate
    const output = await generateImage(prompt, {
      width,
      height,
      numOutputs: 4,
      modelId: modelId || undefined,
    })

    // Save generations to database
    const imageUrls = Array.isArray(output) ? output : [output]
    const generations = await Promise.all(
      imageUrls.map((url) =>
        prisma.generation.create({
          data: {
            userId: user.id,
            prompt,
            imageUrl: url as string,
            modelId: modelId || null,
            cost: 1,
          },
        })
      )
    )

    // Update user usage
    const updateData: any = {}

    if (hasFreeGenerations && !hasActiveSubscription && !hasCredits) {
      // Use free generation
      updateData.generationsUsed = { increment: 1 }
    } else if (hasCredits && !hasActiveSubscription) {
      // Use credit
      updateData.creditsBalance = { decrement: 1 }
    }
    // Subscription users don't consume credits or free generations

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      })
    }

    return NextResponse.json({
      success: true,
      images: imageUrls,
      generations: generations.map((g) => g.id),
      remainingFree: hasFreeGenerations
        ? user.generationsLimit - user.generationsUsed - 1
        : 0,
      creditsBalance: hasCredits ? user.creditsBalance - 1 : user.creditsBalance,
    })
  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate images", message: error.message },
      { status: 500 }
    )
  }
}
