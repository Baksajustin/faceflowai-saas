# FaceFlowAI - AI Portrait SaaS

A complete, production-ready AI portrait generation platform with face training, credits system, subscriptions, and print-on-demand.

## Features

- **AI Portrait Generation** - Generate stunning portraits using Stable Diffusion XL
- **Face Training** - Train custom AI models on your face for personalized portraits
- **Triple Revenue Model**:
  - Subscriptions (Pro $29/mo, Enterprise $99/mo)
  - Credit packs ($9-69 one-time purchases)
  - Print-on-demand (canvas, framed prints, mugs, apparel)
- **Authentication** - Google OAuth via NextAuth
- **Payments** - Stripe integration with webhooks
- **Database** - PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js with Google Provider
- **AI**: Replicate API (Stable Diffusion XL)
- **Payments**: Stripe
- **Print**: Printful API

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/faceflowai-saas.git
cd faceflowai-saas
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 3. Database Setup

Create a free PostgreSQL database at [Neon](https://neon.tech), then run:

```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/faceflowai-saas.git
git push -u origin main
```

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import your GitHub repository
2. Add all environment variables from `.env.local`
3. Click Deploy

### 3. Configure Custom Domain

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add `faceflowai.com`
3. Update DNS records in Namecheap (or your registrar)

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://faceflowai.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## API Keys Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://faceflowai.com/api/auth/callback/google`

### Stripe

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard
3. Create products and prices for subscriptions and credit packages
4. Copy price IDs to environment variables

### Replicate

1. Create account at [Replicate](https://replicate.com)
2. Get API token from Account Settings
3. Note: You need to add a payment method to generate images

### Printful (Optional)

1. Create account at [Printful](https://printful.com)
2. Get API key from Dashboard → API
3. If not configured, mock products will be used

## Revenue Model

### Unit Economics

| Cost | Revenue | Margin |
|------|---------|--------|
| $0.03/generation (Replicate) | $0.10-1.00/user | 80-95% |
| $2.50/face training | $9-29 one-time | 70-90% |
| $15-30/product (Printful) | $30-60 sale price | 45-55% |

### Pricing Tiers

**Free**: 10 generations/month, 1 face model

**Pro ($29/mo)**: Unlimited generations, 4K, 3 face models, commercial license

**Enterprise ($99/mo)**: Everything + 5 team members, API access, unlimited face models

**Credit Packs**:
- 50 credits: $9
- 100 credits: $19 (popular)
- 250 credits: $39
- 500 credits: $69 (save 30%)

## Project Structure

```
faceflowai-saas/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── credits/                # Credit balance & history
│   │   ├── generate/               # AI image generation
│   │   ├── printful/               # Print-on-demand
│   │   ├── stripe/                 # Payments & webhooks
│   │   ├── train-face/             # Face model training
│   │   └── user/                   # User data & portal
│   ├── dashboard/
│   │   ├── billing/                # Subscriptions & credits
│   │   ├── gallery/                # Generated images
│   │   ├── generate/               # Main generation UI
│   │   ├── orders/                 # Print orders
│   │   └── train-face/             # Face training UI
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Global styles
├── components/
│   ├── dashboard/                  # Dashboard components
│   ├── providers.tsx               # Session provider
│   └── ui/                         # UI components
├── lib/
│   ├── auth.ts                     # Auth configuration
│   ├── prisma.ts                   # Database client
│   ├── printful.ts                 # Printful integration
│   ├── replicate.ts                # AI generation
│   ├── stripe.ts                   # Payment config
│   └── utils.ts                    # Utilities
├── prisma/
│   └── schema.prisma               # Database schema
└── public/                         # Static assets
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://faceflowai.com"
NEXTAUTH_SECRET="random-secret-string"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_YEARLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_YEARLY_PRICE_ID="price_..."

# Replicate
REPLICATE_API_TOKEN="r8_..."

# Printful (optional)
PRINTFUL_API_KEY="..."
```

## Post-Deployment Checklist

- [ ] Test sign up with Google
- [ ] Generate a test portrait
- [ ] Purchase test credits (use Stripe test card: 4242 4242 4242 4242)
- [ ] Test face training flow
- [ ] Configure Stripe webhooks
- [ ] Set up custom domain
- [ ] Add favicon and OG images
- [ ] Configure email (optional)

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API keys independently
4. Review Stripe webhook events

## License

MIT License - feel free to use for commercial projects.

---

Built with ❤️ for creators everywhere.
