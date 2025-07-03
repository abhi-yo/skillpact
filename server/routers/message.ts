import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const messageRouter = router({
  // Fetch messages for an exchange ordered oldest -> newest (limit optional)
  getMessages: protectedProcedure
    .input(z.object({ exchangeId: z.string(), limit: z.number().min(1).max(100).optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // Ensure user is part of the exchange
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: input.exchangeId },
        select: { providerId: true, requesterId: true },
      });
      if (!exchange || (exchange.providerId !== userId && exchange.requesterId !== userId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.prisma.message.findMany({
        where: { exchangeId: input.exchangeId },
        orderBy: { createdAt: "asc" },
        take: input.limit ?? 100,
      });
    }),

  // Persist message and return it
  sendMessage: protectedProcedure
    .input(z.object({ exchangeId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // Check membership and if exchange still allows chatting (not cancelled)
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: input.exchangeId },
        select: { providerId: true, requesterId: true, status: true },
      });
      if (!exchange || (exchange.providerId !== userId && exchange.requesterId !== userId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const allowedStatuses = [
        "REQUESTED",
        "ACCEPTED",
        "SCHEDULED",
      ];
      if (!allowedStatuses.includes(exchange.status as any)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Chat is closed for this exchange." });
      }
      return ctx.prisma.message.create({
        data: {
          exchangeId: input.exchangeId,
          senderId: userId,
          content: input.content,
        },
      });
    }),
}); 