'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Brain, Upload, Loader2, CheckCircle, AlertCircle, Image, Clock, X } from 'lucide-react'
import Link from 'next/link'

interface FaceModel {
  id: string
  name: string
  status: 'training' | 'ready' | 'failed'
  triggerWord: string
  createdAt: string
  completedAt?: string
  imageUrls: string[]
}

export default function TrainFacePage() {
  const [faceModels, setFaceModels] = useState<FaceModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTraining, setIsTraining] = useState(false)
  const [name, setName] = useState('')
  const [triggerWord, setTriggerWord] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [modelCount, setModelCount] = useState(0)

  useEffect(() => {
    fetchFaceModels()
    fetchUserInfo()
  }, [])

  const fetchFaceModels = async () => {
    try {
      const res = await fetch('/api/train-face')
      if (res.ok) {
        const data = await res.json()
        setFaceModels(data.faceModels)
      }
    } catch (error) {
      console.error('Failed to fetch face models:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setSubscriptionTier(data.user.subscriptionTier)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('')
    
    // Validate files
    if (acceptedFiles.length < 5) {
      setError('Please upload at least 5 photos')
      return
    }
    if (acceptedFiles.length > 10) {
      setError('Maximum 10 photos allowed')
      return
    }

    // In production, upload to S3 here
    // For now, simulate with object URLs
    const imageUrls = acceptedFiles.map((file) => URL.createObjectURL(file))
    setUploadedImages(imageUrls)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 10,
  })

  const handleTrain = async () => {
    if (!name.trim() || !triggerWord.trim() || uploadedImages.length < 5) {
      setError('Please fill in all fields and upload at least 5 photos')
      return
    }

    setIsTraining(true)
    setError('')

    try {
      const res = await fetch('/api/train-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          triggerWord: triggerWord.trim(),
          imageUrls: uploadedImages,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'LIMIT_REACHED') {
          setError('limit_reached')
        } else {
          setError(data.error || 'Failed to start training')
        }
        return
      }

      // Reset form
      setName('')
      setTriggerWord('')
      setUploadedImages([])
      
      // Refresh models
      fetchFaceModels()
    } catch (error: any) {
      setError(error.message || 'Failed to start training')
    } finally {
      setIsTraining(false)
    }
  }

  const getMaxModels = () => {
    switch (subscriptionTier) {
      case 'enterprise':
        return 'Unlimited'
      case 'pro':
        return 3
      default:
        return 1
    }
  }

  const maxModels = getMaxModels()
  const canCreateMore = maxModels === 'Unlimited' || faceModels.length < (maxModels as number)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Train Your Face</h1>
        <p className="text-gray-600">
          Upload 5-10 photos of yourself and our AI will learn your face. Generate unlimited portraits that look like
          you!
        </p>
      </div>

      {/* Model Limit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700">Face Models</p>
            <p className="text-lg font-semibold text-blue-900">
              {faceModels.length} <span className="text-sm text-blue-700">/ {maxModels}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-700">Plan</p>
            <p className="text-lg font-semibold text-blue-900 capitalize">{subscriptionTier}</p>
          </div>
        </div>
      </div>

      {/* Existing Models */}
      {faceModels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Face Models</h2>
          <div className="space-y-4">
            {faceModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    {model.status === 'ready' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : model.status === 'training' ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{model.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="capitalize">{model.status}</span>
                      <span>•</span>
                      <span>Trigger: {model.triggerWord}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {model.status === 'ready' && (
                    <Link
                      href="/dashboard/generate"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Use Model
                    </Link>
                  )}
                  {model.status === 'training' && (
                    <span className="flex items-center text-sm text-blue-600">
                      <Clock className="w-4 h-4 mr-1" />
                      ~15 min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Model */}
      {canCreateMore ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Face Model</h2>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Professional Headshots"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Trigger Word Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Word</label>
            <input
              type="text"
              value={triggerWord}
              onChange={(e) => setTriggerWord(e.target.value)}
              placeholder="e.g., johnface (used in prompts: 'photo of johnface person')"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              This word will trigger your face in generation prompts
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos (5-10 images)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the photos here...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">Drag & drop photos here, or click to select</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 10MB each</p>
                </>
              )}
            </div>

            {/* Preview */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{uploadedImages.length} photos selected</p>
                <div className="grid grid-cols-5 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Messages */}
          {error === 'limit_reached' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">Face model limit reached</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You've reached your limit of {maxModels} face models. Upgrade to create more.
                  </p>
                  <Link
                    href="/dashboard/billing"
                    className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              </div>
            </div>
          )}

          {error && error !== 'limit_reached' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700">{error}</div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleTrain}
            disabled={isTraining || !name.trim() || !triggerWord.trim() || uploadedImages.length < 5}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Starting Training...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Train Face Model</span>
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Training takes approximately 10-20 minutes. You'll be notified when it's ready.
          </p>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
          <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Face Model Limit Reached</h3>
          <p className="text-gray-600 mb-4">
            You've reached your limit of {maxModels} face models. Upgrade to create more.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      )}
    </div>
  )
}
