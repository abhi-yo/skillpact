import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "database";

// Define interfaces matching the expected structure of Prisma results

interface RatingData {
  providerId: string | null;
  requesterId: string | null;
  providerRating: number | null;
  requesterRating: number | null;
}

interface BasicUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface BasicService {
  title: string | null;
}

interface ExchangeWithReviewer {
  id: string;
  requesterId: string | null;
  providerId: string | null;
  requesterRating: number | null;
  providerRating: number | null;
  requesterReview: string | null;
  providerReview: string | null;
  completedDate: Date | null;
  requester: BasicUser | null;
  provider: BasicUser | null;
  requesterService: BasicService | null;
  providerService: BasicService | null;
}

interface FormattedReview {
  exchangeId: string;
  rating: number | null;
  review: string | null;
  date: Date | null;
  reviewer: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  serviceTitle: string | null;
}

// Helper function to update user rating
async function updateUserRating(ctx: any, userId: string) {
  const receivedRatings: RatingData[] = await ctx.prisma.exchange.findMany({
    where: {
      OR: [
        { providerId: userId, requesterRating: { not: null } },
        { requesterId: userId, providerRating: { not: null } },
      ],
      status: "COMPLETED",
    },
    select: {
      providerId: true,
      requesterId: true,
      providerRating: true,
      requesterRating: true,
    },
  });

  let totalRating = 0;
  let ratingCount = 0;

  receivedRatings.forEach((rating: RatingData) => {
    if (rating.providerId === userId && rating.requesterRating) {
      totalRating += rating.requesterRating;
      ratingCount++;
    } else if (rating.requesterId === userId && rating.providerRating) {
      totalRating += rating.providerRating;
      ratingCount++;
    }
  });

  const averageRating = ratingCount > 0 ? totalRating / ratingCount : null;

  await ctx.prisma.user.update({
    where: { id: userId },
    data: {
      averageRating,
      ratingCount,
    },
  });
}

