import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    session: ({ session, token }: any) => {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    signIn: async ({ user, account }: any) => {
      console.log("Sign-in attempt:", {
        email: user.email,
        provider: account?.provider,
        exists: !!user.id
      });
      return true;
    },
  },
  debug: process.env.NODE_ENV === 'development',
} 