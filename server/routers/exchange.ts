import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ExchangeStatus, NotificationType } from "@/prisma/generated/client"; // Import NotificationType
import { format } from 'date-fns'; // Added date-fns import

// Define exchange status values as string literals
const EXCHANGE_STATUS = {
  REQUESTED: "REQUESTED",
  ACCEPTED: "ACCEPTED",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DECLINED: "DECLINED"
} as const;

export const exchangeRouter = router({
  // Get upcoming exchanges
  getUpcomingExchanges: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();

    return await ctx.prisma.exchange.findMany({
      where: {
        OR: [
          { providerId: userId },
          { requesterId: userId }
        ],
        status: { in: [EXCHANGE_STATUS.ACCEPTED, EXCHANGE_STATUS.SCHEDULED] },
        scheduledDate: { gte: now },
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        providerService: {
          select: {
            id: true,
            title: true,
          },
        },
        requesterService: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
      take: 5, // Limit to next 5 upcoming exchanges
    });
  }),

  // Get pending exchanges
  getPendingExchanges: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.prisma.exchange.findMany({
      where: {
        OR: [
          { 
            providerId: userId,
            status: EXCHANGE_STATUS.REQUESTED
          },
          { 
            requesterId: userId,
            status: EXCHANGE_STATUS.ACCEPTED
          }
        ],
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        providerService: {
          select: {
            id: true,
            title: true,
          },
        },
        requesterService: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),

  // Get a summary of active exchanges (for dashboard button)
  getActiveExchangeSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const activeStatuses: ExchangeStatus[] = ['REQUESTED', 'ACCEPTED', 'SCHEDULED'];

      const activeExchanges = await ctx.prisma.exchange.findMany({
        where: {
          OR: [
            { providerId: userId },
            { requesterId: userId },
          ],
          status: { in: activeStatuses },
        },
        select: {
          id: true, // Select only the ID
        },
        take: 2, // Only need to know if count is 0, 1, or >1
      });

      const count = activeExchanges.length;
      const firstId = count === 1 ? activeExchanges[0].id : null;

      return {
        count,
        firstId,
      };
    }),

  // Get recent activity (completed or cancelled exchanges)
  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    console.log('Fetching recent activity for user:', ctx.session.user.id);
    
    // Set a random ID to ensure the query is not cached
    const requestId = `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log('Activity request ID:', requestId);
    
    try {
      const recentExchanges = await ctx.prisma.exchange.findMany({
        where: {
          OR: [
            { providerId: ctx.session.user.id },
            { requesterId: ctx.session.user.id },
          ],
          status: {
            in: [EXCHANGE_STATUS.COMPLETED, EXCHANGE_STATUS.CANCELLED],
          },
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          providerService: {
            select: {
              id: true,
              title: true,
            },
          },
          requesterService: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      });
      
      console.log(`Found ${recentExchanges.length} recent exchanges for request ${requestId}`);
      return recentExchanges;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }),

  // Request an exchange
  requestExchange: protectedProcedure
    .input(z.object({ 
      providerServiceId: z.string(),
      requestedDate: z.date().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const requesterId = ctx.session.user.id;
      
      // Get the service to find the provider
      const service = await ctx.prisma.service.findUnique({
        where: { id: input.providerServiceId },
        select: { userId: true, title: true }
      });
      
      if (!service) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
      }
      
      if (service.userId === requesterId) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'You cannot request your own service' 
        });
      }
      
      // Create the exchange
      const exchange = await ctx.prisma.exchange.create({
        data: {
          status: EXCHANGE_STATUS.REQUESTED,
          providerId: service.userId,
          requesterId,
          providerServiceId: input.providerServiceId,
          requestedDate: input.requestedDate,
        },
      });
      
      // Create notification for the provider
      await ctx.prisma.notification.create({
        data: {
          type: 'EXCHANGE_REQUEST',
          message: `Someone has requested your "${service.title}" service`,
          senderId: requesterId,
          recipientId: service.userId,
          exchangeId: exchange.id,
        },
      });
      
      return exchange;
    }),

  // Respond to an exchange request
  respondToRequest: protectedProcedure
    .input(z.object({ 
      exchangeId: z.string(),
      accept: z.boolean(),
      scheduledDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Find the exchange
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: input.exchangeId },
        include: {
          requester: { select: { id: true, name: true } },
          provider: { select: { id: true, name: true } },
          providerService: { select: { title: true } },
        },
      });
      
      if (!exchange) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exchange not found' });
      }
      
      // Check if user is the provider
      if (exchange.providerId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the service provider can respond to this request',
        });
      }
      
      // Check if exchange is in the right state
      if (exchange.status !== EXCHANGE_STATUS.REQUESTED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This exchange request has already been processed',
        });
      }
      
      // Update exchange status based on response
      const updatedExchange = await ctx.prisma.exchange.update({
        where: { id: input.exchangeId },
        data: {
          status: input.accept ? EXCHANGE_STATUS.ACCEPTED : EXCHANGE_STATUS.DECLINED,
          scheduledDate: input.accept ? input.scheduledDate : undefined,
        },
      });
      
      // Create notification for the requester
      await ctx.prisma.notification.create({
        data: {
          type: input.accept ? 'EXCHANGE_ACCEPTED' : 'EXCHANGE_DECLINED',
          message: input.accept 
            ? `Your request for "${exchange.providerService?.title}" has been accepted` 
            : `Your request for "${exchange.providerService?.title}" has been declined`,
          senderId: userId,
          recipientId: exchange.requesterId,
          exchangeId: exchange.id,
        },
      });
      
      return updatedExchange;
    }),

  // Schedule an exchange
  scheduleExchange: protectedProcedure
    .input(z.object({
      exchangeId: z.string(),
      scheduledDate: z.coerce.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { exchangeId, scheduledDate } = input;

      // Find the exchange
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: exchangeId },
        select: {
          id: true,
          providerId: true,
          requesterId: true,
          status: true,
          providerService: { select: { title: true } }, // For notification message
        },
      });

      if (!exchange) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exchange not found' });
      }

      // Check if user is part of the exchange
      if (exchange.providerId !== userId && exchange.requesterId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not part of this exchange',
        });
      }

      // Check if exchange is in the right state (Accepted or already Scheduled)
      if (exchange.status !== EXCHANGE_STATUS.ACCEPTED && exchange.status !== EXCHANGE_STATUS.SCHEDULED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This exchange cannot be scheduled at this time',
        });
      }

      // Update exchange status and date
      const updatedExchange = await ctx.prisma.exchange.update({
        where: { id: exchangeId },
        data: {
          status: EXCHANGE_STATUS.SCHEDULED,
          scheduledDate: scheduledDate,
        },
      });

      // Determine recipient for notification
      const recipientId = userId === exchange.providerId ? exchange.requesterId : exchange.providerId;

      // Create notification for the other party
      await ctx.prisma.notification.create({
        data: {
          type: NotificationType.EXCHANGE_SCHEDULED,
          message: `Your exchange for "${exchange.providerService?.title}" has been scheduled for ${format(scheduledDate, 'PPP p')}.`,
          senderId: userId,
          recipientId: recipientId,
          exchangeId: exchange.id,
        },
      });

      return updatedExchange;
    }),

  // Complete an exchange
  completeExchange: protectedProcedure
    .input(z.object({ 
      exchangeId: z.string(),
      hours: z.number().min(0.5).max(24).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Find the exchange
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: input.exchangeId },
        include: {
          requester: { select: { id: true, name: true } },
          provider: { select: { id: true, name: true } },
        },
      });
      
      if (!exchange) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exchange not found' });
      }
      
      // Check if user is part of the exchange
      if (exchange.providerId !== userId && exchange.requesterId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not part of this exchange',
        });
      }
      
      // Check if exchange is in the right state
      if (exchange.status !== EXCHANGE_STATUS.ACCEPTED && exchange.status !== EXCHANGE_STATUS.SCHEDULED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This exchange cannot be completed at this time',
        });
      }
      
      // Update exchange status
      const updatedExchange = await ctx.prisma.exchange.update({
        where: { id: input.exchangeId },
        data: {
          status: EXCHANGE_STATUS.COMPLETED,
          completedDate: new Date(),
          hours: input.hours,
        },
      });
      
      // Create notifications for both parties
      await Promise.all([
        ctx.prisma.notification.create({
          data: {
            type: 'EXCHANGE_COMPLETED',
            message: 'Your exchange has been marked as completed',
            senderId: userId,
            recipientId: userId === exchange.providerId ? exchange.requesterId : exchange.providerId,
            exchangeId: exchange.id,
          },
        }),
      ]);
      
      return updatedExchange;
    }),

  // Get user exchanges
  getUserExchanges: protectedProcedure
    .input(z.object({ 
      status: z.enum(['all', 'pending', 'upcoming', 'completed', 'cancelled']).optional().default('all'),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Define filter based on status
      let statusFilter = {};
      
      switch (input.status) {
        case 'pending':
          statusFilter = {
            OR: [
              { providerId: userId, status: EXCHANGE_STATUS.REQUESTED },
              { requesterId: userId, status: EXCHANGE_STATUS.ACCEPTED, scheduledDate: { gt: new Date() } }
            ]
          };
          break;
        case 'upcoming':
          statusFilter = {
            OR: [
              { providerId: userId },
              { requesterId: userId }
            ],
            status: { in: [EXCHANGE_STATUS.ACCEPTED, EXCHANGE_STATUS.SCHEDULED] },
            scheduledDate: { gt: new Date() },
          };
          break;
        case 'completed':
          statusFilter = {
            OR: [
              { providerId: userId },
              { requesterId: userId }
            ],
            status: EXCHANGE_STATUS.COMPLETED,
          };
          break;
        case 'cancelled':
          statusFilter = {
            OR: [
              { providerId: userId },
              { requesterId: userId }
            ],
            status: { in: [EXCHANGE_STATUS.CANCELLED, EXCHANGE_STATUS.DECLINED] },
          };
          break;
        default:
          statusFilter = {
            OR: [
              { providerId: userId },
              { requesterId: userId }
            ],
          };
      }
      
      return await ctx.prisma.exchange.findMany({
        where: statusFilter,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          providerService: {
            select: {
              id: true,
              title: true,
            },
          },
          requesterService: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { scheduledDate: 'asc' },
          { updatedAt: 'desc' },
        ],
      });
    }),

  createExchangeRequest: protectedProcedure
    .input(z.object({
      providerServiceId: z.string(),
      // Could add requesterServiceId here if needed for a direct swap offer
      // requesterMessage: z.string().optional(), // Optional message
    }))
    .mutation(async ({ ctx, input }) => {
      const requesterId = ctx.session.user.id;
      const { providerServiceId } = input;

      // 1. Fetch the service being requested to get provider ID
      const providerService = await ctx.prisma.service.findUnique({
        where: { id: providerServiceId },
        select: { userId: true, title: true }, // Select only needed fields
      });

      if (!providerService) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found.' });
      }

      const providerId = providerService.userId;

      // 2. Prevent self-requests
      if (requesterId === providerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot request your own service.' });
      }
      
      // 3. Optional: Check if an active request already exists (to prevent duplicates)
      const existingRequest = await ctx.prisma.exchange.findFirst({
         where: {
           requesterId: requesterId,
           providerId: providerId,
           providerServiceId: providerServiceId,
           status: { in: [ExchangeStatus.REQUESTED, ExchangeStatus.ACCEPTED, ExchangeStatus.SCHEDULED] } // Check active statuses
         }
       });

      if (existingRequest) {
         throw new TRPCError({ code: 'CONFLICT', message: 'An active exchange request for this service already exists.' });
      }

      // 4. Create the exchange record
      const newExchange = await ctx.prisma.exchange.create({
        data: {
          requesterId: requesterId,
          providerId: providerId,
          providerServiceId: providerServiceId,
          status: ExchangeStatus.REQUESTED,
          // requestedDate: new Date(), // Set if needed
          // message: input.requesterMessage, // Add if message field exists
        },
      });

      // 5. TODO: Optionally create a notification for the provider
      // await ctx.prisma.notification.create({...});

      return newExchange;
    }),

  // Get a single exchange by ID
  getExchangeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id: exchangeId } = input;

      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: exchangeId },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          providerService: {
            select: {
              id: true,
              title: true,
            },
          },
          requesterService: { // Include if you have requester services in exchanges
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!exchange) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exchange not found.' });
      }

      // Security check: Ensure the user is part of this exchange
      if (exchange.providerId !== userId && exchange.requesterId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this exchange.',
        });
      }

      return exchange;
    }),

  // Cancel an exchange (by either party)
  cancelExchange: protectedProcedure
    .input(z.object({ exchangeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { exchangeId } = input;

      // Find the exchange
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: exchangeId },
        select: {
          id: true,
          providerId: true,
          requesterId: true,
          status: true,
          providerService: { select: { title: true } }, // For notification message
        },
      });

      if (!exchange) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exchange not found' });
      }

      // Check if user is part of the exchange
      if (exchange.providerId !== userId && exchange.requesterId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not part of this exchange',
        });
      }

      // Check if exchange is in a cancellable state
      const cancellableStatuses: ExchangeStatus[] = ['REQUESTED', 'ACCEPTED', 'SCHEDULED'];
      if (!cancellableStatuses.includes(exchange.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Exchange cannot be cancelled in its current state (${exchange.status})`,
        });
      }

      // Update exchange status to CANCELLED
      const updatedExchange = await ctx.prisma.exchange.update({
        where: { id: exchangeId },
        data: {
          status: ExchangeStatus.CANCELLED,
        },
      });

      // Determine recipient for notification
      const recipientId = userId === exchange.providerId ? exchange.requesterId : exchange.providerId;

      // Create notification for the other party
      await ctx.prisma.notification.create({
        data: {
          type: NotificationType.EXCHANGE_CANCELLED,
          message: `The exchange for \"${exchange.providerService?.title}\" has been cancelled.`,
          senderId: userId,
          recipientId: recipientId,
          exchangeId: exchange.id,
        },
      });

      return updatedExchange;
    }),

  // Helper to create notifications
  createNotification: protectedProcedure
    .input(z.object({ /* input needed */ }))
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.session.user.id;
      // ... rest of notification logic using senderId ...
      console.warn("createNotification procedure is a placeholder and needs implementation.");
      // Example:
      // const { recipientId, type, message, exchangeId } = input; 
      // await ctx.prisma.notification.create({ data: { ... } });
      return { success: false, message: "Not implemented" }; 
    }),
}); 