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
    strategy: "database" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
  },
  callbacks: {
    session: ({ session, user }: any) => {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    signIn: async ({ user, account }: any) => {
      try {
        console.log("Sign-in attempt:", {
          email: user.email,
          provider: account?.provider,
          userId: user.id
        });
        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },
  },
  debug: false, // Disable debug logs in production
} 