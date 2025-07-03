import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const locationRouter = router({
  // Get current user's location
  getMyLocation: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    const result = await ctx.prisma.$queryRawUnsafe<{
      latitude: number | null;
      longitude: number | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      radius: number | null;
    }[]>(
      `SELECT ST_Y(coordinates) as latitude, ST_X(coordinates) as longitude, 
              address, city, state, country, radius
       FROM "Location" WHERE "userId" = $1 LIMIT 1`,
      userId,
    );

    return result[0] ?? null;
  }),
  
  // Set or update location (store as PostGIS geometry)
  setLocation: protectedProcedure
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        radius: z.number().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Generate a unique ID for the location
        const locationId = `cloc_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

        // Use raw SQL upsert to handle geometry type
        await ctx.prisma.$executeRawUnsafe(
          `INSERT INTO "Location" ("id", "userId", "coordinates", "address", "city", "state", "country", "radius", "createdAt", "updatedAt")
           VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT ("userId") DO UPDATE
             SET "coordinates" = EXCLUDED."coordinates",
                 "address" = EXCLUDED."address",
                 "city" = EXCLUDED."city",
                 "state" = EXCLUDED."state",
                 "country" = EXCLUDED."country",
                 "radius" = EXCLUDED."radius",
                 "updatedAt" = NOW();`,
          locationId,
          userId,
          input.longitude,
          input.latitude,
          input.address ?? null,
          input.city ?? null,
          input.state ?? null,
          input.country ?? null,
          input.radius ?? 10,
        );

        return { success: true };
      } catch (error) {
        console.error('Location save error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save location. Please try again.',
        });
      }
    }),
  
  // Update service radius
  updateRadius: protectedProcedure
    .input(
      z.object({
        radius: z.number().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Check if user has location
      const existingLocation = await ctx.prisma.location.findUnique({
        where: {
          userId,
        },
      });
      
      if (!existingLocation) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You need to set your location before setting a service radius',
        });
      }
      
      // Update radius
      return await ctx.prisma.location.update({
        where: {
          userId,
        },
        data: {
          radius: input.radius,
        },
      });
    }),
}); 