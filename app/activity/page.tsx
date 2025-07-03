'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, CheckCircle, XCircle, BarChart, LineChart as LineChartIcon } from 'lucide-react';
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
import { DashboardLayout } from '@/components/DashboardLayout';

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
  const [clientTime, setClientTime] = useState<string | null>(null);

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

  useEffect(() => {
    setClientTime(
      lastRefreshTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    );
  }, [lastRefreshTime]);

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
        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center max-w-md">
           <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" strokeWidth={2} />
           <h2 className="font-satoshi text-xl font-bold text-red-700 mb-2">Error Loading Activity</h2>
           <p className="text-sm text-gray-600 mb-4 leading-normal">Could not load your activity history. Please try again later.</p>
        </div>
      </div>
    );
  }

  // --- Render Activity Page ---
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-blue-50 font-inter pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative mb-8">
            <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black">Activity History</h1>
            <div className="relative">
              <svg 
                viewBox="0 0 200 8" 
                className="w-48 h-2 absolute left-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2,6 Q50,2 100,4 T198,6" 
                  stroke="#9ca3af" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
            {/* Bar Chart */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg p-5">
              <div className="flex items-center mb-1">
                <BarChart className="mr-2" size={24} strokeWidth={2} />
                <h2 className="font-satoshi tracking-tight text-xl font-bold text-black">Exchange Activity</h2>
              </div>
              <p className="text-sm text-gray-600">Completed exchanges per month</p>
              <div className="h-[280px] w-full mt-4 -ml-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart 
                    data={barChartData}
                    margin={{ top: 20, right: 0, left: 2, bottom: 20 }}
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
            {/* Line Chart */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg p-5">
              <div className="flex items-center mb-1">
                <LineChartIcon className="mr-2" size={24} strokeWidth={2} />
                <h2 className="font-satoshi tracking-tight text-xl font-bold text-black">Hours Banked</h2>
              </div>
              <p className="text-sm text-gray-600">Hours accumulated per month</p>
              <div className="h-[280px] w-full mt-4 -ml-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart 
                    data={lineChartData}
                    margin={{ top: 20, right: 2, left: 0, bottom: 20 }}
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
      </div>
    </DashboardLayout>
  );
};

export default ActivityPage; 