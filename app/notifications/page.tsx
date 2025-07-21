'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, ArrowLeft, Bell, CheckCircle, Clock, MessagesSquare, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { DashboardLayout } from '@/components/DashboardLayout';

// Interface matching the structure returned by getNotifications
interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt?: Date | string; // Allow string for createdAt from API
  isRead: boolean; // Assuming isRead is returned
  exchangeId?: string | null;
  // Add sender info if needed/available
}

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const utils = trpc.useUtils(); // Get tRPC utils

  // Redirect if not logged in
  React.useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  const { 
    data: notifications, 
    isLoading, 
    error, 
    refetch // Get refetch function
  } = trpc.user.getNotifications.useQuery(
    undefined, 
    { 
        enabled: authStatus === 'authenticated',
        staleTime: 1 * 60 * 1000, // Cache for 1 minute
    }
  );

  // --- Mark as Read Mutation ---
  const markReadMutation = trpc.user.markNotificationsAsRead.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Notifications marked as read.`);
        // Invalidate relevant queries
        utils.user.getNotifications.invalidate();
        utils.user.getDashboardStats.invalidate(); // For the bell badge
      } else {
        toast.error('Failed to mark notifications as read.');
      }
    },
    onError: (error) => {
      toast.error('Failed to mark notifications as read.');
      console.error("Mark read error:", error);
    },
  });

  const handleMarkAllRead = () => {
    // Call mutation without specific IDs to mark all unread
    markReadMutation.mutate({}); 
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE': return { Icon: MessagesSquare, color: 'bg-blue-100' };
      case 'EXCHANGE_REQUEST': return { Icon: Clock, color: 'bg-yellow-100' };
      case 'EXCHANGE_ACCEPTED': return { Icon: CheckCircle, color: 'bg-green-100' };
      case 'EXCHANGE_SCHEDULED': return { Icon: Clock, color: 'bg-indigo-100' }; // Added SCHEDULED
      case 'EXCHANGE_DECLINED': return { Icon: AlertCircle, color: 'bg-red-100' };
      case 'EXCHANGE_CANCELLED': return { Icon: AlertCircle, color: 'bg-gray-100' }; // Added CANCELLED
      case 'EXCHANGE_COMPLETED': return { Icon: CheckCircle, color: 'bg-green-100' };
      default: return { Icon: Bell, color: 'bg-gray-100' };
    }
  };

  // --- Loading State ---
  if (authStatus === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen py-10 font-inter text-center">
          <p className="text-red-600 text-lg">Error loading notifications: {error.message}</p>
          <Link href="/dashboard">
            <button className="mt-4 px-4 py-2 bg-blue-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // --- Main Content ---
  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-8 py-6 bg-blue-50 min-h-screen">
        
        {/* Header & Mark All Read Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-5xl lg:max-w-6xl mx-auto">
          <div>
            <div className="relative inline-block">
              <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black">Notifications</h1>
              <svg viewBox="0 0 200 8" className="w-full h-2 absolute left-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M2,6 Q50,2 100,4 T198,6" stroke="#9ca3af" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-base text-gray-600 mt-2">Stay updated with your latest activities</p>
          </div>
          <Button 
            onClick={handleMarkAllRead}
            disabled={markReadMutation.isPending || !notifications?.some(n => !n.isRead)}
            className="text-base font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black px-6 py-2"
          >
            {markReadMutation.isPending ? <Loader2 size={18} className="animate-spin mr-2"/> : <Check size={18} className="mr-2"/>}
            Mark All as Read
          </Button>
        </div>

        {/* Notification List */}
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification: Notification) => {
                const { Icon, color } = getNotificationIcon(notification.type);
                
                const notificationContent = (
                  <div className={cn(
                    "block bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 transition-all duration-150",
                    notification.exchangeId && "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer",
                    !notification.isRead && "border-l-4 border-l-blue-500"
                  )}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center ${color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-base font-semibold text-black leading-relaxed">{notification.message}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {notification.createdAt ? format(new Date(notification.createdAt), 'PPP p') : ''}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 border border-black mt-1" aria-label="Unread"></div>
                      )}
                    </div>
                  </div>
                );
                
                return notification.exchangeId ? (
                  <Link key={notification.id} href={`/exchanges/${notification.exchangeId}`}>
                    {notificationContent}
                  </Link>
                ) : (
                  <div key={notification.id}>
                    {notificationContent}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-400 bg-white rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Bell size={48} className="mx-auto text-gray-400 mb-6" />
              <h2 className="text-2xl font-bold text-black mb-3">No Notifications Yet</h2>
              <p className="text-base text-gray-600 mb-6">You currently have no notifications. When you have activity, it will appear here.</p>
              <Link href="/dashboard" className="inline-block px-6 py-3 bg-blue-500 text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage; 