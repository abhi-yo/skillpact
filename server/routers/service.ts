import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const serviceRouter = router({
  // Create a new service (renamed from 'create')
  createService: protectedProcedure
    .input(z.object({ 
      // Updated schema to match the form
      title: z.string().min(5).max(100),
      description: z.string().min(10).max(500),
      categoryId: z.string().optional(),
      hourlyRate: z.number().min(0).max(1000), // Adjust validation as needed
      locationType: z.enum(['OWN', 'CLIENT', 'REMOTE', 'FLEXIBLE']).optional(), 
      serviceRadius: z.number().min(1).max(100).optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Create the service
      const service = await ctx.prisma.service.create({
        data: {
          userId,
          title: input.title,
          description: input.description,
          categoryId: input.categoryId || undefined,
          hourlyRate: input.hourlyRate,
          // Removed imageUrl, hourlyRate - add back if needed
          // Add default values if needed, e.g., isActive: true
          isActive: true, // Default to active
        },
      });
      
      return service;
    }),
    
  // Update a service
  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      title: z.string().min(3).max(100).optional(),
      description: z.string().max(1000).optional(),
      categoryId: z.string().optional(),
      imageUrl: z.string().url().optional(),
      hourlyRate: z.number().min(0).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Check if service exists and belongs to the user
      const service = await ctx.prisma.service.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });
      
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found or does not belong to you',
        });
      }
      
      // Update the service
      const updatedService = await ctx.prisma.service.update({
        where: {
          id: input.id,
        },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
          ...(input.hourlyRate !== undefined && { hourlyRate: input.hourlyRate }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      });
      
      return updatedService;
    }),
    
  // Get services by user ID
  getUserServices: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      includeInactive: z.boolean().optional().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const services = await ctx.prisma.service.findMany({
        where: {
          userId: input.userId,
          ...(input.includeInactive ? {} : { isActive: true }),
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return services;
    }),
    
  // Get current user's services
  getMyServices: protectedProcedure
    .input(z.object({ 
      includeInactive: z.boolean().optional().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const services = await ctx.prisma.service.findMany({
        where: {
          userId,
          ...(input.includeInactive ? {} : { isActive: true }),
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return services;
    }),
    
  // Get service by ID
  getServiceById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = await ctx.prisma.service.findUnique({
        where: {
          id: input.id,
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              averageRating: true,
              ratingCount: true,
            },
          },
        },
      });
      
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }
      
      return service;
    }),
    
  // Get nearby services - Placeholder implementation
  getNearbyServices: protectedProcedure // Make protected, needs user's profile
    .input(z.object({ 
      // Input might just need pagination/filters, user data comes from context
      limit: z.number().min(1).max(50).optional().default(10),
      // Add category filter, search later if needed
      // categoryId: z.string().optional(), 
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 1. Get the current user's location and radius
      const userProfile = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          location: { 
            select: { latitude: true, longitude: true, radius: true }
          }
        }
      });

      // Check if user has location and radius set
      if (!userProfile?.location?.latitude || 
          !userProfile?.location?.longitude || 
          userProfile.location.radius === null || 
          userProfile.location.radius === undefined) {
         throw new TRPCError({ 
            code: 'PRECONDITION_FAILED', 
            message: 'Please set your location and service radius in your profile to see nearby services.' 
          });
      }

      const { latitude, longitude, radius } = userProfile.location;
      const radiusInMiles = radius; // Assuming radius is stored in miles

      // -----------------------------------------------------------
      // Placeholder Logic: 
      // This section needs to be replaced with a proper spatial query.
      // For now, it just returns a few active services from *other* users,
      // *without* checking distance.
      // 
      // Example using PostGIS (requires PostGIS extension enabled):
      /*
      const services = await ctx.prisma.$queryRaw`
          SELECT s.*, u.name as userName, u.image as userImage, 
                 ST_Distance(l.geom, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) / 1609.34 AS distance_miles
          FROM "Service" s
          JOIN "User" u ON s."userId" = u.id
          JOIN "Location" l ON u.id = l."userId"
          WHERE s."isActive" = true
            AND s."userId" != ${userId}
            AND ST_DWithin(
              l.geom, 
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
              ${radiusInMiles * 1609.34} -- Convert miles to meters for ST_DWithin
            )
          ORDER BY distance_miles ASC
          LIMIT ${input?.limit ?? 10};
        `;
      return services;
      */
      // -----------------------------------------------------------
      
       // --- Start Placeholder --- 
      console.warn("WARN: Using placeholder logic for getNearbyServices. No distance calculation.")
      const nearbyServices = await ctx.prisma.service.findMany({
        where: {
          isActive: true,
          userId: { not: userId }, // Don't show own services
          // Add other filters like category later
        },
        include: {
          user: { select: { id: true, name: true, image: true, averageRating: true } },
          category: true,
        },
        take: input?.limit ?? 10,
        orderBy: { createdAt: 'desc' }, // Placeholder order
      });
      // Add a placeholder distance property for the frontend
      const servicesWithPlaceholderDistance = nearbyServices.map(s => ({ ...s, distance_miles: Math.random() * radiusInMiles }));
      return servicesWithPlaceholderDistance;
       // --- End Placeholder ---
    }),
    
  // Get service categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.serviceCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return categories;
  }),

  // Browse active services (new procedure)
  browseServices: publicProcedure
    .input(z.object({ 
      categoryId: z.string().optional(),
      // Add search query later if needed
      // searchQuery: z.string().optional(), 
      // Pagination later if needed
      // limit: z.number().min(1).max(50).optional().default(20),
      // cursor: z.string().nullish(), 
    }).optional()) // Make the whole input optional initially
    .query(async ({ ctx, input }) => {
      const loggedInUserId = ctx.session?.user?.id; // Get logged in user ID if available

      const services = await ctx.prisma.service.findMany({
        where: {
          isActive: true,
          // Exclude services offered by the logged-in user
          userId: loggedInUserId ? { not: loggedInUserId } : undefined,
          // Filter by category if provided
          categoryId: input?.categoryId,
          // TODO: Add search filter later (e.g., title, description, tags)
        },
        include: {
          category: true,
          user: { // Include basic user info
            select: {
              id: true,
              name: true,
              image: true,
              averageRating: true,
            },
          },
        },
        orderBy: {
          // Maybe order by rating or recent first?
          createdAt: 'desc', 
        },
        // Add take/cursor for pagination later
        // take: input?.limit ?? 20,
        // cursor: input?.cursor ? { id: input.cursor } : undefined,
      });
      
      // TODO: Implement proper pagination logic if needed
      // let nextCursor: typeof input.cursor | undefined = undefined;
      // if (services.length > (input?.limit ?? 20)) {
      //   const nextItem = services.pop(); //dont return the one extra result
      //   nextCursor = nextItem!.id;
      // }

      return {
        services,
        // nextCursor,
      };
  }),

  // Delete a service
  deleteService: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id: serviceId } = input;

      // 1. Verify ownership
      const service = await ctx.prisma.service.findFirst({
        where: {
          id: serviceId,
          userId: userId,
        },
        select: { id: true }, // Only select necessary fields
      });

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found or you do not have permission to delete it.',
        });
      }

      // 2. Check for active exchanges involving this service
      const activeExchanges = await ctx.prisma.exchange.count({
        where: {
          providerServiceId: serviceId,
          status: { 
            in: ['REQUESTED', 'ACCEPTED', 'SCHEDULED'] // Active states
          }
        }
      });

      if (activeExchanges > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This service cannot be deleted because it is involved in active exchanges. Please complete or cancel them first.',
        });
      }

      // 3. Delete the service
      await ctx.prisma.service.delete({
        where: { id: serviceId },
      });

      return { success: true };
  }),
}); 