'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const locationTypes = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'OWN', label: 'At My Place' },
  { value: 'CLIENT', label: 'At Client\'s Place' },
];

const CreateServiceFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative').max(1000, 'Hourly rate too high'),
  locationType: z.enum(['OWN', 'CLIENT', 'REMOTE']),
  serviceRadius: z.number().min(1, 'Radius must be at least 1km').max(100, 'Radius too large').optional(),
  tags: z.string().optional(),
  duration: z.number().min(5, 'Minimum duration is 5 minutes').max(1440, 'Maximum duration is 24 hours').optional(),
  // Location fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type CreateServiceFormValues = z.infer<typeof CreateServiceFormSchema>;

const neoCard = "bg-white p-6 border-4 border-black rounded-lg shadow-[8px_8px_0px_#000] font-satoshi";
const neoLabel = "font-bold text-base mb-2 text-gray-900 font-satoshi";
const neoDivider = "border-t-4 border-black my-8";
const neoButton = "px-6 py-2 bg-blue-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] font-bold text-base font-satoshi hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all";

const CreateServicePage: React.FC = () => {
  const router = useRouter();
  const { data: categories = [], isLoading: loadingCategories } = trpc.service.getCategories.useQuery();
  const { data: userLocation } = trpc.location.getMyLocation.useQuery();
  
  const createServiceMutation = trpc.service.createService.useMutation({
    onSuccess: (data: { id: string }) => {
      toast.success('Service created successfully!');
      router.push(`/services/${data.id}`);
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to create service: ${error.message}`);
    },
  });

  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(CreateServiceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      hourlyRate: 0,
      locationType: 'REMOTE',
      serviceRadius: 10,
      tags: '',
      duration: 60,
      latitude: undefined,
      longitude: undefined,
      address: '',
      city: '',
      state: '',
      country: '',
    },
  });

  const locationType = form.watch('locationType');
  const isLocationRequired = locationType === 'OWN' && (!userLocation || !userLocation.latitude || !userLocation.longitude);
  const isSubmitDisabled = createServiceMutation.isPending || isLocationRequired;

  const onSubmit = (data: CreateServiceFormValues) => {
    // Validate location requirement for "At My Place"
    if (data.locationType === 'OWN' && (!userLocation || !userLocation.latitude || !userLocation.longitude)) {
      toast.error('Please set your location in your profile before creating an "At My Place" service.');
      return;
    }

    // Build location data dynamically, excluding null/undefined values
    const locationData: Record<string, unknown> = {};
    if (data.locationType === 'OWN' && userLocation) {
      const fields = ['latitude','longitude','address','city','state','country'] as const;
      fields.forEach((key) => {
        const value = (userLocation as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          (locationData as any)[key] = value;
        }
      });
    }

    createServiceMutation.mutate({
      ...data,
      ...locationData,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="relative">
          <h1 className="font-satoshi text-3xl font-bold text-black">Offer a New Service</h1>
          <div className="relative">
            <svg 
              viewBox="0 0 300 8" 
              className="w-72 h-2 absolute left-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2,6 Q75,2 150,4 T298,6" 
                stroke="#9ca3af" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <p className="text-md text-gray-600 ">Share your skills with the community. Fill out the form below to create a new service offering.</p>
        <div className={neoCard}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Service Details */}
              <div>
                <h3 className={neoLabel}>Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={neoLabel}>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Expert Web Design" {...field} className="w-full rounded-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={neoLabel}>Estimated Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            max={1440}
                            step={5}
                            placeholder="60"
                            value={field.value}
                            onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={neoLabel}>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Describe your service in detail..." {...field} className="rounded-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className={neoDivider}></div>
              {/* Pricing */}
              <div>
                <h3 className={neoLabel}>Pricing (per hour, in credits)</h3>
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider 
                            min={0} 
                            max={1000}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            value={[field.value]}
                            className="w-full"
                          />
                          <div className="font-bold text-lg p-2 bg-yellow-200 border-2 border-black rounded-lg w-24 text-center">
                            {field.value} C
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className={neoDivider}></div>
              {/* Location Type */}
              <div>
                <h3 className={neoLabel}>Service Location</h3>
                <FormField
                  control={form.control}
                  name="locationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {locationTypes.map((lt) => (
                            <div key={lt.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={lt.value} id={lt.value} />
                              <Label htmlFor={lt.value}>{lt.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4">
                  {locationType === 'OWN' && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Service Location:</strong> Your profile location will be used for this service.
                        {userLocation ? (
                          <span className="block mt-1 text-blue-600">
                            📍 {userLocation.address || 'Location set in profile'}
                          </span>
                                                 ) : (
                           <span className="block mt-1 text-orange-600">
                             ⚠️ Please set your location in your profile first.{' '}
                             <Link href="/profile/edit" className="underline hover:text-orange-800">
                               Go to Profile
                             </Link>
                           </span>
                         )}
                      </p>
                    </div>
                  )}
                  {locationType === 'REMOTE' && (
                    <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Remote Service:</strong> This service can be provided online or remotely. No physical location required.
                      </p>
                    </div>
                  )}
                  {locationType === 'CLIENT' && (
                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>At Client's Location:</strong> You will travel to the client's location to provide this service.
                      </p>
                    </div>
                  )}
                </div>
                
                {locationType === 'OWN' && (
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="serviceRadius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={neoLabel}>Service Radius (km)</FormLabel>
                          <p className="text-sm text-gray-600 mb-2">
                            How far are you willing to travel from your location?
                          </p>
                          <FormControl>
                            <Slider 
                              min={1} 
                              max={100}
                              step={1}
                              onValueChange={(value) => field.onChange(value[0])}
                              value={[field.value || 10]}
                              className="w-full"
                            />
                          </FormControl>
                          <div className="font-bold text-md mt-2">{field.value || 10} km</div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              <div className={neoDivider}></div>
              {/* Tags */}
              <div>
                <h3 className={neoLabel}>Tags (optional)</h3>
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="e.g., web, design, marketing" {...field} className="rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 flex justify-end">
                <Button type="submit" size="lg" className={neoButton} disabled={isSubmitDisabled}>
                  {createServiceMutation.isPending ? 'Submitting...' : 
                   isLocationRequired ? 'Set Location First' : 'Create Service'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateServicePage; 