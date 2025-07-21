'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, MapPin, ArrowLeft, Search } from 'lucide-react';
import Image from 'next/image'; // For user images

// Basic Service Card Component (can be moved to components later)
const ServiceCard = ({ service }: { service: any }) => {
  const distance = service.distance_miles ? service.distance_miles.toFixed(1) : 'N/A';
  return (
    <Link href={`/services/${service.id}`} className="block border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
      <h3 className="font-satoshi text-lg font-bold mb-1">{service.title || 'Untitled Service'}</h3>
      {service.user && (
        <div className="flex items-center text-xs text-gray-600 mb-2">
          {service.user.image && (
             <Image src={service.user.image} alt={service.user.name || 'User'} width={16} height={16} className="rounded-full mr-1.5 border border-gray-300" />
          )}
          <span>{service.user.name || 'Anonymous'}</span>
          {/* Placeholder for rating - add later */}
          {/* <span className="ml-2">⭐ {service.user.averageRating?.toFixed(1) || 'New'}</span> */}
        </div>
      )}
       <p className="text-sm text-gray-800 mb-2 line-clamp-2">{service.description || 'No description available.'}</p>
       <div className="flex justify-between items-center text-xs font-medium text-gray-500 mt-3">
          <span>Category: {service.category?.name || 'Uncategorized'}</span>
          <span>📍 ~{distance} mi away</span> 
       </div>
    </Link>
  );
};

const NearbyServicesPage: React.FC = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const { data: nearbyServicesData, isLoading, error } = trpc.service.getNearbyServices.useQuery(
    undefined, // No input needed for this version yet
    { 
        enabled: status === 'authenticated',
        staleTime: 60 * 1000, // Cache for 1 minute
        refetchOnWindowFocus: false, // Don't refetch on focus for potentially expensive query
        retry: (failureCount, err) => {
            // Don't retry if the error is due to missing profile location
            if ((err as any)?.data?.code === 'PRECONDITION_FAILED') {
                return false;
            }
            // Otherwise, retry up to 3 times
            return failureCount < 3;
        },
    }
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4 py-10 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
             <Link href="/dashboard" className="inline-flex items-center p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black mr-4">
                <ArrowLeft className="h-5 w-5" strokeWidth={2}/>
                <span className="sr-only">Back to Dashboard</span>
            </Link>
            <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-green-600" strokeWidth={2}/> Nearby Services
            </h1>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 shadow-[4px_4px_0px_0px_#ef4444]">
            <p className="font-medium flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" strokeWidth={2}/>
              Error: {error.message}
            </p>
            {/* Specific message for profile precondition error */} 
            {(error as any)?.data?.code === 'PRECONDITION_FAILED' && (
                <Link href="/profile/edit" className="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800 font-medium">
                  Click here to update your profile location and radius.
                </Link>
            )}
          </div>
        )}

        {/* Service List */}
        {!error && nearbyServicesData && nearbyServicesData.length > 0 && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyServicesData.map((service) => (
                <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* No Services Found */}
        {!error && nearbyServicesData && nearbyServicesData.length === 0 && (
            <div className="text-center bg-white p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" strokeWidth={1.5}/>
              <h2 className="font-satoshi text-xl font-semibold text-gray-700 mb-2">No Nearby Services Found</h2>
              <p className="text-sm text-gray-500">Try expanding your service radius in your profile or check back later.</p>
              <Link href="/profile/edit" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                Update Profile Radius
              </Link>
            </div>
        )}

      </div>
    </div>
  );
};

export default NearbyServicesPage; 