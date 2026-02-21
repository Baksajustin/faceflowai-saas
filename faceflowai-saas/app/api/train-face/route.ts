import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { trainFaceModel } from "@/lib/replicate"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, imageUrls, triggerWord } = await req.json()

    if (!name || !imageUrls?.length || !triggerWord) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check user's face model limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: { faceModels: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check limits based on subscription
    const maxModels =
      user.subscriptionTier === "enterprise"
        ? 999
        : user.subscriptionTier === "pro"
        ? 3
        : 1

    if (user._count.faceModels >= maxModels) {
      return NextResponse.json(
        {
          error: "Face model limit reached",
          message: `You've reached your limit of ${maxModels} face models. Upgrade to create more.`,
          code: "LIMIT_REACHED",
        },
        { status: 403 }
      )
    }

    // Create face model record
    const faceModel = await prisma.faceModel.create({
      data: {
        userId: user.id,
        name,
        imageUrls,
        triggerWord,
        status: "training",
      },
    })

    // Start training (in production, this would be a background job)
    // For now, we'll simulate the training process
    try {
      const training = await trainFaceModel(imageUrls, triggerWord)

      // Update with training ID
      await prisma.faceModel.update({
        where: { id: faceModel.id },
        data: {
          modelId: training.id,
        },
      })

      return NextResponse.json({
        success: true,
        faceModel: {
          id: faceModel.id,
          name: faceModel.name,
          status: "training",
          triggerWord,
        },
        trainingId: training.id,
        message: "Face model training started. This may take 10-20 minutes.",
      })
    } catch (trainingError: any) {
      // If training fails, update status
      await prisma.faceModel.update({
        where: { id: faceModel.id },
        data: {
          status: "failed",
        },
      })

      throw trainingError
    }
  } catch (error: any) {
    console.error("Train face error:", error)
    return NextResponse.json(
      { error: "Failed to start training", message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const faceModels = await prisma.faceModel.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    // Check and update status for training models
    const updatedModels = await Promise.all(
      faceModels.map(async (model) => {
        if (model.status === "training" && model.modelId) {
          // In production, check actual training status from Replicate
          // For now, simulate completion after 15 minutes
          const trainingTime = Date.now() - new Date(model.createdAt).getTime()
          if (trainingTime > 15 * 60 * 1000) {
            await prisma.faceModel.update({
              where: { id: model.id },
              data: {
                status: "ready",
                completedAt: new Date(),
              },
            })
            return { ...model, status: "ready" }
          }
        }
        return model
      })
    )

    return NextResponse.json({
      faceModels: updatedModels,
    })
  } catch (error: any) {
    console.error("Fetch face models error:", error)
    return NextResponse.json(
      { error: "Failed to fetch face models", message: error.message },
      { status: 500 }
    )
  }
}
