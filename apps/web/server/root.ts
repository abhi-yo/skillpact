import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { serviceRouter } from "./routers/service";
import { locationRouter } from "./routers/location";
import { exchangeRouter } from "./routers/exchange";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  user: userRouter,
  service: serviceRouter,
  location: locationRouter,
  exchange: exchangeRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
