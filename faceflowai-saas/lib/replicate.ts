import Replicate from "replicate"

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// Stable Diffusion XL for general generations
export async function generateImage(prompt: string, options?: {
  width?: number
  height?: number
  numOutputs?: number
  modelId?: string
}) {
  const { width = 1024, height = 1024, numOutputs = 4, modelId } = options || {}

  // If using a custom face model
  if (modelId) {
    const output = await replicate.run(
      modelId as `${string}/${string}:${string}`,
      {
        input: {
          prompt: prompt,
          width,
          height,
          num_outputs: numOutputs,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      }
    )
    return output
  }

  // Default SDXL generation
  const output = await replicate.run(
    "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
    {
      input: {
        prompt: prompt,
        width,
        height,
        num_outputs: numOutputs,
        scheduler: "K_EULER",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        refine: "expert_ensemble_refiner",
        high_noise_frac: 0.8,
      },
    }
  )

  return output
}

// DreamBooth training for face models
export async function trainFaceModel(imageUrls: string[], triggerWord: string) {
  const output = await replicate.run(
    "replicate/dreambooth:dcce4f34d2d6e2a6e9d984c6e5e7e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
    {
      input: {
        instance_prompt: `photo of ${triggerWord} person`,
        class_prompt: "photo of a person",
        instance_data: imageUrls.join(","),
        num_class_images: 200,
        max_train_steps: 2000,
        learning_rate: 1e-6,
      },
    }
  )

  return output
}

// Check training status
export async function getTrainingStatus(trainingId: string) {
  const training = await replicate.trainings.get(trainingId)
  return training
}
