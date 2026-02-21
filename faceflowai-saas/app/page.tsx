'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sparkles, Zap, Shield, Image, CreditCard, Users, ChevronDown, CheckCircle, Star, Heart } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      router.push('/dashboard/generate')
    }
  }, [session, router])

  const handleGetStarted = () => {
    setIsLoading(true)
    signIn('google', { callbackUrl: '/dashboard/generate' })
  }

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate 4K portraits in under 10 seconds with our optimized inference engine.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Image,
      title: 'Face Training',
      description: 'Train AI on your face once, generate unlimited portraits in any style.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your photos are encrypted and never stored permanently. Auto-deletion after 24 hours.',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: Users,
      title: '50+ Styles',
      description: 'From professional headshots to artistic portraits, cyberpunk to anime.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: CreditCard,
      title: 'Flexible Pricing',
      description: 'Pay per generation with credits or subscribe for unlimited access.',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Sparkles,
      title: 'Print on Demand',
      description: 'Order canvas prints, framed photos, mugs, and more with your AI portraits.',
      color: 'bg-cyan-100 text-cyan-600',
    },
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out',
      features: [
        '10 generations/month',
        'Standard resolution',
        '5 styles available',
        '1 face model',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious creators',
      features: [
        'Unlimited generations',
        '4K resolution',
        'All 50+ styles',
        '3 face models',
        'Commercial license',
        'Priority support',
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        '5 team members',
        'API access',
        'Unlimited face models',
        'Dedicated support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FaceFlowAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Pricing</a>
            </div>
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-all btn-shine disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-blue-50/50 to-transparent pointer-events-none" />
        
        {/* Floating Images */}
        <div className="absolute top-20 left-10 w-64 h-80 animate-float opacity-60 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop"
            alt="AI Portrait"
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>
        <div className="absolute top-40 right-10 w-56 h-72 animate-float-delayed opacity-60 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
            alt="AI Art"
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
            <span className="text-blue-700 text-sm font-medium">New: Train your face for personalized portraits</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Create stunning <br />
            <span className="gradient-text">AI portraits</span> in seconds
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Train AI on your face once, then generate unlimited portraits in any style. 
            Professional headshots, artistic portraits, and creative avatars.
          </p>

          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all btn-shine text-lg disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Start Creating Free'}
          </button>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span>10 free generations</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span>1 free face model</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for perfect portraits</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional-grade AI tools designed for creators, marketers, and teams who need stunning visuals fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600">Choose the plan that fits your creative needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? 'border-2 border-blue-600 bg-blue-50/50 relative transform scale-105 shadow-xl'
                    : 'border-gray-200 hover:border-blue-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className={`w-4 h-4 mr-3 ${plan.popular ? 'text-blue-600' : 'text-green-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 btn-shine'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-cyan-900 opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your photos?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of creators using FaceFlowAI to generate stunning AI portraits
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all btn-shine"
          >
            Start Creating Free
          </button>
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>10k+ users</span>
            </div>
            <div className="flex items-center">
              <Image className="w-4 h-4 mr-1" />
              <span>500k+ generated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FaceFlowAI</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 FaceFlowAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-sm text-gray-500">Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm text-gray-500">for creators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
