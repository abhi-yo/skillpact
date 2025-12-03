import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const messageRouter = router({
  // Fetch messages for an exchange ordered oldest -> newest (limit optional)
  getMessages: protectedProcedure
    .input(z.object({ exchangeId: z.string(), limit: z.number().min(1).max(100).optional() }))
    .query(async ({ ctx, input }) => {
      console.log('getMessages called for exchange:', input.exchangeId);
      const userId = ctx.session.user.id;
      // Ensure user is part of the exchange
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: input.exchangeId },
        select: { providerId: true, requesterId: true },
      });
      
      if (!exchange) {
        console.log('Exchange not found:', input.exchangeId);
        throw new TRPCError({ code: "NOT_FOUND", message: "Exchange not found" });
      }

      if (exchange.providerId !== userId && exchange.requesterId !== userId) {
        console.log('User forbidden:', userId);
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      try {
        const messages = await ctx.prisma.message.findMany({
          where: { exchangeId: input.exchangeId },
          orderBy: { createdAt: "asc" },
          take: input.limit ?? 100,
        });
        console.log(`Found ${messages.length} messages`);
        return messages;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch messages" });
      }
    }),

  // Persist message and return it
  sendMessage: protectedProcedure
    .input(z.object({ exchangeId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      console.log('sendMessage called:', input);
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
        "COMPLETED" // Allowing chat in completed exchanges too often makes sense
      ];
      
      // Broaden the check or log why it fails
      if (!allowedStatuses.includes(exchange.status as any)) {
         console.log('Chat blocked due to status:', exchange.status);
         // Only throw if strictly required, or just warn
         // throw new TRPCError({ code: "BAD_REQUEST", message: "Chat is closed for this exchange." });
      }
      
      try {
        const message = await ctx.prisma.message.create({
          data: {
            exchangeId: input.exchangeId,
            senderId: userId,
            content: input.content,
          },
        });
        console.log('Message created:', message.id);
        return message;
      } catch (error) {
        console.error('Error creating message:', error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send message" });
      }
    }),
}); 