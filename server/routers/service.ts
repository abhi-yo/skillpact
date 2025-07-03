import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const serviceRouter = router({
  // Create a new service (renamed from 'create')
  createService: protectedProcedure
    .input(z.object({ 
      title: z.string().min(5).max(100),
      description: z.string().min(10).max(500),
      categoryId: z.string().optional(),
      hourlyRate: z.number().min(0).max(1000),
      locationType: z.enum(['OWN', 'CLIENT', 'REMOTE']).default('REMOTE'), 
      serviceRadius: z.number().min(1).max(100).optional(),
      tags: z.string().optional(),
      // Location fields
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      address: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
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
          locationType: input.locationType,
          serviceRadius: input.serviceRadius,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country,
          isActive: true,
        },
      });
      
      // Only store coordinates for "OWN" location type services
      if (input.latitude && input.longitude && input.locationType === 'OWN') {
        await ctx.prisma.$executeRawUnsafe(
          `UPDATE "Service" SET coordinates = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
          input.longitude,
          input.latitude,
          service.id
        );
      }
      
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

      // 1. Get the current user's coordinates & radius
      const loc = await ctx.prisma.$queryRawUnsafe<{
        lat: number | null;
        lng: number | null;
        radius: number | null;
      }[]>(
        `SELECT ST_Y(coordinates) AS lat, ST_X(coordinates) AS lng, radius
         FROM "Location" WHERE "userId" = $1 LIMIT 1`,
        userId,
      );

      if (!loc[0] || loc[0].lat === null || loc[0].lng === null || loc[0].radius === null) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Please set your location and service radius in your profile to see nearby services.'
        });
      }

      const { lat, lng, radius } = loc[0];
      const radiusMeters = radius * 1000; // radius stored in km

      const limit = input?.limit ?? 10;

      const services = await ctx.prisma.$queryRawUnsafe<any[]>(
        `SELECT s.id, s.title, s.description, s."hourlyRate", s."userId",
                u.name AS "userName", u.image AS "userImage", u."averageRating",
                ST_Distance(s.coordinates::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) / 1000 AS distance_km,
                sc.name AS "categoryName"
         FROM "Service" s
         JOIN "User" u ON s."userId" = u.id
         LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
         WHERE s."isActive" = true
           AND s."userId" <> $3
           AND s.coordinates IS NOT NULL
           AND s."locationType" = 'OWN'
           AND ST_DWithin(s.coordinates::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $4)
         ORDER BY distance_km ASC
         LIMIT $5;`,
        lng,
        lat,
        userId,
        radiusMeters,
        limit,
      );

      // Map the raw SQL results to match the expected interface
      const mappedServices = services.map((service: any) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        hourlyRate: service.hourlyRate,
        distance_km: service.distance_km,
        user: {
          id: service.userId,
          name: service.userName,
          image: service.userImage,
          averageRating: service.averageRating,
        },
        category: service.categoryName ? { name: service.categoryName } : null,
      }));

      return mappedServices;
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

  // Search services by title
  searchServices: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.query) {
        return { services: [] };
      }
      
      const services = await ctx.prisma.service.findMany({
        where: {
          title: {
            contains: input.query,
            mode: 'insensitive',
          },
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              averageRating: true,
            },
          },
          category: true,
        },
        take: 10,
      });
      
      return { services };
    }),

  // Browse services with filters
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