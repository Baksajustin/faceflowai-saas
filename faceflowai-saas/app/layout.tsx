import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FaceFlowAI - AI Portrait Generation',
  description: 'Create stunning AI portraits with your own face. Train custom models and generate unlimited portraits in any style.',
  keywords: ['AI portraits', 'headshots', 'AI art', 'face generation', 'portrait AI'],
  authors: [{ name: 'FaceFlowAI' }],
  openGraph: {
    title: 'FaceFlowAI - AI Portrait Generation',
    description: 'Create stunning AI portraits with your own face.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
