'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For user images
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Star, UserCircle, ChevronRight, Filter, Search, X, MapPin } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';

interface BrowsedService {
  id: string;
  title: string;
  description: string | null;
  hourlyRate: number | null;
  category: { name: string } | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    averageRating: number | null;
  } | null;
  distance_km?: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function BrowseServicesContent() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('q');
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery || '');
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryFilters = useMemo(() => {
    // ... existing code ...
  }, [debouncedSearchTerm]);
  
  const [showNearby, setShowNearby] = useState(false);
  
  const {
     data: browseData, 
     isLoading: browseLoading, 
     error: browseError 
  } = trpc.service.browseServices.useQuery(
    {}, 
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !showNearby
    }
  );

  const {
     data: nearbyServices, 
     isLoading: nearbyLoading, 
     error: nearbyError 
  } = trpc.service.getNearbyServices.useQuery(
    { limit: 50 }, 
    { 
      staleTime: 5 * 60 * 1000,
      enabled: showNearby
    }
  );

  const services = showNearby ? nearbyServices : browseData?.services;
  const isLoading = showNearby ? nearbyLoading : browseLoading;
  const error = showNearby ? nearbyError : browseError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error) {
    if (showNearby && error.message.includes('Please set your location')) {
      return (
        <DashboardLayout>
          <div className="min-h-screen bg-blue-50 p-8">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-satoshi text-4xl font-bold">Browse Services</h1>
                <div className="flex bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <button
                    onClick={() => setShowNearby(false)}
                    className="px-4 py-2 font-medium text-sm bg-blue-500 text-white"
                  >
                    All Services
                  </button>
                  <button
                    onClick={() => setShowNearby(true)}
                    className="px-4 py-2 font-medium text-sm bg-white text-black"
                  >
                    <MapPin size={16} className="inline mr-1" />
                    Nearby
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md">
                <MapPin className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <h2 className="font-satoshi text-2xl font-bold mb-4">Location Required</h2>
                <p className="text-gray-600 mb-6">
                  To view nearby services, please set your location and service radius in your profile.
                </p>
                <div className="space-y-3">
                  <Link href="/profile/edit">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                      Set Location
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setShowNearby(false)}
                    className="w-full bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    Browse All Services Instead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      );
    }
    
    return (
      <DashboardLayout>
      <div className="container mx-auto p-4 text-center text-red-600">
          <AlertCircle className="mx-auto h-16 w-16 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Services</h2>
          <p>{error.message}</p>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-blue-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
              <div className="relative">
                <h1 className="font-satoshi text-3xl font-bold">
                  {showNearby ? 'Nearby Services' : 'Browse Services'}
                </h1>
                <svg viewBox="0 0 240 8" className="w-60 h-2 absolute left-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2,6 Q60,2 120,4 T238,6" stroke="#9ca3af" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <button
                  onClick={() => setShowNearby(false)}
                  className={`px-4 py-2 font-medium text-sm transition-all ${
                    !showNearby 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  All Services
                </button>
                <button
                  onClick={() => setShowNearby(true)}
                  className={`px-4 py-2 font-medium text-sm transition-all ${
                    showNearby 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={16} className="inline mr-1" />
                  Nearby
                </button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {showNearby 
                ? 'Services within your area, sorted by distance'
                : 'All available services in our platform'
              }
            </p>
          </div>

          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(services as BrowsedService[]).map((service) => (
                <div key={service.id} className="border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden bg-white transition-all duration-150 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1">
                  <div className="flex items-center space-x-3 bg-gray-50 p-3 border-b-2 border-black">
                       {service.user?.image ? (
                          <Image 
                            src={service.user.image}
                            alt={service.user.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-black"
                           />
                       ) : (
                           <UserCircle size={40} className="border-2 border-black rounded-full text-gray-500"/>
                       )}
                    <div className="flex-1 min-w-0">
                      <p className="font-satoshi text-sm font-bold leading-none truncate">{service.user?.name || 'SkillSwap User'}</p>
                      <div className="flex items-center justify-between mt-1">
                          {service.user?.averageRating !== null && service.user?.averageRating !== undefined && (
                              <div className="flex items-center text-xs text-gray-700">
                                  <Star size={12} className="mr-1 text-yellow-500 fill-yellow-400"/>
                                  {service.user.averageRating.toFixed(1)}
                              </div>
                          )}
                        {showNearby && service.distance_km !== undefined && (
                          <div className="flex items-center text-xs text-gray-700">
                            <MapPin size={12} className="mr-1 text-blue-500"/>
                            {service.distance_km < 1 
                              ? `${Math.round(service.distance_km * 1000)}m away`
                              : `${service.distance_km.toFixed(1)}km away`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex-grow">
                      <h3 className="font-satoshi text-lg font-bold line-clamp-2 mb-2 leading-tight">{service.title}</h3>
                       {service.category && (
                         <span className="inline-block bg-blue-100 border border-black px-2 py-1 text-xs font-medium rounded mb-2">
                           {service.category.name}
                         </span>
                      )}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3 leading-relaxed">{service.description || 'No description provided.'}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                       <div>
                         <p className="text-xs text-gray-500">Rate/Hours</p>
                         <p className="text-sm font-bold">{service.hourlyRate ?? 'N/A'}</p>
                       </div>
                       <Link href={`/services/${service.id}`} passHref>
                           <Button 
                               size="sm" 
                          className="text-xs bg-blue-500 text-white font-bold border-2 border-black rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                           >
                               View Details
                           </Button>
                       </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg">
              {showNearby ? (
                <>
                  <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Nearby Services Found</h2>
                  <p className="text-gray-600 mb-4">
                    No services are available within your current radius.
                  </p>
                  <p className="text-sm text-gray-500">
                    Try increasing your service radius in your profile settings.
                  </p>
                </>
              ) : (
                <>
                  <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Services Found</h2>
                  <p className="text-gray-600">
                    No services are currently available. Check back later or create your own service!
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    }>
      <BrowseServicesContent />
    </Suspense>
  );
} 