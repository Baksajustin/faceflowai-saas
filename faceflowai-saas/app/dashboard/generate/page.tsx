'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Image, Loader2, Download, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const stylePresets = [
  {
    name: 'Professional',
    prompt: 'professional headshot, corporate style, neutral background, studio lighting, confident expression, high quality portrait',
  },
  {
    name: 'Artistic',
    prompt: 'artistic portrait, oil painting style, dramatic lighting, renaissance vibes, masterpiece quality, detailed brushwork',
  },
  {
    name: 'Cyberpunk',
    prompt: 'cyberpunk avatar, neon lights, futuristic city background, high tech, glowing elements, sci-fi aesthetic',
  },
  {
    name: 'Anime',
    prompt: 'anime style portrait, vibrant colors, detailed eyes, manga aesthetic, cel shading, high quality illustration',
  },
  {
    name: 'Fantasy',
    prompt: 'fantasy portrait, magical atmosphere, ethereal lighting, mystical background, dreamlike quality, enchanted',
  },
  {
    name: 'Vintage',
    prompt: 'vintage portrait, 1950s style, film grain, classic Hollywood lighting, nostalgic aesthetic, sepia tones',
  },
]

interface FaceModel {
  id: string
  name: string
  status: string
  triggerWord: string
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [faceModels, setFaceModels] = useState<FaceModel[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [usage, setUsage] = useState({ used: 0, limit: 10, credits: 0 })

  useEffect(() => {
    fetchFaceModels()
    fetchUsage()
  }, [])

  const fetchFaceModels = async () => {
    try {
      const res = await fetch('/api/train-face')
      if (res.ok) {
        const data = await res.json()
        const readyModels = data.faceModels.filter((m: FaceModel) => m.status === 'ready')
        setFaceModels(readyModels)
      }
    } catch (error) {
      console.error('Failed to fetch face models:', error)
    }
  }

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setUsage({
          used: data.user.generationsUsed,
          limit: data.user.generationsLimit,
          credits: data.user.creditsBalance,
        })
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError('')
    setGeneratedImages([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selectedModel
            ? `${prompt}, photo of ${faceModels.find((m) => m.id === selectedModel)?.triggerWord} person`
            : prompt,
          modelId: selectedModel || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'NO_CREDITS') {
          setError('no_credits')
        } else {
          setError(data.error || 'Failed to generate')
        }
        return
      }

      setGeneratedImages(data.images)
      setUsage((prev) => ({
        ...prev,
        used: prev.used + 1,
        credits: data.creditsBalance ?? prev.credits,
      }))
    } catch (error: any) {
      setError(error.message || 'Failed to generate images')
    } finally {
      setIsGenerating(false)
    }
  }

  const applyPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt)
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faceflowai-portrait-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const remainingFree = usage.limit - usage.used
  const hasCredits = remainingFree > 0 || usage.credits > 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Portraits</h1>
        <p className="text-gray-600">Create stunning AI portraits with custom styles and your trained face models.</p>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-500">Free Generations</p>
              <p className="text-lg font-semibold text-gray-900">
                {remainingFree} <span className="text-sm text-gray-500">/ {usage.limit}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits</p>
              <p className="text-lg font-semibold text-blue-600">{usage.credits}</p>
            </div>
          </div>
          {!hasCredits && (
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Get More Credits
            </Link>
          )}
        </div>
      </div>

      {/* Face Model Selector */}
      {faceModels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Use Face Model (Optional)</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Generic portrait (no face model)</option>
            {faceModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Prompt Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your perfect portrait... (e.g., 'professional headshot, studio lighting')"
            className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !hasCredits}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Style Presets */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stylePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.prompt)}
              className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Messages */}
      {error === 'no_credits' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">No generations available</h3>
              <p className="text-sm text-red-700 mt-1">
                You've used all your free generations. Upgrade to continue creating portraits.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && error !== 'no_credits' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">{error}</div>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Portraits</h3>
            <button
              onClick={() => {
                setGeneratedImages([])
                setPrompt('')
              }}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate More</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Generated portrait ${index + 1}`}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleDownload(imageUrl, index)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Train Face CTA */}
      {faceModels.length === 0 && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Train Your Face</h3>
              <p className="text-gray-600 mb-4">
                Upload 5-10 photos of yourself and our AI will learn your face. Generate unlimited portraits that look
                like you!
              </p>
              <Link
                href="/dashboard/train-face"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Train Your Face
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
