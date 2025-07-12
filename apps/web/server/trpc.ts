import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import prisma from "database";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getSession } from "next-auth/react";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
interface CreateContextOptions {
  session: Session | null;
  req: NextRequest;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    prisma,
    session: opts.session,
    req: opts.req,
  };
};

/**
 * @see https://trpc.io/docs/context
 */
// Updated context creation for NextAuth
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const session = (await getServerSession(authOptions)) as Session | null;
  return createInnerTRPCContext({ session, req: opts.req });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create();

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */
const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 */
const publicProcedure = t.procedure;

// Helper function to check if user is authenticated using NextAuth session
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // Infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      prisma: ctx.prisma,
      req: ctx.req,
    },
  });
});

/**
 * Protected (authenticated) procedure
 */
// Use the NextAuth middleware
const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export { createTRPCRouter as router, publicProcedure, protectedProcedure };
