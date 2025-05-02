'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interface matching the structure returned by getMyServices
interface MyService {
  id: string;
  title: string;
  description: string | null;
  hourlyRate: number | null;
  isActive: boolean;
  createdAt: Date | string; // Allow string for createdAt from API
  category: {
    id: string;
    name: string;
  } | null;
  // Add other fields displayed if needed
}

const MyServicesPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  React.useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  const utils = trpc.useUtils();

  const { 
    data: myServices, 
    isLoading: servicesLoading, 
    error: servicesError, 
    refetch
  } = trpc.service.getMyServices.useQuery(
    { includeInactive: true }, // Fetch both active and inactive
    { enabled: authStatus === 'authenticated' }
  );

  // --- Delete Service Mutation ---
  const deleteMutation = trpc.service.deleteService.useMutation({
    onMutate: (variables) => {
      setDeletingServiceId(variables.id);
    },
    onSuccess: () => {
      toast.success('Service deleted successfully!');
      // Invalidate the query to refetch the list
      utils.service.getMyServices.invalidate(); 
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error(error.message); // Show the specific conflict message from backend
      } else {
        toast.error('Failed to delete service. Please try again.');
      }
      console.error("Delete service error:", error);
    },
    onSettled: () => {
      setDeletingServiceId(null);
    },
  });

  const handleDelete = (serviceId: string, serviceTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the service "${serviceTitle}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id: serviceId });
    }
  };

  if (authStatus === 'loading' || (authStatus === 'authenticated' && servicesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        Error loading your services: {servicesError.message}
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-satoshi tracking-satoshi-tight text-3xl font-bold">My Service Listings</h1>
          <Link href="/services/new">
             <Button className="flex items-center">
               <PlusCircle size={18} className="mr-2" />
               Offer New Service
             </Button>
          </Link>
        </div>

        {myServices && myServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myServices.map((service: MyService) => (
              <Card key={service.id} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <CardHeader className="border-b-2 border-black pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold mb-1">{service.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {service.category ? (
                           <span className="inline-block bg-gray-200 border border-black px-2 py-0.5 text-xs font-medium mr-2">
                             {service.category.name}
                           </span>
                        ) : null}
                         <span className={`inline-block px-2 py-0.5 text-xs font-medium border border-black ${service.isActive ? 'bg-green-200' : 'bg-red-200'}`}>
                           {service.isActive ? 'Active' : 'Inactive'}
                         </span>
                      </CardDescription>
                    </div>
                    {/* Action Buttons Placeholder */}
                    <div className="flex space-x-2">
                       <Link href={`/services/${service.id}/edit`} passHref>
                         <Button 
                            size="icon" 
                            className="border-black border-2 h-8 w-8 bg-yellow-200 hover:bg-yellow-300"
                            aria-label="Edit Service"
                         >
                           <Edit size={14} />
                         </Button>
                       </Link>
                       <Button 
                         size="icon" 
                         className="border-black border-2 h-8 w-8 bg-red-200 hover:bg-red-300"
                         onClick={() => handleDelete(service.id, service.title)}
                         disabled={deleteMutation.isPending && deletingServiceId === service.id}
                         aria-label="Delete Service"
                       >
                         {deleteMutation.isPending && deletingServiceId === service.id ? (
                           <Loader2 size={14} className="animate-spin" />
                         ) : (
                           <Trash2 size={14} />
                         )}
                       </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{service.description || 'No description provided.'}</p>
                  <p className="text-sm font-medium">
                    Rate/Hours: <span className="font-bold">{service.hourlyRate ?? 'N/A'}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-400 bg-white">
            <h2 className="text-xl font-semibold mb-2">No services found</h2>
            <p className="text-gray-600 mb-4">You haven't offered any services yet.</p>
            <Link href="/services/new">
              <Button>Offer Your First Service</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServicesPage; 