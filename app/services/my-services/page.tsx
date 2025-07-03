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
import { DashboardLayout } from '@/components/DashboardLayout';

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
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (servicesError) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <div className="bg-red-50 border-2 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] p-6">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Services</h2>
            <p className="text-red-600">Error loading your services: {servicesError.message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (authStatus !== 'authenticated') {
    return null; // Should be redirected by useEffect
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-8 py-4 bg-blue-50 min-h-screen">
        <div className="max-w-6xl xl:max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
              <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black">My Service Listings</h1>
                <div className="relative">
                  <svg viewBox="0 0 260 8" className="w-64 h-2 absolute left-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2,6 Q65,2 130,4 T258,6" stroke="#9ca3af" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-base text-gray-600 mt-2">Manage and track your offered services</p>
            </div>
            <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              <Link href="/services/new">
                <Button className="flex items-center text-base font-bold bg-blue-500 text-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-6 py-3 w-full sm:w-auto">
                  <PlusCircle size={20} className="mr-2" />
                  Offer New Service
                </Button>
              </Link>
            </div>
          </div>

          {myServices && myServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 mt-3 w-full max-w-4xl lg:max-w-6xl mx-auto">
              {myServices.map((service: MyService) => (
                <Card key={service.id} className="bg-white border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                  <CardHeader className="border-b-2 border-black pb-1">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-grow min-w-0">
                        <CardTitle className="text-lg font-bold mb-2 text-black leading-tight">{service.title}</CardTitle>
                        <CardDescription className="flex flex-wrap gap-2">
                          {service.category && (
                            <span className="inline-block bg-blue-100 border-2 border-black rounded-lg px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {service.category.name}
                            </span>
                          )}
                          <span className={`inline-block px-3 py-1 text-xs font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            service.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Link href={`/services/${service.id}/edit`}>
                          <Button 
                            size="icon" 
                            className="border-2 border-black h-9 w-9 rounded-lg bg-yellow-200 hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                            aria-label="Edit Service"
                          >
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button 
                          size="icon" 
                          className="border-2 border-black h-9 w-9 rounded-lg bg-red-200 hover:bg-red-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                          onClick={() => handleDelete(service.id, service.title)}
                          disabled={deleteMutation.isPending && deletingServiceId === service.id}
                          aria-label="Delete Service"
                        >
                          {deleteMutation.isPending && deletingServiceId === service.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 pb-2 flex-grow">
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed line-clamp-3">
                      {service.description || 'No description provided.'}
                    </p>
                    <div className="mt-auto mb-0">
                      <p className="text-base font-semibold text-black">
                        Rate/Hours: <span className="font-bold text-blue-600">{service.hourlyRate ?? 'N/A'}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-400 bg-white rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <PlusCircle size={48} className="mx-auto text-gray-400 mb-6" />
              <h2 className="text-2xl font-bold text-black mb-3">No Services Yet</h2>
              <p className="text-base text-gray-600 mb-6">You haven't offered any services yet. Start by creating your first service listing.</p>
              <Link href="/services/new">
                <Button className="text-base font-bold bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-6 py-3">
                  <PlusCircle size={20} className="mr-2" />
                  Offer Your First Service
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyServicesPage; 