import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const locationRouter = router({
  // Get current user's location
  getMyLocation: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    const location = await ctx.prisma.location.findUnique({
      where: {
        userId,
      },
    });
    
    return location;
  }),
  
  // Set or update location
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
      
      // Check if user already has a location
      const existingLocation = await ctx.prisma.location.findUnique({
        where: {
          userId,
        },
      });
      
      if (existingLocation) {
        // Update existing location
        return await ctx.prisma.location.update({
          where: {
            userId,
          },
          data: {
            latitude: input.latitude,
            longitude: input.longitude,
            address: input.address,
            city: input.city,
            state: input.state,
            country: input.country,
            radius: input.radius,
          },
        });
      } else {
        // Create new location
        return await ctx.prisma.location.create({
          data: {
            userId,
            latitude: input.latitude,
            longitude: input.longitude,
            address: input.address,
            city: input.city,
            state: input.state,
            country: input.country,
            radius: input.radius,
          },
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