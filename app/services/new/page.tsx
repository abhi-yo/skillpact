'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, MapPin, Tag, CalendarDays } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Enhanced Zod schema
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }).max(500),
  categoryId: z.string().optional(),
  hourlyRate: z.coerce.number().min(0, { message: 'Rate/Hours must be non-negative.' }).max(1000),
  locationType: z.enum(['OWN', 'CLIENT', 'REMOTE', 'FLEXIBLE'], { required_error: 'Please select a location type.' }),
  serviceRadius: z.number().min(1).max(100).optional(),
  tags: z.string().optional(), // Simple string for now, split later
}).refine(data => data.locationType === 'OWN' || data.locationType === 'CLIENT' ? data.serviceRadius !== undefined : true, {
  message: "Service radius is required for 'Own' or 'Client' location types.",
  path: ["serviceRadius"], // Attach error to serviceRadius field
});

type ServiceFormValues = z.infer<typeof formSchema>;

// Helper function to apply Neo-Brutalism styles
const neoBrutalismInputStyle = "border-black border-[3px] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-none py-2 px-3";
const neoBrutalismLabelStyle = "font-bold text-md transform -rotate-1 inline-block mb-1";
const neoBrutalismSectionDivider = "border-t-4 border-black my-8";

const CreateServicePage: React.FC = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const utils = trpc.useUtils(); // Get tRPC utils

  // Redirect if not authenticated
  React.useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = trpc.service.getCategories.useQuery();

  // Setup react-hook-form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: undefined,
      hourlyRate: 1,
      locationType: undefined, // Default to undefined
      serviceRadius: 10, // Default radius
      tags: '',
    },
  });

  const watchedLocationType = form.watch('locationType');

  // tRPC mutation for creating service
  const createServiceMutation = trpc.service.createService.useMutation({
    onSuccess: (data) => {
      // Invalidate dashboard stats query after successful creation
      utils.user.getDashboardStats.invalidate();
      
      router.push('/dashboard');
      // Optionally, show a success toast/message
    },
    onError: (error) => {
      console.error('Failed to create service:', error);
      setSubmitError(`Failed to create service: ${error.message || 'Please try again.'}`);
      // Optionally, show an error toast/message
    },
  });

  // Form submission handler
  const onSubmit = (values: ServiceFormValues) => {
    setSubmitError(null); // Clear previous errors
    console.log('Submitting form values:', values);
    // TODO: Update backend to accept new fields before enabling this fully
    // For now, it will likely error out due to schema mismatch
    createServiceMutation.mutate({
       ...values, 
       // Ensure tags/radius are handled correctly based on backend expectations
    });
  };

  // Loading state for authentication or categories
  if (authStatus === 'loading' || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  // Handle category fetching error
  if (categoriesError) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        Error loading categories: {categoriesError.message}
      </div>
    );
  }

  // Ensure user is authenticated before rendering form
  if (authStatus !== 'authenticated' || !session?.user) {
    return null; // Or a message indicating authentication is required
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto max-w-2xl pt-10 pb-10">
         <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white mt-0">
           <CardHeader className="border-b-2 border-black bg-indigo-100 p-5 -mt-6">
            <CardTitle className="font-satoshi tracking-satoshi-tight text-2xl md:text-3xl font-bold">Create New Service</CardTitle>
            <CardDescription>Fill out the details below to list a new service you can offer.</CardDescription>
          </CardHeader>
           <CardContent className="pt-6 px-5 pb-6">
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-inter"> 
                 
                 {/* --- Section 1: Basic Info --- */}
                 <div className="space-y-5 -mt-4">
                   <h3 className="font-bold text-xl mb-5 flex items-center"><span className="inline-block border-2 border-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold bg-yellow-200 mr-3 transform ">1</span> Basic Details</h3>
                   <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className={neoBrutalismLabelStyle}>Service Title</FormLabel>
                         <FormControl>
                           <Input placeholder="e.g., Beginner Guitar Lessons" {...field} className={neoBrutalismInputStyle}/>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className={neoBrutalismLabelStyle}>Description</FormLabel>
                         <FormControl>
                           <Textarea placeholder="Describe the service you are offering..." {...field} className={neoBrutalismInputStyle}/>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="categoryId"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className={neoBrutalismLabelStyle}>Category</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value} disabled={categoriesLoading || !categories || categories.length === 0}>
                           <FormControl>
                             <SelectTrigger className={neoBrutalismInputStyle}>
                               <SelectValue placeholder="Select a category" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             {categoriesLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : categories && categories.length > 0 ? categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>) : <SelectItem value="no-cat" disabled>No categories found.</SelectItem>}
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="hourlyRate"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className={neoBrutalismLabelStyle}>Estimated Hours / Rate Equivalent</FormLabel>
                         <FormControl>
                           <Input type="number" step="0.5" placeholder="e.g., 1.5" {...field} className={neoBrutalismInputStyle}/>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>

                 <div className={neoBrutalismSectionDivider + " mt-10 mb-8"}></div>

                 {/* --- Section 2: Logistics --- */}
                 <div className="space-y-5">
                    <h3 className="font-bold text-xl mb-5 flex items-center"><span className="inline-block border-2 border-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold bg-pink-200 mr-3">2</span> Logistics</h3>
                   <FormField
                     control={form.control}
                     name="locationType"
                     render={({ field }) => (
                       <FormItem className="space-y-3">
                         <FormLabel className={neoBrutalismLabelStyle}><MapPin size={16} className="inline mr-1"/> Service Location</FormLabel>
                         <FormControl>
                           <RadioGroup
                             onValueChange={field.onChange}
                             defaultValue={field.value}
                             className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                           >
                             <FormItem className="flex items-center space-x-2 border-2 border-black p-2 shadow-sm bg-blue-50"><FormControl><RadioGroupItem value="OWN" /></FormControl><FormLabel className="font-normal">At my location</FormLabel></FormItem>
                             <FormItem className="flex items-center space-x-2 border-2 border-black p-2 shadow-sm bg-green-50"><FormControl><RadioGroupItem value="CLIENT" /></FormControl><FormLabel className="font-normal">At client's location</FormLabel></FormItem>
                             <FormItem className="flex items-center space-x-2 border-2 border-black p-2 shadow-sm bg-purple-50"><FormControl><RadioGroupItem value="REMOTE" /></FormControl><FormLabel className="font-normal">Remote/Virtual</FormLabel></FormItem>
                             <FormItem className="flex items-center space-x-2 border-2 border-black p-2 shadow-sm bg-yellow-50"><FormControl><RadioGroupItem value="FLEXIBLE" /></FormControl><FormLabel className="font-normal">Flexible</FormLabel></FormItem>
                           </RadioGroup>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   {(watchedLocationType === 'OWN' || watchedLocationType === 'CLIENT') && (
                     <FormField
                       control={form.control}
                       name="serviceRadius"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className={neoBrutalismLabelStyle}>Service Radius (km)</FormLabel>
                            <div className="flex items-center space-x-4">
                              <FormControl>
                                 <Slider 
                                   defaultValue={[field.value || 10]} 
                                   max={100} 
                                   min={1}
                                   step={1} 
                                   onValueChange={(value) => field.onChange(value[0])}
                                   className="border-black border-2 h-3 my-3"
                                   />
                              </FormControl>
                              <span className="font-bold border-2 border-black px-2 py-1 bg-white w-16 text-center">
                                {field.value || 10} km
                              </span>
                            </div>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   )}
                   
                   {/* Availability Placeholder */}
                   <div className="pt-2">
                     <Label className={neoBrutalismLabelStyle}><CalendarDays size={16} className="inline mr-1"/> Availability</Label>
                     <div className="p-4 border-2 border-dashed border-gray-400 text-center mt-2 bg-gray-50">
                       <p className="text-sm text-gray-600">Detailed availability scheduling coming soon!</p>
                       <p className="text-xs text-gray-500 mt-1">For now, describe general availability in the description.</p>
                     </div>
                   </div>
                 </div>

                 <div className={neoBrutalismSectionDivider + " mt-10 mb-8"}></div>

                 {/* --- Section 3: Discovery --- */}
                 <div className="space-y-5">
                   <h3 className="font-bold text-xl mb-5 flex items-center"><span className="inline-block border-2 border-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold bg-orange-200 mr-3 transform -rotate-3">3</span> Discovery</h3>
                   <FormField
                     control={form.control}
                     name="tags"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className={neoBrutalismLabelStyle}><Tag size={16} className="inline mr-1"/> Tags / Keywords (Optional)</FormLabel>
                         <FormControl>
                           <Input placeholder="e.g., acoustic, blues, beginner friendly, songwriting (comma-separated)" {...field} className={neoBrutalismInputStyle}/>
                         </FormControl>
                         <p className="text-xs text-gray-600 mt-1 italic">Separate tags with commas. These help others find your service.</p>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   {/* Image Upload Placeholder */}
                    <div className="pt-2">
                       <Label className={neoBrutalismLabelStyle}>Service Images (Optional)</Label>
                       <div className="p-6 border-4 border-dashed border-black text-center mt-2 bg-gray-50">
                         <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                         <p className="text-sm text-gray-600 mt-2">Image upload coming soon! Add up to 3 photos.</p>
                       </div>
                    </div>
                 </div>

                 {/* Submit Error Message */}
                {submitError && (
                  <div className="flex items-center p-3 bg-red-100 border-2 border-red-400 text-red-700 text-sm mt-6">
                     <AlertCircle className="h-5 w-5 mr-2" />
                     <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Button */}
                 <Button 
                   type="submit" 
                   disabled={createServiceMutation.isPending}
                   className="w-full font-bold text-lg py-3 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-70 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center"
                 >
                   {createServiceMutation.isPending ? (
                     <>
                       <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...
                     </>
                   ) : (
                     'Create Service Listing'
                   )}
                 </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateServicePage; 