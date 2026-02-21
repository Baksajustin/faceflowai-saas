'use client'

import { useState, useEffect } from 'react'
import { Image, Loader2, Download, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface Generation {
  id: string
  prompt: string
  imageUrl: string
  createdAt: string
  modelId?: string
}

export default function GalleryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Generation | null>(null)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      // In a real implementation, you'd have a /api/generations endpoint
      // For now, we'll show a placeholder
      setGenerations([])
    } catch (error) {
      console.error('Failed to fetch generations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faceflowai-portrait.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Gallery</h1>
        <p className="text-gray-600">View and download all your generated portraits.</p>
      </div>

      {generations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No portraits yet</h3>
          <p className="text-gray-600 mb-6">Generate your first AI portrait to see it here.</p>
          <Link
            href="/dashboard/generate"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Portraits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(generation)}
            >
              <img
                src={generation.imageUrl}
                alt={generation.prompt}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(generation.imageUrl)
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                <Link
                  href={`/dashboard/orders?image=${encodeURIComponent(generation.imageUrl)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  title="Order Print"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                </Link>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600 truncate">{generation.prompt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(generation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto">
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.prompt}
              className="w-full max-h-[70vh] object-contain"
            />
            <div className="p-4 border-t border-gray-200">
              <p className="text-gray-900 font-medium">{selectedImage.prompt}</p>
              <p className="text-sm text-gray-500 mt-1">
                Generated on {new Date(selectedImage.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleDownload(selectedImage.imageUrl)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <Link
                  href={`/dashboard/orders?image=${encodeURIComponent(selectedImage.imageUrl)}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Print</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
