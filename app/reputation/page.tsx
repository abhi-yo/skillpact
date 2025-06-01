'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, ChevronLeft, ThumbsUp, Loader2, Clock, User } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import Image from 'next/image';

// Define the Rating type
interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  exchange: {
    id: string;
    providerService: {
      id: string;
      title: string | null;
    } | null;
  };
}

const ReputationPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  
  // Fetch ratings data
  const utils = trpc.useContext();
  const { data: receivedRatings, isLoading: receivedLoading, refetch: refetchReceivedRatings } = trpc.user.getReceivedRatings.useQuery(
    undefined,
    { enabled: status === 'authenticated' }
  );
  
  const { data: givenRatings, isLoading: givenLoading, refetch: refetchGivenRatings } = trpc.user.getGivenRatings.useQuery(
    undefined,
    { enabled: status === 'authenticated' }
  );
  
  // Calculate stats
  const averageRating = React.useMemo(() => {
    if (!receivedRatings || receivedRatings.length === 0) return 0;
    const sum = receivedRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / receivedRatings.length).toFixed(1);
  }, [receivedRatings]);
  
  const fiveStarCount = React.useMemo(() => {
    if (!receivedRatings) return 0;
    return receivedRatings.filter(r => r.rating === 5).length;
  }, [receivedRatings]);
  
  // Format date for member since
  const memberSince = React.useMemo(() => {
    if (!receivedRatings || receivedRatings.length === 0) return 'N/A';
    // Get oldest rating date
    const dates = receivedRatings.map(r => new Date(r.createdAt));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    return oldestDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [receivedRatings]);
  
  // Force refresh data on mount
  React.useEffect(() => {
    if (status === 'authenticated') {
      console.log('Forcing reputation data refresh');
      utils.invalidate(); // Invalidate all queries
      refetchReceivedRatings();
      refetchGivenRatings();
    }
  }, [status, refetchReceivedRatings, refetchGivenRatings, utils]);

  // Handle manual refresh
  const handleRefresh = () => {
    console.log('Manual reputation refresh triggered');
    utils.invalidate(); // Invalidate all queries
    refetchReceivedRatings();
    refetchGivenRatings();
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Handle loading state
  if (status === 'loading' || receivedLoading || givenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" strokeWidth={2} />
      </div>
    );
  }

  // Get current ratings based on active tab
  const currentRatings = activeTab === 'received' ? receivedRatings : givenRatings;
  const hasRatings = currentRatings && currentRatings.length > 0;

  return (
    <div className="min-h-screen bg-blue-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/dashboard" className="font-medium text-blue-600 flex items-center hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page header */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <div className="bg-blue-500 px-4 py-3 border-b-2 border-black">
            <h1 className="font-satoshi tracking-tight text-xl font-bold text-white flex items-center">
              <Star className="mr-2" size={20} strokeWidth={2} />
              Your Reputation
            </h1>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <p className="text-sm text-gray-600 mr-2">Member since:</p>
                <p className="text-sm font-bold">{memberSince}</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="px-3 py-2 text-sm font-bold bg-blue-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                Refresh Ratings
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              Community reputation based on {receivedRatings?.length || 0} reviews
            </p>
            
            <div className="flex items-center mb-4">
              <span className="text-4xl font-bold mr-2">{averageRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={20} 
                    fill={Number(averageRating) >= star ? "currentColor" : "none"} 
                    className="text-yellow-500" 
                  />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col items-center">
                <Star className="h-5 w-5 text-green-600 mb-1" />
                <span className="text-lg font-bold">{fiveStarCount}</span>
                <span className="text-xs text-gray-600">5-star reviews</span>
              </div>
              <div className="bg-blue-100 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col items-center">
                <User className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-lg font-bold">{receivedRatings?.length || 0}</span>
                <span className="text-xs text-gray-600">Total ratings</span>
              </div>
              <div className="bg-purple-100 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col items-center">
                <Clock className="h-5 w-5 text-purple-600 mb-1" />
                <span className="text-lg font-bold">{memberSince}</span>
                <span className="text-xs text-gray-600">Member since</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mb-6">
          <div className="inline-flex border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100'
              }`}
            >
              Reviews Received
            </button>
            <button
              onClick={() => setActiveTab('given')}
              className={`px-4 py-2 font-medium text-sm border-l-2 border-black ${
                activeTab === 'given'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100'
              }`}
            >
              Reviews Given
            </button>
          </div>
        </div>

        {hasRatings ? (
          <div className="space-y-4">
            {currentRatings.map((rating: Rating) => (
              <div key={rating.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 border border-black rounded-full flex items-center justify-center overflow-hidden">
                      {rating.fromUser.image ? (
                        <Image 
                          src={rating.fromUser.image} 
                          alt={rating.fromUser.name || 'User'}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <User className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-sm">
                        {activeTab === 'received' ? (
                          <>From: {rating.fromUser.name || 'User'}</>
                        ) : (
                          <>To: {rating.fromUser.name || 'User'}</>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        fill={rating.rating >= star ? "currentColor" : "none"} 
                        className="text-yellow-500" 
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Service:</span> {rating.exchange.providerService?.title || 'Service'}
                  </p>
                  {rating.comment && (
                    <p className="text-sm border-t border-gray-200 pt-2 mt-2">{rating.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
            <ThumbsUp className="h-10 w-10 mx-auto mb-3 text-blue-500" />
            <p className="text-gray-600 mb-2">
              {activeTab === 'received' 
                ? "No reviews received yet." 
                : "You haven't given any reviews yet."}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {activeTab === 'received'
                ? "Complete more exchanges to build your reputation!" 
                : "Rate your exchange partners after completing services."}
            </p>
            
            <Link 
              href="/services/browse" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm"
            >
              Find Services
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReputationPage; 