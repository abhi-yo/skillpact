'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

// Interface for exchange data (reuse from dashboard or define specifically)
interface ActivityItem {
  id: string;
  status: string; // e.g., COMPLETED, CANCELLED
  providerId: string;
  requesterId: string;
  providerService?: { title: string | null } | null;
  requesterService?: { title: string | null } | null; // Added requesterService if needed
  provider?: { id: string; name: string | null } | null;
  requester?: { id: string; name: string | null } | null;
  hours?: number | null;
  updatedAt?: string | Date | null;
  // Add other relevant fields like createdAt, scheduledDate, completedDate if available
}

// Interface for User within Session (including ID)
interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

const ActivityPage: React.FC = () => {
  const { data: session } = useSession();
  // Assert the type of session.user to include the ID
  const userId = (session?.user as SessionUser | undefined)?.id;

  // Fetch activity data
  const { data: activityData, isLoading, error } = trpc.exchange.getRecentActivity.useQuery(
    undefined, // No input needed for this query based on dashboard usage
    {
      enabled: !!userId, // Only run query if userId is available
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center">
           <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" strokeWidth={2} />
           <p className="text-xl font-semibold text-gray-700">Loading Activity...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center max-w-md">
           <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" strokeWidth={2} />
           <h2 className="font-satoshi text-xl font-bold text-red-700 mb-2">Error Loading Activity</h2>
           <p className="text-sm text-gray-600 mb-4 leading-normal">Could not load your activity history. Please try again later.</p>
           <Link href="/dashboard" className="inline-flex items-center mt-4 px-4 py-2 bg-red-100 text-red-700 font-semibold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2}/>
                Back to Dashboard
            </Link>
        </div>
      </div>
    );
  }

  // --- Render Activity Page ---
  return (
    <div className="min-h-screen bg-blue-50 font-inter pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
            <Link href="/dashboard" className="inline-flex items-center p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black mr-4">
                <ArrowLeft className="h-5 w-5" strokeWidth={2}/>
                <span className="sr-only">Back to Dashboard</span>
            </Link>
            <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black">Activity History</h1>
        </div>

        {/* Activity List Card */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {activityData && activityData.length > 0 ? (
            <ul className="divide-y-2 divide-black"> {/* Use thicker divider */}
              {activityData.map((activity: ActivityItem) => {
                const isProvider = activity.providerId === userId;
                const otherParty = isProvider ? activity.requester : activity.provider;
                const serviceTitle = isProvider ? activity.providerService?.title : activity.requesterService?.title ?? activity.providerService?.title;
                const isCompleted = activity.status === 'COMPLETED';
                const activityDate = activity.updatedAt ? new Date(activity.updatedAt) : null;

                return (
                  <li key={activity.id} className="p-5 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        {/* Left side: Icon and Main Info */}
                        <div className="flex items-start mb-2 sm:mb-0">
                            {/* Status Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 border-2 border-black flex items-center justify-center mr-4 mt-1 ${isCompleted ? 'bg-green-200' : 'bg-red-200'}`}>
                                {isCompleted ? (
                                    <CheckCircle size={18} className="text-green-700" strokeWidth={2} />
                                ) : (
                                    <XCircle size={18} className="text-red-700" strokeWidth={2} />
                                )}
                            </div>
                            {/* Text Details */}
                            <div>
                                <p className="text-base font-semibold text-black">
                                    {isCompleted ? 'Completed' : 'Cancelled'} Exchange
                                    <span className="font-medium text-gray-700"> with {otherParty?.name || 'User'}</span>
                                </p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    {serviceTitle ? `Service: "${serviceTitle}"` : 'Service details unavailable'}
                                    {activity.hours != null && ` - ${activity.hours} hour${activity.hours === 1 ? '' : 's'}`}
                                </p>
                                {activityDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {activityDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Right side: Action/Link */}
                        <div className="mt-2 sm:mt-1 sm:ml-4 flex-shrink-0">
                           {/* Optional: Add link to exchange details if useful */}
                           <Link href={`/exchanges/${activity.id}`} className="px-2 py-1 text-xs bg-blue-100 border border-black hover:bg-blue-200 transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-black">
                                View Exchange
                           </Link>
                        </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">No Activity Found</p>
              <p className="text-sm text-gray-500">Your exchange history is currently empty.</p>
              {/* Optional: Link to browse services */}
              <Link href="/services/browse" className="inline-flex items-center mt-4 px-3 py-1.5 text-sm font-bold bg-blue-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                  Browse Services
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage; 