export const userRouter = router({
  // Get current logged-in user profile (Protected)
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userProfile = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
        location: true,
        skills: { select: { id: true, name: true } },
        services: {
          select: { id: true, title: true, isActive: true },
          where: { isActive: true },
        },
      },
    });

    if (!userProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found.",
      });
    }

    return userProfile;
  }),

  // Calculate profile completion percentage
  getProfileCompletion: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        skills: true,
        services: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    }

    const hasName = !!user.name;
    const hasImage = !!user.image;
    const hasLocation = !!user.location;
    const hasServiceRadius = user.location?.radius !== null;
    const hasSkills = user.skills.length > 0;
    const hasServices = user.services.length > 0;

    // Calculate completion percentage (6 possible items)
    const completedItems = [
      hasName,
      hasImage,
      hasLocation,
      hasServiceRadius,
      hasSkills,
      hasServices,
    ].filter(Boolean).length;

    // Calculate completion percentage (6 possible items)
    const percentage = Math.round((completedItems / 6) * 100);

    return {
      percentage,
      hasName,
      hasImage,
      hasLocation,
      hasServiceRadius,
      hasSkills,
      hasServices,
    };
  }),

  // Update current logged-in user profile (Protected) - Enhanced version
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(191).optional(),
        image: z.string().url().optional().nullable(),
        locationString: z.string().optional(),
        radius: z.number().min(0).optional(),
        skills: z.array(z.string().min(1)).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        const dataToUpdate: Prisma.UserUpdateInput = {};

        // Basic fields
        if (input.name !== undefined) dataToUpdate.name = input.name;
        if (input.image !== undefined) dataToUpdate.image = input.image;

        // Location and Radius handling
        const hasLocationInput =
          input.locationString !== undefined || input.radius !== undefined;
        if (hasLocationInput) {
          const existingLocation = await ctx.prisma.location.findUnique({
            where: { userId: userId },
          });

          if (existingLocation) {
            const locationUpdatePayload: Prisma.LocationUpdateWithoutUserInput =
              {};
            if (input.locationString !== undefined) {
              locationUpdatePayload.address = input.locationString;
            }
            if (input.radius !== undefined) {
              locationUpdatePayload.radius = input.radius;
            }
            if (Object.keys(locationUpdatePayload).length > 0) {
              dataToUpdate.location = { update: locationUpdatePayload };
            }
          } else {
            const locationCreatePayload: Prisma.LocationCreateWithoutUserInput =
              {
                address: input.locationString ?? null,
                radius: input.radius ?? null,
              };
            dataToUpdate.location = { create: locationCreatePayload };
          }
        }

        // Skills handling
        if (input.skills !== undefined) {
          const skillOperations = input.skills.map((skillName) => ({
            where: { userId_name: { userId: userId, name: skillName } },
            create: { name: skillName },
          }));

          dataToUpdate.skills = {
            connectOrCreate: skillOperations,
          };
        }

        // Check if any data is being updated
        if (Object.keys(dataToUpdate).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No fields provided for update",
          });
        }

        // Perform the update
        return await ctx.prisma.user.update({
          where: { id: userId },
          data: dataToUpdate,
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            skills: { select: { id: true, name: true } },
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Get user by ID (public profile view)
  getUserById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: userId }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          averageRating: true,
          ratingCount: true,
          location: {
            select: {
              city: true,
              state: true,
              // Optionally select address or coordinates if privacy allows
            },
          },
          skills: {
            select: {
              id: true,
              name: true,
            },
          },
          services: {
            where: { isActive: true }, // Only show active services
            select: {
              id: true,
              title: true,
              description: true,
              hourlyRate: true,
              category: { select: { name: true } },
            },
          },
          // Add reviews received if needed
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      return user;
    }),

  // Get user reviews
  getUserReviews: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId;

      // Fetch exchanges where the user was either the provider or requester and a review exists
      const exchanges: ExchangeWithReviewer[] =
        await ctx.prisma.exchange.findMany({
          where: {
            status: "COMPLETED",
            OR: [
              { providerId: userId, requesterReview: { not: null } }, // User provided service, requester reviewed
              { requesterId: userId, providerReview: { not: null } }, // User requested service, provider reviewed
            ],
          },
          include: {
            requester: { select: { id: true, name: true, image: true } },
            provider: { select: { id: true, name: true, image: true } },
            requesterService: { select: { title: true } },
            providerService: { select: { title: true } },
          },
        });

      // Format the reviews
      const reviews: FormattedReview[] = exchanges
        .map((exchange: ExchangeWithReviewer): FormattedReview | null => {
          let reviewData: FormattedReview | null = null;

          // Case 1: User was the provider, requester left the review
          if (
            exchange.providerId === userId &&
            exchange.requesterReview &&
            exchange.requesterRating !== null
          ) {
            reviewData = {
              exchangeId: exchange.id,
              rating: exchange.requesterRating,
              review: exchange.requesterReview,
              date: exchange.completedDate,
              reviewer: exchange.requester
                ? {
                    id: exchange.requester.id,
                    name: exchange.requester.name || "Anonymous",
                    image: exchange.requester.image,
                  }
                : null,
              serviceTitle: exchange.providerService?.title || "Service",
            };
          }
          // Case 2: User was the requester, provider left the review
          else if (
            exchange.requesterId === userId &&
            exchange.providerReview &&
            exchange.providerRating !== null
          ) {
            reviewData = {
              exchangeId: exchange.id,
              rating: exchange.providerRating,
              review: exchange.providerReview,
              date: exchange.completedDate,
              reviewer: exchange.provider
                ? {
                    id: exchange.provider.id,
                    name: exchange.provider.name || "Anonymous",
                    image: exchange.provider.image,
                  }
                : null,
              serviceTitle: exchange.providerService?.title || "Service", // Service provided by the reviewer
            };
          }

          return reviewData;
        })
        .filter((review): review is FormattedReview => review !== null) // Filter out nulls
        .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)); // Sort by date descending

      return reviews;
    }),

  // Get Dashboard Stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      // 1. Unread Notifications Count
      const unreadNotificationsCount = await ctx.prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      // 2. Services Offered/Received Count & Hours Banked
      const completedExchanges = await ctx.prisma.exchange.findMany({
        where: {
          status: "COMPLETED",
          OR: [{ providerId: userId }, { requesterId: userId }],
        },
        select: {
          providerId: true,
          requesterId: true,
          hours: true,
        },
      });

      // Calculate stats from completed exchanges
      let servicesOfferedCount = 0;
      let servicesReceivedCount = 0;
      let hoursBanked = 0;

      completedExchanges.forEach((exchange) => {
        if (exchange.providerId === userId) {
          servicesOfferedCount++;
          hoursBanked += exchange.hours || 0;
        } else {
          servicesReceivedCount++;
        }
      });

      return {
        unreadNotificationsCount,
        servicesOfferedCount,
        servicesReceivedCount,
        hoursBanked,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch dashboard stats",
      });
    }
  }),

  // Get Notifications
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.prisma.notification.findMany({
      where: { recipientId: userId }, // Use correct field
      orderBy: { createdAt: "desc" },
      take: 20, // Limit the number of notifications fetched
    });
  }),

  // Mark Notification as Read
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.prisma.notification.updateMany({
        where: {
          id: input.notificationId,
          recipientId: userId, // Use correct field & ensure user owns the notification
        },
        data: { isRead: true },
      });
      return { success: true };
    }),

  // Mark notifications as read (Protected)
  markNotificationsAsRead: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).optional() })) // Optional array of IDs
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { ids } = input;

      const whereCondition = {
        recipientId: userId,
        isRead: false,
        ...(ids && { id: { in: ids } }), // Only include IDs if provided
      };

      await ctx.prisma.notification.updateMany({
        where: whereCondition,
        data: { isRead: true },
      });
      return { success: true };
    }),

  // Create a rating for an exchange
  createRating: protectedProcedure
    .input(
      z.object({
        exchangeId: z.string(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First, fetch the exchange to verify it exists and check permissions
      const exchange = await ctx.prisma.exchange.findUnique({
        where: { id: input.exchangeId },
        select: {
          id: true,
          status: true,
          providerId: true,
          requesterId: true,
          providerRating: true,
          requesterRating: true,
          providerReview: true,
          requesterReview: true,
        },
      });

      if (!exchange) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Exchange not found.",
        });
      }

      // Check if exchange is completed
      if (exchange.status !== "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot rate an exchange that is not completed.",
        });
      }

      // Determine if user is provider or requester
      const isProvider = exchange.providerId === userId;
      const isRequester = exchange.requesterId === userId;

      if (!isProvider && !isRequester) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this exchange.",
        });
      }

      // Check if user has already rated this exchange
      if (
        (isProvider && exchange.providerRating !== null) ||
        (isRequester && exchange.requesterRating !== null)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already rated this exchange.",
        });
      }

      // Update the exchange with the rating
      const updateData: any = {};

      if (isProvider) {
        updateData.providerRating = input.rating;
        updateData.providerReview = input.review || null;
      } else {
        updateData.requesterRating = input.rating;
        updateData.requesterReview = input.review || null;
      }

      // Update the exchange
      await ctx.prisma.exchange.update({
        where: { id: input.exchangeId },
        data: updateData,
      });

      // Update average ratings for the rated user
      const ratedUserId = isProvider
        ? exchange.requesterId
        : exchange.providerId;
      if (ratedUserId) {
        await updateUserRating(ctx, ratedUserId);
      }

      return { success: true };
    }),

  // Get ratings received by the current user
  getReceivedRatings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Fetch exchanges where the user is a provider and has been rated by the requester
    const asProvider = await ctx.prisma.exchange.findMany({
      where: {
        providerId: userId,
        requesterRating: { not: null },
        status: "COMPLETED",
      },
      select: {
        id: true,
        requesterRating: true,
        requesterReview: true,
        completedDate: true,
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
      },
      orderBy: {
        completedDate: "desc",
      },
    });

    // Fetch exchanges where the user is a requester and has been rated by the provider
    const asRequester = await ctx.prisma.exchange.findMany({
      where: {
        requesterId: userId,
        providerRating: { not: null },
        status: "COMPLETED",
      },
      select: {
        id: true,
        providerRating: true,
        providerReview: true,
        completedDate: true,
        provider: {
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
      },
      orderBy: {
        completedDate: "desc",
      },
    });

    // Format the provider ratings
    const providerRatings = asProvider.map((exchange) => ({
      id: `provider-${exchange.id}`,
      rating: exchange.requesterRating || 0,
      comment: exchange.requesterReview,
      createdAt:
        exchange.completedDate?.toISOString() || new Date().toISOString(),
      fromUser: {
        id: exchange.requester?.id || "",
        name: exchange.requester?.name,
        image: exchange.requester?.image,
      },
      exchange: {
        id: exchange.id,
        providerService: exchange.providerService,
      },
    }));

    // Format the requester ratings
    const requesterRatings = asRequester.map((exchange) => ({
      id: `requester-${exchange.id}`,
      rating: exchange.providerRating || 0,
      comment: exchange.providerReview,
      createdAt:
        exchange.completedDate?.toISOString() || new Date().toISOString(),
      fromUser: {
        id: exchange.provider?.id || "",
        name: exchange.provider?.name,
        image: exchange.provider?.image,
      },
      exchange: {
        id: exchange.id,
        providerService: exchange.providerService,
      },
    }));

    // Combine and sort by date (newest first)
    return [...providerRatings, ...requesterRatings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }),

  // Get ratings given by the current user
  getGivenRatings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Fetch exchanges where the user is a provider and has rated the requester
    const asProvider = await ctx.prisma.exchange.findMany({
      where: {
        providerId: userId,
        providerRating: { not: null },
        status: "COMPLETED",
      },
      select: {
        id: true,
        providerRating: true,
        providerReview: true,
        completedDate: true,
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
      },
      orderBy: {
        completedDate: "desc",
      },
    });

    // Fetch exchanges where the user is a requester and has rated the provider
    const asRequester = await ctx.prisma.exchange.findMany({
      where: {
        requesterId: userId,
        requesterRating: { not: null },
        status: "COMPLETED",
      },
      select: {
        id: true,
        requesterRating: true,
        requesterReview: true,
        completedDate: true,
        provider: {
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
      },
      orderBy: {
        completedDate: "desc",
      },
    });

    // Format the provider ratings (given to requesters)
    const providerRatings = asProvider.map((exchange) => ({
      id: `provider-${exchange.id}`,
      rating: exchange.providerRating || 0,
      comment: exchange.providerReview,
      createdAt:
        exchange.completedDate?.toISOString() || new Date().toISOString(),
      fromUser: {
        id: exchange.requester?.id || "",
        name: exchange.requester?.name,
        image: exchange.requester?.image,
      },
      exchange: {
        id: exchange.id,
        providerService: exchange.providerService,
      },
    }));

    // Format the requester ratings (given to providers)
    const requesterRatings = asRequester.map((exchange) => ({
      id: `requester-${exchange.id}`,
      rating: exchange.requesterRating || 0,
      comment: exchange.requesterReview,
      createdAt:
        exchange.completedDate?.toISOString() || new Date().toISOString(),
      fromUser: {
        id: exchange.provider?.id || "",
        name: exchange.provider?.name,
        image: exchange.provider?.image,
      },
      exchange: {
        id: exchange.id,
        providerService: exchange.providerService,
      },
    }));

    // Combine and sort by date (newest first)
    return [...providerRatings, ...requesterRatings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }),
});
