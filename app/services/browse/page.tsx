'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For user images
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Star, UserCircle } from 'lucide-react';

// Interface matching the structure returned by browseServices
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
  // Add other fields needed for display
}

const BrowseServicesPage: React.FC = () => {
  
  // TODO: Add state for filters (category, search)
  
  const {
     data: browseData, 
     isLoading, 
     error 
  } = trpc.service.browseServices.useQuery(
    { /* Pass filters here later */ }, 
    { staleTime: 5 * 60 * 1000 } // Cache for 5 mins
  );

  const services = browseData?.services; // Extract services array

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        Error loading services: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 font-inter">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-satoshi tracking-tight text-4xl font-bold">Browse Services</h1>
          {/* TODO: Add Filter Dropdowns/Search Bar */}
        </div>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: BrowsedService) => (
              <Card key={service.id} className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden bg-white transition-all duration-150 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1">
                {/* User Info Header */}
                <CardHeader className="border-b-2 border-black p-1 bg-orange-100 -mt-5">
                   <div className="flex items-center space-x-1">
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
                     <div>
                        <p className="font-satoshi text-2xl font-bold leading-none">{service.user?.name || 'SkillSwap User'}</p>
                        {service.user?.averageRating !== null && service.user?.averageRating !== undefined && (
                            <div className="flex items-center text-xs text-gray-700 mt-0.5">
                                <Star size={12} className="mr-1 text-yellow-500 fill-yellow-400"/>
                                {service.user.averageRating.toFixed(1)}
                            </div>
                        )}
                     </div>
                   </div>
                </CardHeader>
                
                <CardContent className="px-3 pb-3 pt-1 flex-grow flex flex-col">
                  <div>
                    <h3 className="font-satoshi tracking-tight text-2xl font-bold line-clamp-2 mb-1 leading-none">{service.title}</h3>
                     {service.category && (
                       <span className="inline-block bg-gray-200 border border-black px-2 py-0.5 text-xs font-medium mr-2 mt-1 mb-1">
                         {service.category.name}
                       </span>
                    )}
                    <p className="text-sm text-gray-700 mb-1 line-clamp-3">{service.description || 'No description provided.'}</p>
                  </div>
                  <div className="mt-1 pt-2 border-t-2 border-black flex justify-between items-center">
                     <p className="text-sm font-medium">
                       Rate/Hours: <span className="font-bold">{service.hourlyRate ?? 'N/A'}</span>
                     </p>
                     <Link href={`/services/${service.id}`} passHref>
                         <Button 
                             size="sm" 
                             className="text-xs bg-blue-200 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                         >
                             View Details
                         </Button>
                     </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
            <h2 className="text-xl font-semibold mb-2">No Services Found</h2>
            <p className="text-gray-600">No services are currently available for browsing.</p>
             {/* Optional: Link to offer service? */}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseServicesPage; 