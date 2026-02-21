'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Loader2, Check, Zap, Crown, Building2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const creditPackages = [
  {
    id: 'credits_50',
    name: 'Starter Pack',
    credits: 50,
    price: 9,
    description: 'Perfect for trying out',
    popular: false,
  },
  {
    id: 'credits_100',
    name: 'Popular Pack',
    credits: 100,
    price: 19,
    description: 'Best value for casual users',
    popular: true,
  },
  {
    id: 'credits_250',
    name: 'Pro Pack',
    credits: 250,
    price: 39,
    description: 'For serious creators',
    popular: false,
  },
  {
    id: 'credits_500',
    name: 'Studio Pack',
    credits: 500,
    price: 69,
    description: 'Save 30% - Best deal!',
    popular: false,
  },
]

const subscriptionPlans = [
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators',
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: [
      'Unlimited generations',
      '4K resolution',
      'All 50+ styles',
      'Commercial license',
      'Priority support',
      '3 custom face models',
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and agencies',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Everything in Pro',
      '5 team members',
      'API access',
      'Custom models',
      'Dedicated support',
      'Unlimited face models',
    ],
    icon: Building2,
    popular: false,
  },
]

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    fetchUserData()
    fetchTransactions()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const handleCreditPurchase = async (packageId: string) => {
    setIsCheckingOut(packageId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credits', packageId }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      setIsCheckingOut(null)
    }
  }

  const handleSubscription = async (planId: string) => {
    setIsCheckingOut(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planId,
          interval: billingInterval,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      setIsCheckingOut(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_portal_session' }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isSubscribed = user?.subscriptionStatus === 'active'
  const currentPlan = user?.subscriptionTier

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
        <p className="text-gray-600">Manage your subscription and purchase credits.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 capitalize">{currentPlan || 'Free'}</p>
            <p className="text-gray-600">
              {isSubscribed
                ? `Renews on ${new Date(user.currentPeriodEnd).toLocaleDateString()}`
                : '10 generations per month'}
            </p>
          </div>
          {isSubscribed && (
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Subscription
            </button>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-500">Credits Balance</p>
              <p className="text-xl font-semibold text-blue-600">{user?.creditsBalance || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits Purchased</p>
              <p className="text-xl font-semibold text-gray-900">{user?.creditsTotal || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      {!isSubscribed && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly <span className="text-green-600">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  plan.popular
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${plan.popular ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500">/month</span>
                  {billingInterval === 'yearly' && (
                    <p className="text-sm text-green-600">Billed annually</p>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className={`w-4 h-4 mr-2 ${plan.popular ? 'text-blue-600' : 'text-green-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscription(plan.id)}
                  disabled={isCheckingOut === plan.id}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 btn-shine'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {isCheckingOut === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Packages */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Buy Credits</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-6 rounded-xl border-2 transition-all ${
                pkg.popular
                  ? 'border-blue-600 bg-blue-50/50 relative'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    POPULAR
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{pkg.credits} credits</p>
              <button
                onClick={() => handleCreditPurchase(pkg.id)}
                disabled={isCheckingOut === pkg.id}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  pkg.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {isCheckingOut === pkg.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Buy'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount} credits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
