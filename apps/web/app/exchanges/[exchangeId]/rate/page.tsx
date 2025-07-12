"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, ChevronLeft, SendHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";

const RateExchangePage = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const utils = trpc.useContext();

  const exchangeId = params.exchangeId as string;

  // Fetch exchange data
  const { data: exchange, isLoading } = trpc.exchange.getExchangeById.useQuery(
    { id: exchangeId },
    {
      enabled: !!exchangeId && status === "authenticated",
    }
  );

  // Create rating mutation
  const createRatingMutation = trpc.user.createRating.useMutation({
    onSuccess: () => {
      // First, invalidate all related queries
      utils.exchange.getRecentActivity.invalidate();
      utils.user.getDashboardStats.invalidate();
      utils.exchange.getUpcomingExchanges.invalidate();
      utils.exchange.getPendingExchanges.invalidate();

      // Force invalidate all queries for the entire app
      utils.invalidate();

      // Wait a moment to ensure invalidation has time to process
      setTimeout(() => {
        // Redirect to exchange page with success message
        router.push(`/exchanges/${exchangeId}?rated=true`);
      }, 500);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exchange || !session) return;

    createRatingMutation.mutate({
      exchangeId,
      rating,
      review: comment.trim() || undefined,
    });
  };

  // Determine if the user can rate this exchange
  const canRate = React.useMemo(() => {
    if (!exchange || !session) return false;

    const userId = (session.user as any)?.id;
    const isInvolved =
      userId === exchange.providerId || userId === exchange.requesterId;
    const isCompleted = exchange.status === "COMPLETED";

    // Check if user has already rated
    const hasProviderRated =
      userId === exchange.providerId && exchange.providerRating !== null;
    const hasRequesterRated =
      userId === exchange.requesterId && exchange.requesterRating !== null;

    return (
      isInvolved && isCompleted && !(hasProviderRated || hasRequesterRated)
    );
  }, [exchange, session]);

  // Get partner name
  const partnerName = React.useMemo(() => {
    if (!exchange || !session) return "";

    const userId = (session.user as any)?.id;
    const isProvider = userId === exchange.providerId;

    return isProvider
      ? exchange.requester?.name || "the requester"
      : exchange.provider?.name || "the provider";
  }, [exchange, session]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle no exchange found or not authorized
  if (!exchange) {
    return (
      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-md mx-auto bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-xl font-bold mb-4">Exchange not found</h1>
          <p className="mb-4">
            The exchange you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Handle already rated or not eligible to rate
  if (!canRate) {
    return (
      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-md mx-auto bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-xl font-bold mb-4">Rating not available</h1>
          <p className="mb-4">
            You've already rated this exchange or it hasn't been completed yet.
          </p>
          <Link
            href={`/exchanges/${exchangeId}`}
            className="text-blue-600 hover:underline flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Exchange
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Link
            href={`/exchanges/${exchangeId}`}
            className="text-blue-600 hover:underline flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Exchange
          </Link>
        </div>

        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-2xl font-bold mb-4">Rate Your Experience</h1>
          <p className="mb-6 text-gray-700">
            Share your feedback about your experience with {partnerName}.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="mb-2 font-medium">
                How would you rate this exchange?
              </p>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-2xl mr-1 focus:outline-none"
                  >
                    <Star
                      size={32}
                      fill={
                        (hoveredRating || rating) >= value ? "#facc15" : "none"
                      }
                      stroke={
                        (hoveredRating || rating) >= value
                          ? "#facc15"
                          : "#64748b"
                      }
                      className="transition-colors"
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-600">
                  {rating > 0
                    ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                        rating
                      ]
                    : "Select rating"}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="comment" className="block mb-2 font-medium">
                Comments (optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border-2 border-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Share details about your experience..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={rating === 0 || createRatingMutation.isPending}
              className={`w-full py-3 flex justify-center items-center font-bold text-white ${
                rating === 0 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {createRatingMutation.isPending ? (
                <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              ) : (
                <SendHorizontal className="w-5 h-5 mr-2" />
              )}
              Submit Rating
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RateExchangePage;
