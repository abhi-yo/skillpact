"use client";

import React, { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  BarChart,
  Activity,
  PlusCircle,
  Search,
  ArrowRightLeft,
  Calendar as CalendarIcon,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  ChevronRight,
  List,
  Star,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tooltip } from "@/components/ui/tooltip";

// Interface for authenticated user
interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Interface for profile completion data
interface ProfileCompletionData {
  percentage: number;
  hasName: boolean;
  hasImage: boolean;
  hasLocation: boolean;
  hasServiceRadius: boolean;
  hasSkills: boolean;
  hasServices: boolean;
}

// Interface for basic user data
interface BasicUser {
  id: string;
  name: string | null;
  image: string | null;
}

// Updated interface for basic service data to match tRPC response
interface BasicService {
  id: string; // Added ID
  title: string | null;
}

// Interface for exchange data
interface Exchange {
  id: string;
  status: string;
  providerId: string;
  requesterId: string;
  // Ensure nested service types match (id and title)
  providerService?: BasicService | null;
  requesterService?: BasicService | null;
  provider?: BasicUser | null;
  requester?: BasicUser | null;
  scheduledDate?: string | Date | null; // Allow null
  completedDate?: string | Date | null; // Allow null
  hours?: number | null; // Allow null
  updatedAt?: string | Date | null; // Allow null
}

