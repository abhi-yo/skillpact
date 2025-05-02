'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, User, ArrowRightLeft, Clock, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Define a specific type for the Exchange details fetched
// based on the include statement in the backend procedure
interface ExchangeDetails {
  id: string;
  status: string; // Consider using the actual Prisma enum type if imported
  providerId: string;
  requesterId: string;
  providerServiceId: string;
  requesterServiceId: string | null; // Allow null if not always present
  scheduledDate: Date | string | null;
  completedDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  hours: number | null;
  provider: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  requester: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  providerService: {
    id: string;
    title: string | null;
  } | null;
  requesterService: { // Optional requester service
    id: string;
    title: string | null;
  } | null;
}

// Helper function to format dates nicely
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Not set';
  try {
    return format(new Date(date), 'PPP p'); // e.g., Jun 21, 2024, 2:30 PM
  } catch (e) {
    return 'Invalid Date';
  }
};

const ExchangeDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const exchangeId = params.exchangeId as string;
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | undefined>();
    const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const { data: exchange, isLoading, error, refetch } = trpc.exchange.getExchangeById.useQuery(
        { id: exchangeId },
        {
            enabled: !!exchangeId && authStatus === 'authenticated', // Only run query if exchangeId exists and user is authenticated
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );

    // --- Respond to Request Mutation ---
    const respondMutation = trpc.exchange.respondToRequest.useMutation({
        onMutate: () => {
            setIsLoadingAction(true);
        },
        onSuccess: (data) => {
            toast.success(`Exchange ${data.status === 'ACCEPTED' ? 'accepted' : 'declined'}.`);
            if (data.status === 'ACCEPTED') {
                setIsSchedulingDialogOpen(true);
            }
            refetch();
        },
        onError: (error) => {
            toast.error(`Failed to respond: ${error.message}`);
            console.error("Respond error:", error);
        },
        onSettled: () => {
            setIsLoadingAction(false);
        },
    });

    // --- Schedule Exchange Mutation ---
    const scheduleMutation = trpc.exchange.scheduleExchange.useMutation({
        onMutate: () => {
            setIsLoadingAction(true);
        },
        onSuccess: () => {
            toast.success('Exchange scheduled successfully!');
            setIsSchedulingDialogOpen(false);
            setSelectedScheduleDate(undefined);
            refetch();
        },
        onError: (error) => {
            toast.error(`Failed to schedule: ${error.message}`);
            console.error("Schedule error:", error);
        },
        onSettled: () => {
            setIsLoadingAction(false);
        },
    });

    // --- Cancel Exchange Mutation ---
    const cancelMutation = trpc.exchange.cancelExchange.useMutation({
        onMutate: () => {
            setIsCancelling(true);
        },
        onSuccess: () => {
            toast.success('Exchange cancelled successfully.');
            refetch();
        },
        onError: (error) => {
            toast.error(`Failed to cancel: ${error.message}`);
            console.error("Cancel error:", error);
        },
        onSettled: () => {
            setIsCancelling(false);
        },
    });

    // --- Complete Exchange Mutation ---
    const completeMutation = trpc.exchange.completeExchange.useMutation({
        onMutate: () => {
            setIsLoadingAction(true);
        },
        onSuccess: () => {
            toast.success('Exchange marked as complete!');
            refetch();
        },
        onError: (error) => {
            toast.error(`Failed to complete: ${error.message}`);
            console.error("Complete error:", error);
        },
        onSettled: () => {
            setIsLoadingAction(false);
        },
    });

    const handleRespond = (accept: boolean) => {
        if (!exchangeId) return;
        respondMutation.mutate({ exchangeId, accept });
    };

    const handleSchedule = () => {
        if (!exchangeId || !selectedScheduleDate) {
            toast.error('Please select a date first.');
            return;
        }
        scheduleMutation.mutate({ 
            exchangeId, 
            scheduledDate: selectedScheduleDate
        });
    };

    const handleComplete = () => {
        if (!exchangeId) return;
        // TODO: Implement getting hours (e.g., prompt or modal)
        // For now, we'll complete without specifying hours (backend handles optional hours)
        const hoursInput = prompt("Enter hours completed (optional, min 0.5):", "1"); 
        let hours: number | undefined = undefined;
        if (hoursInput) {
            const parsedHours = parseFloat(hoursInput);
            if (!isNaN(parsedHours) && parsedHours >= 0.5) {
                hours = parsedHours;
            } else if (hoursInput.trim() !== "") { // Allow empty input to proceed without hours
                 toast.error("Invalid hours entered. Please enter a number >= 0.5 or leave blank.");
                 return; // Stop if invalid number entered
            }
        }
        
        // Add confirmation dialog
        if (window.confirm("Are you sure you want to mark this exchange as complete?")) {
            completeMutation.mutate({ exchangeId, hours });
        }
    };

    const handleCancel = () => {
        if (!exchangeId || !exchange) return;
        if (window.confirm('Are you sure you want to cancel this exchange? This cannot be undone.')) {
            cancelMutation.mutate({ exchangeId });
        }
    };

    React.useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/login');
        }
    }, [authStatus, router]);

    // Set initial selected date if exchange is already scheduled
    React.useEffect(() => {
        if (exchange?.scheduledDate) {
            setSelectedScheduleDate(new Date(exchange.scheduledDate));
        }
    }, [exchange?.scheduledDate]);

    const isCancellable = exchange && ['REQUESTED', 'ACCEPTED', 'SCHEDULED'].includes(exchange.status);

    if (authStatus === 'loading' || (authStatus === 'authenticated' && isLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 text-center">
                <Card className="max-w-md mx-auto border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <CardHeader className="bg-red-100 border-b-2 border-black">
                        <CardTitle className="flex items-center justify-center text-red-700">
                            <AlertCircle className="mr-2" size={20} /> Error Loading Exchange
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-sm text-red-600 mb-4">
                            {error.data?.code === 'FORBIDDEN'
                                ? 'You do not have permission to view this exchange.'
                                : `Could not load exchange details: ${error.message}`}
                        </p>
                        <Link href="/exchanges">
                           <Button>Back to Exchanges</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!exchange) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-gray-600">Exchange not found or still loading...</p>
                <Link href="/exchanges">
                    <Button className="mt-4">Back to Exchanges</Button>
                </Link>
            </div>
        );
    }

    // Determine user role
    // Explicitly assert the session user type to include id
    const userId = (session?.user as { id?: string })?.id;
    const isProvider = exchange.providerId === userId;
    const isRequester = exchange.requesterId === userId;
    const otherParty = isProvider ? exchange.requester : exchange.provider;

    // Helper to get status badge style
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'REQUESTED': return { text: 'Requested', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
        case 'ACCEPTED': return { text: 'Accepted', icon: Check, color: 'bg-blue-100 text-blue-800 border-blue-300' };
        case 'SCHEDULED': return { text: 'Scheduled', icon: CalendarIcon, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
        case 'COMPLETED': return { text: 'Completed', icon: Check, color: 'bg-green-100 text-green-800 border-green-300' };
        case 'DECLINED': return { text: 'Declined', icon: X, color: 'bg-red-100 text-red-800 border-red-300' };
        case 'CANCELLED': return { text: 'Cancelled', icon: X, color: 'bg-gray-100 text-gray-800 border-gray-300' };
        default: return { text: status, icon: AlertCircle, color: 'bg-gray-100 text-gray-800 border-gray-300' };
      }
    };

    const { text: statusText, icon: StatusIcon, color: statusColor } = getStatusBadge(exchange.status);

    // --- Base Neobrutalist Button Classes ---
    const nbButtonBase = "w-full text-sm font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-70 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center py-2 px-4";

    // --- Render Exchange Details ---
  return (
        <div className="min-h-screen bg-blue-50 p-4 md:p-8 font-inter">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/exchanges" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to All Exchanges
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Exchange Details Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            {/* Header */}
                            <div className="px-6 py-4 border-b-2 border-black bg-gray-100 flex justify-between items-center">
                                <h1 className="font-satoshi tracking-satoshi-tight text-lg font-bold text-black flex items-center">
                                    <ArrowRightLeft className="mr-2 text-gray-700" size={20} />
                                    Exchange Details
                                </h1>
                                <div className={`flex items-center px-2 py-1 border ${statusColor} text-xs font-bold`}>
                                    <StatusIcon size={14} className="mr-1" />
                                    {statusText}
                                </div>
                            </div>
                            {/* Content */}
                            <div className="px-6 py-6 space-y-6">
                                <p className="text-xs text-gray-500">
                                    Request ID: {exchange.id}
                                </p>
                                
                                {/* Requester/Provider Info */}
                                <div className="flex items-center justify-between space-x-4">
                                    {/* Requester Card */}
                                    <div className="flex-1 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Requester</p>
                                        <div className="flex items-center space-x-3">
                                            <Image
                                                src={exchange.requester?.image || '/default-avatar.png'} // Provide a fallback image
                                                alt={exchange.requester?.name || 'Requester'}
                                                width={40}
                                                height={40}
                                                className="rounded-full border-2 border-black bg-white"
                                            />
                                            <div>
                                                <p className="font-bold text-sm">{exchange.requester?.name || 'Unknown User'}</p>
                                                {/* Optional: Add user ID or link */}
                                            </div>
                                        </div>
                                    </div>

                                    <ArrowRightLeft size={24} className="text-gray-400 flex-shrink-0" />

                                    {/* Provider Card */}
                                    <div className="flex-1 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Provider</p>
                                        <div className="flex items-center space-x-3">
                                            <Image
                                                src={exchange.provider?.image || '/default-avatar.png'} // Provide a fallback image
                                                alt={exchange.provider?.name || 'Provider'}
                                                width={40}
                                                height={40}
                                                className="rounded-full border-2 border-black bg-white"
                                            />
                                            <div>
                                                <p className="font-bold text-sm">{exchange.provider?.name || 'Unknown User'}</p>
                                                {/* Optional: Add user ID or link */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="p-4 border-2 border-black bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                    <h3 className="font-bold text-sm mb-2">Service Details</h3>
                                    <p className="font-semibold">{exchange.providerService?.title || 'Service Title Not Available'}</p>
                                    <Link href={`/services/${exchange.providerServiceId}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                        (View Service)
                                    </Link>
                                    {/* Optionally show requester's offered service if applicable */}
                                    {exchange.requesterService && (
                                        <p className="text-sm mt-1">Offered in return: {exchange.requesterService.title}</p>
                                    )}
                                </div>

                                {/* Dates and Hours */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 border border-gray-200 bg-gray-50">
                                        <p className="font-semibold text-gray-600">Date Requested</p>
                                        <p>{formatDate(exchange.createdAt)}</p>
                                    </div>
                                    <div className="p-3 border border-gray-200 bg-gray-50">
                                        <p className="font-semibold text-gray-600">Scheduled Date</p>
                                        <p>{formatDate(exchange.scheduledDate)}</p>
                                    </div>
                                    <div className="p-3 border border-gray-200 bg-gray-50">
                                        <p className="font-semibold text-gray-600">Date Completed</p>
                                        <p>{formatDate(exchange.completedDate)}</p>
                                    </div>
                                    <div className="p-3 border border-gray-200 bg-gray-50">
                                        <p className="font-semibold text-gray-600">Hours</p>
                                        <p>{exchange.hours !== null ? `${exchange.hours} hour(s)` : 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                             {/* Header */}
                            <div className="px-6 py-4 border-b-2 border-black bg-blue-100">
                                <h2 className="font-satoshi tracking-satoshi-tight text-lg font-bold text-black">
                                    Actions
                                </h2>
                            </div>
                             {/* Content */}
                            <div className="px-6 py-6 space-y-4">
                                {exchange.status === 'REQUESTED' && (
                                    <>
                                        {isProvider && (
                                            <>
                                                <p className="text-sm font-medium mb-3">Respond to request from {exchange.requester?.name}:</p>
                                                <div className="flex space-x-3">
                                                    <Button 
                                                        onClick={() => handleRespond(true)}
                                                        disabled={isLoadingAction}
                                                        className="flex-1 bg-green-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                    >
                                                        {isLoadingAction && respondMutation.variables?.accept ? <Loader2 className="animate-spin mr-2" size={16}/> : <Check size={16} className="mr-2" />} Accept
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleRespond(false)}
                                                        disabled={isLoadingAction}
                                                        className="flex-1 bg-red-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                    >
                                                         {isLoadingAction && !respondMutation.variables?.accept ? <Loader2 className="animate-spin mr-2" size={16}/> : <X size={16} className="mr-2" />} Decline
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                        {isRequester && (
                                            <p className="text-sm text-gray-600 italic">Waiting for {exchange.provider?.name} to respond.</p>
                                            // TODO: Add cancel request button?
                                        )}
                                    </>
                                )}

                                {exchange.status === 'ACCEPTED' && (
                                    <>
                                        <p className="text-sm font-medium mb-3">Schedule the exchange:</p>
                                        <Dialog open={isSchedulingDialogOpen} onOpenChange={setIsSchedulingDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button disabled={isLoadingAction} className="w-full bg-indigo-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                                    <CalendarIcon size={16} className="mr-2"/> Set Schedule
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px] bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                                <DialogHeader className="border-b-2 border-black pb-3">
                                                    <DialogTitle className="font-satoshi text-lg font-bold">Schedule Exchange</DialogTitle>
                                                    <DialogDescription>
                                                        Select a date and time for this service exchange.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedScheduleDate}
                                                        onSelect={setSelectedScheduleDate}
                                                        className="rounded-md border border-black mx-auto"
                                                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                                                    />
                                                </div>
                                                <DialogFooter className="border-t-2 border-black pt-4">
                                                    <DialogClose asChild>
                                                        <Button type="button" className="bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                    <Button 
                                                        type="button"
                                                        onClick={handleSchedule}
                                                        disabled={!selectedScheduleDate || isLoadingAction}
                                                        className="bg-blue-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                    >
                                                        {isLoadingAction ? <Loader2 className="animate-spin mr-2" size={16}/> : null} Confirm Schedule
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                )}

                                {exchange.status === 'SCHEDULED' && (
                                    <>
                                        <p className="text-sm font-medium mb-2">
                                            Scheduled for: {formatDate(exchange.scheduledDate)}
                                        </p>
                                        {isProvider && (
                                            <Button 
                                                onClick={handleComplete}
                                                disabled={isLoadingAction}
                                                className="w-full bg-green-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            >
                                                {isLoadingAction ? <Loader2 className="animate-spin mr-2" size={16}/> : <Check size={16} className="mr-2" />} Mark as Complete
                                            </Button>
                                        )}
                                        {isRequester && (
                                             <p className="text-sm text-gray-600 italic">Waiting for {exchange.provider?.name} to mark as complete after the service.</p>
                                        )}
                                         {/* TODO: Add Reschedule/Cancel buttons? */}  
                                    </>
                                )}

                                {exchange.status === 'COMPLETED' && (
                                    <div className="text-center p-4 bg-green-50 border-2 border-dashed border-green-300">
                                        <Check size={24} className="mx-auto text-green-600 mb-2" />
                                        <p className="text-sm font-semibold text-green-800">Exchange completed.</p>
                                    </div>
                                )}

                                {exchange.status === 'DECLINED' && (
                                    <div className="text-center p-4 bg-red-50 border-2 border-dashed border-red-300">
                                        <X size={24} className="mx-auto text-red-600 mb-2" />
                                        <p className="text-sm font-semibold text-red-800">Exchange declined.</p>
                                    </div>
                                )}

                                {exchange.status === 'CANCELLED' && (
                                    <div className="text-center p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                                        <X size={24} className="mx-auto text-gray-600 mb-2" />
                                        <p className="text-sm font-semibold text-gray-800">Exchange cancelled.</p>
                                    </div>
                                )}
                                
                                <Button className="w-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                    Send Message
                                </Button>

                                {/* Cancel Button - Conditionally Rendered */} 
                                {isCancellable && (
                                    <Button 
                                        className="w-full mt-4 border-2 border-black bg-red-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                        onClick={handleCancel}
                                        disabled={isCancelling || isLoadingAction}
                                    >
                                        {isCancelling ? <Loader2 size={16} className="animate-spin mr-2"/> : <X size={16} className="mr-2"/>} 
                                        Cancel Exchange
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
  );
};

export default ExchangeDetailPage; 