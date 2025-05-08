'use client';

import React, { useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, BarChart, Activity, PlusCircle, Search, ArrowRightLeft, MessagesSquare,
  Calendar as CalendarIcon,
  MapPin, Bell, AlertCircle, CheckCircle, Clock, Users, Sparkles, Mail,
  Loader2, ChevronRight, List
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Calendar } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";

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

// Interface for notification data
interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt?: string | Date;
  exchangeId?: string;
}

// Minimal UserProfile type matching simplified getProfile
type UserProfile = {
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
} | null | undefined;

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [today, setToday] = useState<Date | undefined>(new Date());
  
  // Get user ID from session
  const userId = (session?.user as any)?.id;
  const isLoaded = status !== 'loading';
  const isSignedIn = status === 'authenticated';

  // --- tRPC Query for User Profile ---
  const { data: userProfile, isLoading: profileLoading, error: profileError } = trpc.user.getProfile.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn, // Enable when userId is available and user is authenticated
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- tRPC Query for Profile Completion ---
  const { data: profileCompletionData } = trpc.user.getProfileCompletion.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- tRPC Query for Dashboard Stats ---
  const { data: dashboardStats } = trpc.user.getDashboardStats.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- tRPC Query for Upcoming Exchanges ---
  const { data: upcomingExchanges } = trpc.exchange.getUpcomingExchanges.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- tRPC Query for Pending Exchanges ---
  const { data: pendingExchanges } = trpc.exchange.getPendingExchanges.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- tRPC Query for Recent Activity ---
  const { data: recentActivity } = trpc.exchange.getRecentActivity.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- tRPC Query for Notifications ---
  const { data: notifications } = trpc.user.getNotifications.useQuery(
    undefined,
    {
      enabled: !!userId && isSignedIn,
      staleTime: 5 * 60 * 1000,
    }
  ) as { data: Notification[] | undefined };

  // --- Authentication Check ---
  React.useEffect(() => {
    // Redirect if loaded but user is not signed in
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // --- Profile Completion Calculation ---
  const { profileCompletion, hasMissingRadius, hasMissingSkills, hasMissingServices } = useMemo(() => {
    if (profileCompletionData) {
      return {
        profileCompletion: profileCompletionData.percentage,
        hasMissingRadius: !profileCompletionData.hasServiceRadius,
        hasMissingSkills: !profileCompletionData.hasSkills,
        hasMissingServices: !profileCompletionData.hasServices,
      };
    }
    
    // Fallback values if data is not available
    return {
      profileCompletion: 0,
      hasMissingRadius: true,
      hasMissingSkills: true,
      hasMissingServices: true,
    };
  }, [profileCompletionData]);

  // --- Activity Chart Data Processing ---
  const activityChartData = useMemo(() => {
    if (!recentActivity || recentActivity.length === 0) {
      // Provide some default data if no activity exists
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 0
        };
      });
    }

    // Get the last 7 days for the x-axis
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });

    // Count activity per day
    const activityByDay = new Map();
    last7Days.forEach(day => {
      activityByDay.set(day, 0);
    });

    // Count activities by day
    recentActivity.forEach(activity => {
      if (!activity.updatedAt) return;
      
      const date = new Date(activity.updatedAt);
      const dateStr = date.toISOString().split('T')[0];
      
      // Only count if it's within our 7-day window
      if (activityByDay.has(dateStr)) {
        activityByDay.set(dateStr, activityByDay.get(dateStr) + 1);
      }
    });

    // Format the data for the chart
    return Array.from(activityByDay.entries()).map(([dateStr, count]) => {
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count
      };
    });
  }, [recentActivity]);

  // --- Loading State ---
  if (!isLoaded || (isSignedIn && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center">
           <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" strokeWidth={2} />
           <p className="text-xl font-semibold text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
   if (profileError) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
         <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" strokeWidth={2} />
            <h2 className="font-satoshi text-xl font-bold text-red-700 mb-2">Error Loading Profile</h2>
            <p className="text-sm text-gray-600 mb-4 leading-normal">Could not load your profile data. Please try again later.</p>
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
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

    // Get data from tRPC queries or use defaults
    const unreadNotifications = dashboardStats?.unreadNotificationsCount || 0;
    const servicesOfferedCount = dashboardStats?.servicesOfferedCount || 0;
    const servicesReceivedCount = dashboardStats?.servicesReceivedCount || 0;
    const hoursBanked = dashboardStats?.hoursBanked || 0;
    const pendingExchangesCount = pendingExchanges?.length || 0;
    const upcomingExchangesCount = upcomingExchanges?.length || 0; // Get count for upcoming

    // Determine button state based on VISIBLE upcoming/pending exchanges
    const totalVisibleActive = pendingExchangesCount + upcomingExchangesCount;
    let singleVisibleActiveId: string | null | undefined = null;
    if (totalVisibleActive === 1) {
      if (pendingExchangesCount === 1) {
        singleVisibleActiveId = pendingExchanges?.[0]?.id;
      } else if (upcomingExchangesCount === 1) {
        singleVisibleActiveId = upcomingExchanges?.[0]?.id;
      }
    }
    
    const myExchangesHref = totalVisibleActive === 1 && singleVisibleActiveId ? `/exchanges/${singleVisibleActiveId}` : '#';
    const isMyExchangesDisabled = totalVisibleActive !== 1 || !singleVisibleActiveId;

    return (
      <div className="min-h-screen bg-blue-50">
        {/* Simple header without visible navbar */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
            <h1 className="font-satoshi tracking-tight text-2xl md:text-3xl font-bold mb-2 md:mb-0">
              Welcome, {session?.user?.name || 'User'}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                <Bell size={20} strokeWidth={2} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border border-black">
                    {unreadNotifications}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </button>
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 bg-red-100 text-red-700 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            >
              Sign Out
            </button>
          </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left sidebar - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* 1. Profile Setup & Completion Section */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-blue-500 px-4 py-3 border-b-2 border-black">
                  <h2 className="font-satoshi tracking-tight text-sm font-bold flex items-center text-white">
                    <User className="mr-2" size={16} strokeWidth={2} /> Profile Setup
                  </h2>
                </div>
                <div className="px-5 py-5 font-inter">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-satoshi text-sm font-semibold text-black block mb-1">Progress</span>
                    <span className="text-sm font-bold text-black">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 border border-black h-3 mb-4">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500 ease-out" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-2">
                    <h3 className="font-satoshi font-semibold text-black mb-2">Complete these steps:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-white border-2 border-black flex items-center justify-center mt-0.5">
                          {!hasMissingRadius && <CheckCircle size={12} className="text-green-600" strokeWidth={2} />}
                        </div>
                        <Link href="/profile/edit#radius" className="ml-2 text-blue-600 underline font-medium focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">Set your service radius</Link>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-white border-2 border-black flex items-center justify-center mt-0.5">
                          {!hasMissingSkills && <CheckCircle size={12} className="text-green-600" strokeWidth={2} />}
                        </div>
                        <Link href="/profile/edit#skills" className="ml-2 text-blue-600 underline font-medium focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">Add your skills</Link>
                      </li>
                      
                      <li className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-white border-2 border-black flex items-center justify-center mt-0.5">
                          {!hasMissingServices && <CheckCircle size={12} className="text-green-600" strokeWidth={2} />}
                        </div>
                        <Link href="/services/new" className="ml-2 text-blue-600 underline font-medium focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">Create your first service</Link>
                      </li>
                    </ul>
            </div>

                  {profileCompletion >= 100 && (
                    <p className="text-green-600 font-bold flex items-center text-sm mt-2">
                      <CheckCircle size={16} className="mr-1" strokeWidth={2}/>Profile Complete!
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Upcoming Exchanges Calendar */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-blue-500 px-4 py-3 border-b-2 border-black flex justify-between items-center">
                  <h2 className="font-satoshi tracking-tight text-sm font-bold flex items-center text-white">
                    <CalendarIcon className="mr-2" size={16} strokeWidth={2} /> Upcoming
                  </h2>
                  <Link href="/exchanges" className="text-white text-xs font-bold flex items-center underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white">
                    View All <ChevronRight className="h-3 w-3 ml-1" strokeWidth={3} />
              </Link>
            </div>
                <div className="calendar-container font-inter p-0 pb-4">
                  <Calendar
                    mode="single"
                    selected={today}
                    onSelect={setToday}
                      className="border-0 shadow-none [&_button[name=day]]:w-8 [&_button[name=day]]:h-8 [&_caption]:pt-1.5 [&_caption]:pb-1 [&_button]:focus-visible:ring-1 [&_button]:focus-visible:ring-black [&_button]:focus-visible:ring-offset-1"
                  />
                </div>
                <div className="px-5 py-4 bg-blue-50 border-t-2 border-black">
                  <h3 className="font-satoshi font-bold text-sm mb-2">Scheduled:</h3>
                  
                  {upcomingExchanges && upcomingExchanges.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingExchanges.slice(0, 2).map((exchange: Exchange) => (
                        <div 
                          key={exchange.id}
                          className={`mb-2 p-2 border-2 border-black ${ exchange.providerId === userId ? 'bg-purple-100' : 'bg-green-100' }`}
                        >
                          <div className="flex justify-between text-xs font-medium">
                            <span className="font-bold">
                              {exchange.scheduledDate ? new Date(exchange.scheduledDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : 'Date TBD'}
                            </span>
                            <span className={`${ exchange.providerId === userId ? 'bg-purple-200' : 'bg-green-200' } border border-black px-1`}>
                              {exchange.providerId === userId ? 'Providing' : 'Receiving'}
                            </span>
                          </div>
                          <p className="text-xs font-bold mt-1">
                            {exchange.providerId === userId 
                              ? `${exchange.requester?.name || 'Someone'} requested ${exchange.providerService?.title || 'your service'}`
                              : `${exchange.provider?.name || 'Someone'} will provide ${exchange.providerService?.title || 'a service'}`
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-center text-gray-600">
                      No upcoming exchanges. <Link href="/services/browse" className="text-blue-600 underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">Find services to request</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main content - 6 columns */}
            <div className="lg:col-span-6 space-y-8">
              {/* Quick Actions Card */} 
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <h2 className="font-satoshi tracking-tight text-lg font-bold text-black mb-5">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 font-inter">
                  {/* Update link background to white, ensure icon color is applied */} 
                  <Link href="/services/new" className="block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                    <PlusCircle className="mx-auto mb-1 text-green-600" size={24} strokeWidth={2} /> {/* Use text-green-600 for icon */}
                    <span className="font-bold text-sm text-black">Offer Service</span> {/* Ensure text is black */} 
                  </Link>
                  <Link href="/services/browse" className="block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                    <Search className="mx-auto mb-1 text-blue-600" size={24} strokeWidth={2} /> {/* Use text-blue-600 for icon */} 
                    <span className="font-bold text-sm text-black">Find Services</span> {/* Ensure text is black */} 
                  </Link>
                  <Link 
                    href={myExchangesHref}
                    aria-disabled={isMyExchangesDisabled} 
                    onClick={(e) => { if (isMyExchangesDisabled) e.preventDefault(); }} 
                    className={cn(
                      "block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black", /* Changed background */
                      isMyExchangesDisabled && "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    <ArrowRightLeft className="mx-auto mb-1 text-purple-600" size={24} strokeWidth={2} /> {/* Use text-purple-600 for icon */} 
                    <span className="font-bold text-sm text-black">My Exchanges</span> {/* Ensure text is black */} 
                  </Link>
                  <Link href="/services/my-services" className="block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                    <List className="mx-auto mb-1 text-yellow-600" size={24} strokeWidth={2} /> {/* Use text-yellow-600 for icon */} 
                    <span className="font-bold text-sm text-black">My Services</span> {/* Ensure text is black */} 
              </Link>
                </div>
              </div>

              {/* Activity Overview Card */} 
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="px-6 py-5 border-b-2 border-black flex justify-between items-center">
                  <h2 className="font-satoshi tracking-tight text-lg font-bold text-black flex items-center">
                    <BarChart className="mr-2" size={20} strokeWidth={2} /> Activity Overview
                  </h2>
                   <Link href="/activity" className="text-xs font-bold text-blue-600 underline flex items-center focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">
                    View Detailed Activity <ChevronRight className="h-3 w-3 ml-1" strokeWidth={3}/>
                   </Link>
                </div>
                <div className="px-6 py-6 font-inter">
                   <div className="flex flex-col md:flex-row items-center justify-center md:justify-around gap-6 md:gap-8 mb-10">
                    {/* Wrap donut chart visualization in a background container */} 
                    <div className="flex items-center gap-4 bg-blue-100 p-4 border border-black"> 
                      <div className="relative w-32 h-32 flex-shrink-0"> {/* Added flex-shrink-0 */} 
                        <div className="w-full h-full rounded-full border-4 border-black overflow-hidden"> {/* Keep donut style */}
                          <div className="absolute inset-0 bg-green-200" style={{ clipPath: servicesOfferedCount > 0 ? `polygon(0 0, ${Math.min(100, (servicesOfferedCount / (servicesOfferedCount + servicesReceivedCount) || 0.5) * 100)}% 0, ${Math.min(100, (servicesOfferedCount / (servicesOfferedCount + servicesReceivedCount) || 0.5) * 100)}% 100%, 0 100%)` : 'none' }}></div>
                          <div className="absolute inset-0 bg-blue-200" style={{ clipPath: servicesReceivedCount > 0 ? `polygon(${Math.max(0, (servicesOfferedCount / (servicesOfferedCount + servicesReceivedCount) || 0.5) * 100)}% 0, 100% 0, 100% 100%, ${Math.max(0, (servicesOfferedCount / (servicesOfferedCount + servicesReceivedCount) || 0.5) * 100)}% 100%)` : 'none' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-white border-2 border-black flex flex-col items-center justify-center">
                            <span className="text-xl font-bold">{servicesOfferedCount + servicesReceivedCount}</span>
                            <span className="text-xs">Total</span>
                          </div>
                        </div>
                      </div>
                      </div>
                      {/* Legend stays next to it */} 
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-200 border border-black"></div>
                          <span className="text-xs ml-1.5">Offered: {servicesOfferedCount}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-200 border border-black"></div>
                          <span className="text-xs ml-1.5">Received: {servicesReceivedCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hours Banked - Adjust padding slightly if needed, keep bg */}
                    <div className="bg-blue-100 px-6 py-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[160px]"> {/* Adjusted py */} 
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-satoshi text-sm font-semibold text-black mb-1">Hours Banked</span>
                        <span className="text-3xl font-bold text-black">{hoursBanked}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pending Exchanges */} 
                  <div className="border-t-2 border-black pt-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-satoshi text-base font-semibold text-black">Pending Exchanges</h3>
                      {pendingExchangesCount > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-200 border border-black text-xs font-bold">
                        {pendingExchangesCount} Pending
                      </span>
                      )}
            </div>
                    {pendingExchanges && pendingExchanges.length > 0 ? (
                      <div className="space-y-3">
                        {pendingExchanges.slice(0, 2).map((exchange: Exchange) => (
                          <div key={exchange.id} className="mb-3 p-3 border-2 border-black bg-yellow-50">
                            <div className="flex justify-between">
                              <span className="text-sm font-bold">
                                {exchange.providerId === userId
                                  ? `Request from ${exchange.requester?.name || 'User'}`
                                  : `${exchange.providerService?.title || 'Service'}`
                                }
                              </span>
                              <span className="bg-yellow-200 text-xs px-2 py-0.5 border border-black">Action needed</span>
                            </div>
                            <p className="text-xs mt-1 leading-normal">
                              {exchange.providerId === userId
                                ? `${exchange.requester?.name || 'User'} has requested your ${exchange.providerService?.title || 'service'}`
                                : `${exchange.provider?.name || 'User'} requires action on your request`
                              }
                              {exchange.scheduledDate && ` for ${new Date(exchange.scheduledDate).toLocaleDateString()}`}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <Link href={`/exchanges/${exchange.id}`} className="px-2 py-1 text-xs bg-blue-200 border border-black hover:bg-blue-300 transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-black">
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                        {pendingExchangesCount > 2 && (
                          <Link href="/exchanges?status=pending" className="text-xs font-bold text-blue-600 underline block text-center mt-2 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">
                            View all {pendingExchangesCount} pending exchanges
              </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 border-2 border-dashed border-gray-300">
                        <p className="text-sm text-gray-600 leading-normal">No pending exchanges</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Recent Activity */} 
                  <div className="border-t-2 border-black pt-4 mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-satoshi text-base font-semibold text-black">Recent Activity</h3>
                      <Link href="/activity" className="text-xs font-bold text-blue-600 underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">
                        View All
              </Link>
            </div>
                    {recentActivity && recentActivity.length > 0 ? (
                      <div className="space-y-4"> {/* Increased spacing */} 
                        {recentActivity.slice(0, 3).map((activity: Exchange) => (
                          <div key={activity.id} className="relative pl-5 border-l-2 border-black"> {/* Adjusted padding */} 
                            {/* Updated dot style: simpler, using status colors */} 
                            <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 ${activity.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <p className="text-sm font-semibold text-gray-800">
                              {activity.status === "COMPLETED" ? "Completed exchange" : "Cancelled exchange"}
                              {activity.providerId === userId
                                ? ` with ${activity.requester?.name || 'User'}`
                                : ` with ${activity.provider?.name || 'User'}`
                              }
                            </p>
                            <p className="text-xs text-gray-600 leading-normal">
                              {activity.providerService?.title || 'Service'} - {activity.hours || 0} hours
                            </p>
                            <p className="text-xs mt-0.5 text-gray-500">
                              {activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-[100px] flex items-center justify-center bg-gray-100 border-2 border-black">
                        <p className="text-sm font-medium text-black leading-normal">No recent activity to display</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar - 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* 5. Nearby Services */}
              <NearbyServices profile={userProfile} />

              {/* 6. Community Feed */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-blue-500 px-4 py-3 border-b-2 border-black">
                  <h2 className="font-satoshi tracking-tight text-sm font-bold flex items-center text-white">
                    <Users className="mr-2" size={16} strokeWidth={2} /> Community Updates
                  </h2>
                </div>
                <div className="font-inter p-6">
                  <div className="p-6 text-center">
                    <p className="text-sm font-medium text-black mb-4 leading-normal">No community updates yet</p>
                    <button className="w-full px-4 py-2 bg-blue-300 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                      Invite Friends
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 7. Notification Center - MOVED FROM LEFT COLUMN */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-red-500 px-4 py-3 border-b-2 border-black">
                    <h2 className="font-satoshi tracking-tight text-sm font-bold flex items-center text-white">
                        <Bell className="mr-2" size={16} strokeWidth={2} /> Notifications
                  </h2>
                </div>
                <div className="font-inter divide-y-2 divide-black">
                  {notifications && notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 3).map((notification: Notification) => (
                        <div key={notification.id} className="px-5 py-4 hover:bg-blue-50">
                           <Link href={notification.exchangeId ? `/exchanges/${notification.exchangeId}` : '#'} className="block group focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-black">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 w-7 h-7 border border-black flex items-center justify-center mr-3 ${
                              notification.type === 'MESSAGE' ? 'bg-blue-100' :
                              notification.type === 'EXCHANGE_ACCEPTED' ? 'bg-green-100' :
                              notification.type === 'EXCHANGE_REQUEST' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                                  {notification.type === 'MESSAGE' ? <MessagesSquare size={14} strokeWidth={2}/> :
                                   notification.type === 'EXCHANGE_ACCEPTED' ? <CheckCircle size={14} strokeWidth={2}/> :
                                   notification.type === 'EXCHANGE_REQUEST' ? <Clock size={14} strokeWidth={2}/> :
                                   <Bell size={14} strokeWidth={2}/>
                              }
                            </div>
                            <div>
                                  <p className="text-xs font-bold group-hover:text-blue-600 leading-normal">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                          </div>
                           </Link>
                        </div>
                      ))}
                      <div className="px-5 py-3 text-center border-t-2 border-black">
                        <Link href="/notifications" className="text-xs font-bold text-blue-600 underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black">
                          View all notifications
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm font-medium text-black leading-normal">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback for unexpected states
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
  headerClassName = "bg-blue-500 text-white border-black" // Default header styles
}) => {
  return (
    <div className={`border-2 ${className}`}> {/* Use provided or default class */} 
      <div className={`px-4 py-3 border-b-2 ${headerClassName}`}> {/* Use provided or default header class */} 
        <h2 className="font-satoshi tracking-tight text-sm font-bold flex items-center">
          <Icon className="mr-2 flex-shrink-0" size={16} strokeWidth={2} /> {title}
        </h2>
      </div>
      {/* Render children passed to the card */} 
      {children}
    </div>
  );
};

// Nearby Services Component
const NearbyServices = ({ profile }: { profile: UserProfile }) => {
  // Check if location and radius are set
  const hasLocationData = !!profile?.location?.latitude && 
                          !!profile?.location?.longitude && 
                          profile.location.radius !== null && 
                          profile.location.radius !== undefined;

  // Use a query to potentially get a *count* of nearby services
  // For now, we'll just rely on the hasLocationData flag
  // const { data: nearbyCountData } = trpc.service.getNearbyServicesCount.useQuery(undefined, { enabled: hasLocationData }); 
  // const nearbyCount = nearbyCountData ?? 0; // Placeholder

  return (
    <DashboardCard icon={MapPin} title="Nearby Services" className="bg-green-100 border-green-500 shadow-[8px_8px_0px_0px_#22c55e]">
      <div className="p-4">
        {hasLocationData ? (
          // Display if location is set
          <div className="text-center">
            <p className="text-sm text-green-800 mb-3">Explore services offered by users near you.</p> 
            {/* <p className="text-lg font-bold text-green-900 mb-3">{nearbyCount} Services Found</p> Placeholder Count */} 
            <Link 
              href="/services/nearby" 
              className="inline-flex items-center px-4 py-2 bg-white text-green-700 font-semibold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            >
              View Nearby Services <ChevronRight className="w-4 h-4 ml-1"/>
            </Link>
          </div>
        ) : (
          // Display if location is NOT set
          <div className="bg-green-50 border-2 border-dashed border-black p-4 text-center">
            <p className="text-sm text-green-800 mb-3 font-medium">Set your location and radius in your profile to discover services nearby.</p>
            <Link 
              href="/profile/edit#location" 
              className="inline-flex items-center px-4 py-2 bg-white text-green-700 font-semibold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            >
              Update Profile
            </Link>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default DashboardPage; 