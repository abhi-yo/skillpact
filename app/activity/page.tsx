'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle, XCircle, BarChart, LineChart as LineChartIcon } from 'lucide-react';
import { 
  Bar, 
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis, 
  YAxis,
  CartesianGrid,
  ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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

// Interface for chart data
interface ChartDataItem {
  month: string;
  completed: number;
  cancelled: number;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "#000000",
  },
  cancelled: {
    label: "Cancelled",
    color: "#000000",
  },
} satisfies ChartConfig;

const ActivityPage: React.FC = () => {
  const { data: session } = useSession();
  // Assert the type of session.user to include the ID
  const userId = (session?.user as SessionUser | undefined)?.id;
  const utils = trpc.useContext();
  
  // Add refresh counter to force re-renders
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Fetch activity data
  const { data: activityData, isLoading, error, refetch } = trpc.exchange.getRecentActivity.useQuery(
    undefined, // No input needed for this query based on dashboard usage
    {
      enabled: !!userId, // Only run query if userId is available
      staleTime: 0, // Don't cache at all - always fetch fresh data
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );
  
  // Force refetch data when component mounts
  useEffect(() => {
    if (userId) {
      console.log('Forcing activity data refetch');
      
      // Invalidate all queries first
      utils.invalidate();
      
      // Then refetch specific queries
      refetch();
      utils.user.getDashboardStats.invalidate();
      utils.exchange.getRecentActivity.invalidate();
      
      setLastRefreshTime(new Date());
    }
  }, [userId, refetch, utils, refreshCounter]);

  // Create a function to handle manual refresh
  const handleManualRefresh = () => {
    console.log('Activity page manual refresh triggered');
    
    // First invalidate all queries
    utils.invalidate();
    
    // Then refetch specific ones
    refetch();
    utils.user.getDashboardStats.invalidate();
    utils.exchange.getRecentActivity.invalidate();
    
    // Increment counter to force re-renders
    setRefreshCounter(prev => prev + 1);
    setLastRefreshTime(new Date());
  };

  // Prepare bar chart data - simplified with hardcoded months
  const barChartData = useMemo(() => {
    // Get current month name for the chart
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' }).substring(0, 3);
    
    // We'll show last 6 months with current month last
    const today = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(today.getMonth() - i);
      months.push(d.toLocaleDateString('en-US', { month: 'short' }).substring(0, 3));
    }
    
    // Create baseline data with all zeros
    const baseData = months.map(month => ({
      month,
      completed: 0
    }));
    
    // If we have no activity data, return the baseline
    if (!activityData || activityData.length === 0) {
      return baseData;
    }
    
    // Process actual activity data
    activityData.forEach(item => {
      if (!item.updatedAt) return;
      
      const date = new Date(item.updatedAt);
      const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' }).substring(0, 3);
      
      // Find the corresponding month index
      const monthIndex = months.findIndex(m => m === monthAbbr);
      if (monthIndex >= 0 && item.status === 'COMPLETED') {
        baseData[monthIndex].completed += 1;
      }
    });
    
    return baseData;
  }, [activityData, refreshCounter]); // Add refreshCounter to dependencies

  // Prepare line chart data - hours per month
  const lineChartData = useMemo(() => {
    // Get current month name for the chart
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' }).substring(0, 3);
    
    // We'll show last 6 months with current month last
    const today = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(today.getMonth() - i);
      months.push(d.toLocaleDateString('en-US', { month: 'short' }).substring(0, 3));
    }
    
    // Create baseline data with all zeros
    const baseData = months.map(month => ({
      month,
      hours: 0
    }));
    
    // If we have no activity data, return the baseline
    if (!activityData || activityData.length === 0) {
      return baseData;
    }
    
    // Process actual activity data
    activityData.forEach(item => {
      if (!item.updatedAt || !item.hours) return;
      
      const date = new Date(item.updatedAt);
      const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' }).substring(0, 3);
      
      // Find the corresponding month index
      const monthIndex = months.findIndex(m => m === monthAbbr);
      if (monthIndex >= 0 && item.status === 'COMPLETED') {
        baseData[monthIndex].hours += item.hours;
      }
    });
    
    return baseData;
  }, [activityData, refreshCounter]); // Add refreshCounter to dependencies

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black mr-4">
            <ArrowLeft className="h-5 w-5" strokeWidth={2}/>
            <span className="sr-only">Back to Dashboard</span>
          </Link>
          <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black flex-grow">Activity History</h1>
          <button 
            onClick={handleManualRefresh} 
            className="text-sm font-bold bg-blue-100 px-3 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            Refresh Data
          </button>
        </div>
        
        {/* Add debug display */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 p-4">
          <p className="text-sm font-medium">Activity Data: {activityData?.length || 0} exchanges found</p>
          <p className="text-xs text-gray-600">Last updated: {lastRefreshTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
        </div>

        {/* Charts Section - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-5">
              <div className="flex items-center mb-1">
                <BarChart className="mr-2" size={24} strokeWidth={2} />
                <h2 className="font-satoshi tracking-tight text-xl font-bold text-black">Exchange Activity</h2>
              </div>
              <p className="text-sm text-gray-600">Completed exchanges per month</p>
              
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart 
                    data={barChartData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 2]}
                      ticks={[0, 1, 2]}
                    />
                    <Bar 
                      dataKey="completed"
                      name="Completed"
                      fill="black" 
                      radius={[4, 4, 4, 4]}
                      maxBarSize={60}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-5">
              <div className="flex items-center mb-1">
                <LineChartIcon className="mr-2" size={24} strokeWidth={2} />
                <h2 className="font-satoshi tracking-tight text-xl font-bold text-black">Hours Banked</h2>
              </div>
              <p className="text-sm text-gray-600">Hours accumulated per month</p>
              
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart 
                    data={lineChartData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 2]}
                      ticks={[0, 1, 2]}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="black"
                      strokeWidth={2}
                      dot={{ fill: 'black', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'black' }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Exchange Card */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 border-2 border-black bg-green-200 flex items-center justify-center mr-4 mt-1">
                <CheckCircle size={18} className="text-green-700" strokeWidth={2} />
              </div>
              <div>
                <p className="text-base font-semibold text-black">
                  Completed Exchange <span className="font-medium text-gray-700">with Akshat Singh</span>
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Service: "100 Sol Exchange" - 1 hour
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  May 3, 2025
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-blue-100 border border-black hover:bg-blue-200 transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-black">
              View Exchange
            </button>
          </div>
        </div>

        {/* All Activity */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-satoshi text-lg font-bold p-5 border-b-2 border-black">All Activity</h3>
          
          <div className="p-5 border-b-2 border-black">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 border-2 border-black bg-green-200 flex items-center justify-center mr-4 mt-1">
                  <CheckCircle size={18} className="text-green-700" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-base font-semibold text-black">
                    Completed Exchange <span className="font-medium text-gray-700">with Akshat Singh</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Service: "100 Sol Exchange" - 1 hour
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    May 3, 2025
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs bg-blue-100 border border-black hover:bg-blue-200 transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-black">
                View Exchange
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage; 