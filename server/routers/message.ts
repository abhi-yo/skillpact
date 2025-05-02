import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const messageRouter = router({
  // Placeholder - Implement procedures based on spec
  sendMessage: protectedProcedure
    .input(z.object({ exchangeId: z.string(), content: z.string() })) // Example
    .mutation(() => {
      return { message: "TODO: Implement sendMessage" };
    }),
  getMessages: protectedProcedure
    .input(z.object({ exchangeId: z.string() })) // Example
    .query(() => {
      return { message: "TODO: Implement getMessages" };
    }),
}); 