// Minimal UserProfile type matching simplified getProfile
type UserProfile =
  | {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      location?: {
        radius?: number | null;
        latitude?: number | null; // Add latitude
        longitude?: number | null; // Add longitude
      } | null;
      skills?: { id: string }[];
    }
  | null
  | undefined;

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userId = (session?.user as any)?.id;
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // --- tRPC Queries ---
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!userId && isSignedIn,
  });
  const { data: profileCompletionData } =
    trpc.user.getProfileCompletion.useQuery(undefined, {
      enabled: !!userId && isSignedIn,
    });
  const utils = trpc.useContext();
  const { data: dashboardStats } = trpc.user.getDashboardStats.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );
  const { data: pendingExchanges } = trpc.exchange.getPendingExchanges.useQuery(
    undefined,
    { enabled: !!userId && isSignedIn }
  );
  const { data: upcomingExchanges } =
    trpc.exchange.getUpcomingExchanges.useQuery(undefined, {
      enabled: !!userId && isSignedIn,
    });
  const { data: recentActivity } = trpc.exchange.getRecentActivity.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );

  // --- Auth Check ---
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  // --- Derived State ---
  const {
    profileCompletion,
    hasMissingRadius,
    hasMissingSkills,
    hasMissingServices,
  } = useMemo(() => {
    if (profileCompletionData) {
      return {
        profileCompletion: profileCompletionData.percentage,
        hasMissingRadius: !profileCompletionData.hasServiceRadius,
        hasMissingSkills: !profileCompletionData.hasSkills,
        hasMissingServices: !profileCompletionData.hasServices,
      };
    }
    return {
      profileCompletion: 0,
      hasMissingRadius: true,
      hasMissingSkills: true,
      hasMissingServices: true,
    };
  }, [profileCompletionData]);

  // Build a map of scheduled dates to exchange info
  const scheduledMap = useMemo(() => {
    const map: Record<string, Exchange> = {};
    upcomingExchanges?.forEach((ex) => {
      if (ex.scheduledDate) {
        const dateStr = new Date(ex.scheduledDate).toDateString();
        map[dateStr] = ex;
      }
    });
    return map;
  }, [upcomingExchanges]);

  // --- Loading State ---
  if (!isLoaded || (isSignedIn && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center">
          <Loader2
            className="animate-spin h-12 w-12 text-blue-600 mb-4"
            strokeWidth={2}
          />
          <p className="text-xl font-semibold text-gray-700">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
          <AlertCircle
            className="mx-auto h-10 w-10 text-red-500 mb-3"
            strokeWidth={2}
          />
          <h2 className="font-satoshi text-xl font-bold text-red-700 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-normal">
            Could not load your profile data. Please try again later.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 font-semibold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // --- Authenticated State ---
  if (isLoaded && isSignedIn) {
    const unreadNotifications = dashboardStats?.unreadNotificationsCount || 0;
    const servicesOfferedCount = dashboardStats?.servicesOfferedCount || 0;
    const servicesReceivedCount = dashboardStats?.servicesReceivedCount || 0;
    const hoursBanked = dashboardStats?.hoursBanked || 0;
    const pendingExchangesCount = pendingExchanges?.length || 0;
    const upcomingExchangesCount = upcomingExchanges?.length || 0;
    const totalVisibleActive = pendingExchangesCount + upcomingExchangesCount;
    let singleVisibleActiveId: string | null | undefined = null;
    if (totalVisibleActive === 1) {
      if (pendingExchangesCount === 1)
        singleVisibleActiveId = pendingExchanges?.[0]?.id;
      else if (upcomingExchangesCount === 1)
        singleVisibleActiveId = upcomingExchanges?.[0]?.id;
    }
    const myExchangesHref = "/exchanges";
    const isMyExchangesDisabled = false;

    return (
      <DashboardLayout>
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  mt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h1 className="font-satoshi tracking-tight text-2xl font-bold text-gray-800">
                Welcome, {(session?.user?.name || "User").split(" ")[0]}
              </h1>
              <div className="flex items-center space-x-4">
                <Link
                  href="/notifications"
                  className="relative p-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg"
                >
                  <Bell size={20} strokeWidth={2} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border border-black">
                      {unreadNotifications}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-1 bg-red-100 text-red-700 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <div className="w-full border-b-2 border-black border-dashed mt-3"></div>
        </header>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-blue-50">
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
            {/* Main content - 6 columns */}
            <div className="lg:col-span-6 space-y-8">
              {/* Quick Actions Card */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-lg">
                <h2 className="font-satoshi tracking-tight text-2xl font-bold text-black mb-5">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 font-inter">
                  <Link
                    href="/services/new"
                    className="block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg"
                  >
                    <PlusCircle
                      className="mx-auto mb-1 text-green-600"
                      size={24}
                      strokeWidth={2}
                    />
                    <span className="font-bold text-base text-black">
                      Offer Service
                    </span>
                  </Link>
                  <Link
                    href="/services/browse"
                    className="block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg"
                  >
                    <Search
                      className="mx-auto mb-1 text-blue-600"
                      size={24}
                      strokeWidth={2}
                    />
                    <span className="font-bold text-base text-black">
                      Find Services
                    </span>
                  </Link>
                  <Link
                    href={myExchangesHref}
                    aria-disabled={isMyExchangesDisabled}
                    onClick={(e) => {
                      if (isMyExchangesDisabled) e.preventDefault();
                    }}
                    className={cn(
                      "block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg",
                      isMyExchangesDisabled &&
                        "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    <ArrowRightLeft
                      className="mx-auto mb-1 text-purple-600"
                      size={24}
                      strokeWidth={2}
                    />
                    <span className="font-bold text-base text-black">
                      My Exchanges
                    </span>
                  </Link>
                  <Link
                    href="/services/my-services"
                    className="block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg"
                  >
                    <List
                      className="mx-auto mb-1 text-yellow-600"
                      size={24}
                      strokeWidth={2}
                    />
                    <span className="font-bold text-base text-black">
                      My Services
                    </span>
                  </Link>
                </div>
              </div>

              {/* Activity Overview Card */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <div className="px-3 py-2 md:px-5 md:py-3 border-b-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
                  <h2 className="font-satoshi tracking-tight text-lg md:text-xl font-bold text-white flex items-center">
                    <BarChart
                      className="mr-2 md:mr-2"
                      size={24}
                      strokeWidth={2}
                    />
                    <span className="md:inline">Activity Overview</span>
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => utils.invalidate()}
                      className="text-sm md:text-base font-bold bg-white text-blue-600 px-3 py-1 md:px-4 md:py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150 flex-1 sm:flex-none text-center rounded-lg"
                    >
                      Refresh Stats
                    </button>
                    <Link
                      href="/activity"
                      className="text-sm md:text-base font-bold text-white bg-blue-400 px-3 py-1 md:px-4 md:py-1.5 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white flex-1 sm:flex-none rounded-lg"
                    >
                      <span className="hidden sm:inline">
                        View Detailed Activity
                      </span>
                      <span className="sm:hidden">View Details</span>
                      <ChevronRight
                        className="h-3 w-3 md:h-4 md:w-4 ml-1"
                        strokeWidth={3}
                      />
                    </Link>
                  </div>
                </div>
                <div className="px-6 py-6 font-inter">
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-around gap-6 md:gap-8 mb-10">
                    <div className="flex items-center gap-4 bg-blue-100 p-4 border border-black rounded-lg">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <div className="w-full h-full rounded-full border-4 border-black overflow-hidden">
                          <div
                            className="absolute inset-0 bg-green-200"
                            style={{
                              clipPath:
                                servicesOfferedCount > 0
                                  ? `polygon(0 0, ${Math.min(
                                      100,
                                      (servicesOfferedCount /
                                        (servicesOfferedCount +
                                          servicesReceivedCount) || 0) * 100
                                    )}% 0, ${Math.min(
                                      100,
                                      (servicesOfferedCount /
                                        (servicesOfferedCount +
                                          servicesReceivedCount) || 0) * 100
                                    )}% 100%, 0 100%)`
                                  : "none",
                            }}
                          ></div>
                          <div
                            className="absolute inset-0 bg-blue-200"
                            style={{
                              clipPath:
                                servicesReceivedCount > 0
                                  ? `polygon(${Math.max(
                                      0,
                                      (servicesOfferedCount /
                                        (servicesOfferedCount +
                                          servicesReceivedCount) || 0) * 100
                                    )}% 0, 100% 0, 100% 100%, ${Math.max(
                                      0,
                                      (servicesOfferedCount /
                                        (servicesOfferedCount +
                                          servicesReceivedCount) || 0) * 100
                                    )}% 100%)`
                                  : "none",
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-white border-2 border-black flex flex-col items-center justify-center">
                              <span className="text-xl font-bold">
                                {servicesOfferedCount + servicesReceivedCount}
                              </span>
                              <span className="text-xs">Total</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-200 border border-black"></div>
                          <span className="text-base ml-1.5">
                            Offered: {servicesOfferedCount}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-200 border border-black"></div>
                          <span className="text-base ml-1.5">
                            Received: {servicesReceivedCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-100 px-6 py-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[160px] rounded-lg">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-satoshi text-base font-semibold text-black mb-1">
                          Hours Banked
                        </span>
                        <span className="text-2xl font-bold text-black">
                          {hoursBanked}
                        </span>
                        <span className="text-xs text-gray-600 mt-1">
                          Last updated: {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t-2 border-black pt-4 mb-6 px-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-satoshi text-xl font-bold text-black">
                        Pending Exchanges
                      </h3>
                      {pendingExchangesCount > 0 && (
                        <span className="px-2 py-1 bg-yellow-200 border border-black text-base font-bold">
                          {pendingExchangesCount} Pending
                        </span>
                      )}
                    </div>
                    {pendingExchanges && pendingExchanges.length > 0 ? (
                      <div className="space-y-3">
                        {pendingExchanges
                          .slice(0, 2)
                          .map((exchange: Exchange) => (
                            <div
                              key={exchange.id}
                              className="mb-3 p-3 border-2 border-black bg-yellow-50 rounded-lg"
                            >
                              <div className="flex justify-between">
                                <span className="text-base font-bold">
                                  {exchange.providerId === userId
                                    ? `Request from ${
                                        exchange.requester?.name || "User"
                                      }`
                                    : `${
                                        exchange.providerService?.title ||
                                        "Service"
                                      }`}
                                </span>
                                <span className="bg-yellow-200 text-sm px-2 py-1 border border-black">
                                  Action needed
                                </span>
                              </div>
                              <p className="text-base mt-1 leading-normal">
                                {exchange.providerId === userId
                                  ? `${
                                      exchange.requester?.name || "User"
                                    } has requested your ${
                                      exchange.providerService?.title ||
                                      "service"
                                    }`
                                  : `${
                                      exchange.provider?.name || "User"
                                    } requires action on your request`}
                                {exchange.scheduledDate &&
                                  ` for ${new Date(
                                    exchange.scheduledDate
                                  ).toLocaleDateString()}`}
                              </p>
                              <div className="mt-2 flex space-x-2">
                                <Link
                                  href={`/exchanges/${exchange.id}`}
                                  className="px-4 py-2 text-base bg-blue-200 border border-black hover:bg-blue-300 transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-black"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          ))}
                        {pendingExchangesCount > 2 && (
                          <Link
                            href="/exchanges?status=pending"
                            className="text-base font-bold text-blue-600 underline block text-center mt-2 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black"
                          >
                            View all {pendingExchangesCount} pending exchanges
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-base text-gray-600 leading-normal">
                          No pending exchanges
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border-t-2 border-black pt-4 mt-6 px-6 pb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-satoshi text-xl font-bold text-black">
                        Recent Activity
                      </h3>
                      <Link
                        href="/activity"
                        className="text-base font-bold text-black no-underline hover:underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black"
                      >
                        View All
                      </Link>
                    </div>
                    {recentActivity && recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity
                          .slice(0, 3)
                          .map((activity: Exchange) => (
                            <div
                              key={activity.id}
                              className="relative pl-5 border-l-2 border-black"
                            >
                              <div
                                className={`absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-sm ${
                                  activity.status === "COMPLETED"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                {activity.updatedAt
                                  ? new Date(
                                      activity.updatedAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : ""}
                              </p>
                              <p className="text-lg font-bold text-black leading-snug">
                                {activity.status === "COMPLETED"
                                  ? "Completed exchange"
                                  : "Cancelled exchange"}
                                {activity.providerId === userId
                                  ? ` with ${
                                      activity.requester?.name || "User"
                                    }`
                                  : ` with ${
                                      activity.provider?.name || "User"
                                    }`}
                              </p>
                              <p className="text-sm text-gray-700">
                                {activity.providerService?.title || "Service"} ·{" "}
                                {activity.hours || 0}h
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="min-h-[100px] flex items-center justify-center bg-gray-100 border-2 border-black rounded-lg">
                        <p className="text-base font-medium text-black leading-normal">
                          No recent activity to display
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar - 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <div className="bg-blue-500 px-4 py-3 border-b-2 border-black rounded-t-lg">
                  <h2 className="font-satoshi tracking-tight text-lg font-bold flex items-center text-white">
                    <User className="mr-2" size={18} strokeWidth={2} /> Profile
                    Setup
                  </h2>
                </div>
                <div className="px-5 py-5 font-inter rounded-b-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-satoshi text-sm font-semibold text-black block mb-1">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-black">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 border border-black h-3 mb-4 rounded-lg">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500 ease-out rounded-lg"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2 text-sm mb-2">
                    <h3 className="font-satoshi font-semibold text-black mb-2">
                      Complete these steps:
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="flex-shrink-0 w-5 h-5 bg-white border-2 border-black flex items-center justify-center rounded-lg">
                          {!hasMissingRadius && (
                            <CheckCircle
                              size={12}
                              className="text-green-600"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        <Link
                          href="/profile/edit#radius"
                          className="ml-2 text-black font-medium no-underline hover:underline transition-colors transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black"
                        >
                          Set your service radius
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <div className="flex-shrink-0 w-5 h-5 bg-white border-2 border-black flex items-center justify-center rounded-lg">
                          {!hasMissingSkills && (
                            <CheckCircle
                              size={12}
                              className="text-green-600"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        <Link
                          href="/profile/edit#skills"
                          className="ml-2 text-black font-medium no-underline hover:underline transition-colors transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black"
                        >
                          Add your skills
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <div className="flex-shrink-0 w-5 h-5 bg-white border-2 border-black flex items-center justify-center rounded-lg">
                          {!hasMissingServices && (
                            <CheckCircle
                              size={12}
                              className="text-green-600"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        <Link
                          href="/services/new"
                          className="ml-2 text-black font-medium no-underline hover:underline transition-colors transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black"
                        >
                          Create your first service
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {profileCompletion >= 100 && (
                    <p className="text-green-600 font-bold flex items-center text-sm mt-2">
                      <CheckCircle size={16} className="mr-1" strokeWidth={2} />
                      Profile Complete!
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <div className="bg-blue-500 px-4 py-3 border-b-2 border-black rounded-t-lg">
                  <h2 className="font-satoshi tracking-tight text-lg font-bold flex items-center text-white">
                    <Star className="mr-2" size={18} strokeWidth={2} /> Build
                    Reputation
                  </h2>
                </div>
                <div className="font-inter p-6 rounded-b-lg">
                  <div className="p-6 text-center">
                    <p className="text-sm font-medium text-black mb-4 leading-normal">
                      Complete exchanges to enhance your reputation in the
                      community.
                    </p>
                    <Link href="/reputation" className="block w-full">
                      <span className="w-full inline-block px-4 py-2 bg-blue-300 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg">
                        View Reputation
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Calendar Card */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <div className="bg-blue-500 px-4 py-3 border-b-2 border-black rounded-t-lg">
                  <h2 className="font-satoshi tracking-tight text-lg font-bold flex items-center text-white">
                    <CalendarIcon className="mr-2" size={18} strokeWidth={2} />{" "}
                    Calendar
                  </h2>
                </div>
                <div className="p-4 rounded-b-lg">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full scale-90 origin-top rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    modifiers={{
                      scheduled: (date) => !!scheduledMap[date.toDateString()],
                    }}
                    modifiersClassNames={{
                      scheduled:
                        "bg-yellow-200 border-2 border-yellow-500 relative",
                    }}
                  />
                  {selectedDate && (
                    <div className="mt-3 p-3 bg-blue-50 border-2 border-black rounded-lg">
                      {(() => {
                        const ex = scheduledMap[selectedDate.toDateString()];
                        if (ex) {
                          const isRequester = ex.requesterId === userId;
                          const serviceTitle =
                            ex.providerService?.title ||
                            ex.requesterService?.title ||
                            "Service";
                          const scheduledTime = ex.scheduledDate
                            ? new Date(ex.scheduledDate).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "";
                          return (
                            <>
                              <h3 className="font-satoshi font-bold text-base mb-1">
                                Scheduled Exchange
                              </h3>
                              <p className="text-base text-gray-700 font-bold">
                                {serviceTitle}
                              </p>
                              <p className="text-base text-gray-700">
                                {ex.scheduledDate
                                  ? new Date(
                                      ex.scheduledDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : ""}{" "}
                                {scheduledTime && `at ${scheduledTime}`}
                              </p>
                              {isRequester && (
                                <p className="text-sm text-blue-700 font-semibold mt-1">
                                  This service is due for you
                                </p>
                              )}
                            </>
                          );
                        }
                        return (
                          <>
                            <h3 className="font-satoshi font-bold text-base mb-1">
                              Selected
                            </h3>
                            <p className="text-base text-gray-700">
                              {selectedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};

// Define the reusable DashboardCard component
interface DashboardCardProps {
  icon: React.ElementType; // Lucide icon component
  title: string;
  children: React.ReactNode;
  className?: string; // Optional additional classes for the outer div
  headerClassName?: string; // Optional classes for the header background/text
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon: Icon,
  title,
  children,
  className = "bg-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", // Default styles
  headerClassName = "bg-blue-500 text-white border-black", // Default header styles
}) => {
  return (
    <div className={`border-2 ${className}`}>
      <div className={`px-4 py-3 border-b-2 ${headerClassName}`}>
        <h2 className="font-satoshi tracking-tight text-sm font-bold flex items-center">
          <Icon className="mr-2 flex-shrink-0" size={16} strokeWidth={2} />{" "}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

export default DashboardPage;
