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
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 py-10 font-inter text-center">
        <p className="text-red-600">Error loading notifications: {error.message}</p>
        <Link href="/dashboard">
            <button className="mt-4 px-4 py-2 bg-blue-200 border-2 border-black shadow-md">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="min-h-screen bg-blue-50 py-10 font-inter">
      <div className="container mx-auto max-w-3xl">
        
        {/* Header & Mark All Read Button */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-black mb-1">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="font-satoshi tracking-tight text-3xl font-bold">Notifications</h1>
            </div>
            <div>
                <Button 
                    onClick={handleMarkAllRead}
                    disabled={markReadMutation.isPending || !notifications?.some(n => !n.isRead)}
                    className="text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-white"
                >
                    {markReadMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2"/> : <Check size={16} className="mr-2"/>}
                    Mark All as Read
                </Button>
            </div>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification: Notification) => {
              const { Icon, color } = getNotificationIcon(notification.type);
              
              const notificationContent = (
                  <div className={cn(
                    "block bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 transition-all duration-150",
                    notification.exchangeId && "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 cursor-pointer",
                    !notification.isRead && "border-blue-500" // Example: Highlight unread
                  )}>
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 border border-black flex items-center justify-center ${color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-black">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.createdAt ? format(new Date(notification.createdAt), 'PP p') : ''}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" aria-label="Unread"></div>
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
            })
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-400 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Bell size={40} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Notifications Yet</h2>
              <p className="text-gray-600">You currently have no notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 