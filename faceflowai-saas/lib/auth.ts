import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.subscriptionStatus = (user as any).subscriptionStatus
        session.user.subscriptionTier = (user as any).subscriptionTier
        session.user.generationsUsed = (user as any).generationsUsed
        session.user.generationsLimit = (user as any).generationsLimit
        session.user.creditsBalance = (user as any).creditsBalance
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "database",
  },
}

// Extend session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionStatus?: string
      subscriptionTier?: string
      generationsUsed?: number
      generationsLimit?: number
      creditsBalance?: number
    }
  }
}
