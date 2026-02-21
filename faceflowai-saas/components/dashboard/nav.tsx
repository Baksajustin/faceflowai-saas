'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Image, CreditCard, User, ShoppingBag, Brain } from 'lucide-react'

const navItems = [
  {
    href: '/dashboard/generate',
    label: 'Generate',
    icon: Sparkles,
  },
  {
    href: '/dashboard/train-face',
    label: 'Train Face',
    icon: Brain,
  },
  {
    href: '/dashboard/gallery',
    label: 'Gallery',
    icon: Image,
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: ShoppingBag,
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: CreditCard,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
        >
          <User className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>
    </nav>
  )
}
