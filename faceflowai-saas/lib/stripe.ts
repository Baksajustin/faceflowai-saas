import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export const CREDIT_PACKAGES = [
  {
    id: "credits_50",
    name: "Starter Pack",
    credits: 50,
    price: 900, // $9.00
    priceId: process.env.STRIPE_CREDITS_50_PRICE_ID || "",
    description: "Perfect for trying out",
    popular: false,
  },
  {
    id: "credits_100",
    name: "Popular Pack",
    credits: 100,
    price: 1900, // $19.00
    priceId: process.env.STRIPE_CREDITS_100_PRICE_ID || "",
    description: "Best value for casual users",
    popular: true,
  },
  {
    id: "credits_250",
    name: "Pro Pack",
    credits: 250,
    price: 3900, // $39.00
    priceId: process.env.STRIPE_CREDITS_250_PRICE_ID || "",
    description: "For serious creators",
    popular: false,
  },
  {
    id: "credits_500",
    name: "Studio Pack",
    credits: 500,
    price: 6900, // $69.00
    priceId: process.env.STRIPE_CREDITS_500_PRICE_ID || "",
    description: "Save 30% - Best deal!",
    popular: false,
  },
]

export const SUBSCRIPTION_PLANS = [
  {
    id: "pro",
    name: "Pro",
    description: "For serious creators",
    monthlyPrice: 2900, // $29.00
    yearlyPrice: 2300,  // $23.00/month billed annually
    features: [
      "Unlimited generations",
      "4K resolution",
      "All 50+ styles",
      "Commercial license",
      "Priority support",
      "3 custom face models",
    ],
    priceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    priceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and agencies",
    monthlyPrice: 9900, // $99.00
    yearlyPrice: 7900,  // $79.00/month billed annually
    features: [
      "Everything in Pro",
      "5 team members",
      "API access",
      "Custom models",
      "Dedicated support",
      "Unlimited face models",
    ],
    priceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    priceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
  },
]
