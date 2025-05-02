'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added Link for back button
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'; // Added Icons

// Expanded UserProfile type for initial data structure clarity
interface UserProfile {
    id: string;
    name: string | null;
    email?: string | null;
    image: string | null;
    location?: {
        address?: string | null;
        city?: string | null;
        state?: string | null;
        radius?: number | null;
    } | null;
    skills?: { id: string; name: string }[] | null;
    // Availability likely missing
}

// Update payload now includes the new fields as optional
type UpdateProfilePayload = {
    name?: string | undefined;
    image?: string | null | undefined;
    locationString?: string | undefined;
    radius?: number | undefined;
    skills?: string[] | undefined; // Array of skill names
};

const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  // Fetch profile data
  const { data: profileData, isLoading: isLoadingProfile, error: profileError, refetch } = trpc.user.getProfile.useQuery(
    undefined,
    {
      enabled: status === 'authenticated',
      // staleTime: 1000, // Consider removing or adjusting staleTime
      refetchOnWindowFocus: true,
    }
  );

  // Update profile mutation expects the *new* expanded payload
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: (updatedData) => {
      // Use updatedData from mutation response if needed
      console.log("Profile updated successfully:", updatedData);
      setSubmitSuccess('Profile updated successfully!'); // Updated success message
      setError(null);
      refetch(); // Refetch profile data to show latest updates
    },
    onError: (error) => {
      setError(error.message || 'Failed to update profile.');
      setSubmitSuccess(null);
    },
  });

  // Form state
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [locationInput, setLocationInput] = useState(''); // Still using a single string input for now
  const [serviceRadius, setServiceRadius] = useState<number | string>(''); // Allow string for input flexibility
  const [skillsInput, setSkillsInput] = useState(''); // Comma-separated string
  const [availability, setAvailability] = useState(''); // Still display-only

  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Populate form from fetched profile data
  useEffect(() => {
    const profile = profileData as UserProfile | undefined;
    if (profile) {
      setName(profile.name || '');
      setImage(profile.image || '');
      // Combine location parts back into a string if necessary, or just use address if available
      const locString = profile.location?.address || [profile.location?.city, profile.location?.state].filter(Boolean).join(', ');
      setLocationInput(locString || '');
      setServiceRadius(profile.location?.radius ?? '');
      setSkillsInput(profile.skills?.map(s => s.name).join(', ') || '');
      // Availability remains unhandled from backend
    }
  }, [profileData]);

  // Handle submit - Construct payload with all potentially changed fields
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitSuccess(null);

    const currentProfile = profileData as UserProfile | undefined;
    if (!currentProfile) return;

    // Build payload ONLY with changed fields
    const payload: UpdateProfilePayload = {};

    if (name !== (currentProfile.name || '')) payload.name = name;
    if (image !== (currentProfile.image || '')) payload.image = image || null; // Allow setting image to null

    // Check location string change (using address as the primary source for now)
    const currentLocationString = currentProfile.location?.address || [currentProfile.location?.city, currentProfile.location?.state].filter(Boolean).join(', ');
    if (locationInput !== (currentLocationString || '')) payload.locationString = locationInput;

    // Check radius change (handle number conversion)
    const currentRadius = currentProfile.location?.radius ?? '';
    const newRadiusNumber = serviceRadius === '' ? undefined : Number(serviceRadius);
    // Handle comparison carefully: compare numbers or both undefined
    const currentRadiusNumber = currentRadius === '' ? undefined : Number(currentRadius);
    if (newRadiusNumber !== currentRadiusNumber) {
        // Handle potential NaN if input is invalid, send undefined if empty or NaN
         const radiusValue = (serviceRadius === '' || isNaN(newRadiusNumber as number)) ? undefined : newRadiusNumber;
        payload.radius = radiusValue;
        // Optionally add validation feedback here if isNaN
    }


    // Check skills change
    const currentSkillsString = currentProfile.skills?.map(s => s.name).join(', ') || '';
    if (skillsInput !== currentSkillsString) {
        // Convert comma-separated string to array, trimming whitespace and removing empty entries
        payload.skills = skillsInput.split(',')
                                     .map(s => s.trim())
                                     .filter(s => s.length > 0);
    }

    // Only mutate if payload has keys (i.e., changes detected)
    if (Object.keys(payload).length > 0) {
        console.log("Updating profile with payload:", payload);
      updateProfileMutation.mutate(payload);
    } else {
        setSubmitSuccess("No changes detected."); // Set success message when no changes are detected
    }
  }, [
      name, image, locationInput, serviceRadius, skillsInput, // Include all state values used
      profileData, updateProfileMutation
    ]);

  // Loading & Error States
  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
         <Loader2 className="animate-spin h-12 w-12 text-blue-600" strokeWidth={2} />
      </div>
    );
  }

   if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
         <div className="max-w-md w-full bg-white p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
             <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" strokeWidth={2} />
             <h2 className="font-satoshi text-xl font-bold text-red-700 mb-2">Error Loading Profile</h2>
             <p className="text-red-600 text-sm leading-normal">Could not load profile data. Please try again later.</p>
             <Link href="/dashboard" className="inline-flex items-center mt-5 px-4 py-2 bg-red-100 text-red-700 font-semibold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2}/>
                Back to Dashboard
            </Link>
         </div>
      </div>
    );
  }

  // Render form (labels indicate which fields are saved)
  return (
    <div className="min-h-screen bg-blue-50 p-4 py-10 font-inter">
       <div className="max-w-2xl mx-auto bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
            <Link href="/dashboard" className="inline-flex items-center p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black mr-4">
                <ArrowLeft className="h-5 w-5" strokeWidth={2}/>
                <span className="sr-only">Back to Dashboard</span>
            </Link>
            <h1 className="font-satoshi tracking-tight text-4xl font-bold text-black">
          Edit Your Profile
        </h1>
        </div>

        {/* Success/Error Messages */} 
          {error &&
            <div className="mb-5 bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 shadow-[4px_4px_0px_0px_#ef4444]">
              <p className="font-medium">Error: <span className="font-normal">{error}</span></p>
            </div>
          }
           {submitSuccess &&
            <div className="mb-5 bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 shadow-[4px_4px_0px_0px_#22c55e]">
              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" strokeWidth={2}/> {submitSuccess}</p>
            </div>
          }

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-base font-bold font-satoshi text-black mb-1">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Image Field */}
           <div>
            <label htmlFor="image" className="block text-base font-bold font-satoshi text-black mb-1">Profile Image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              placeholder="https://your-image-url.com/image.png"
            />
          </div>

          {/* Location & Radius */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" id="location">
            <div className="md:col-span-2">
                <label htmlFor="location" className="block text-base font-bold font-satoshi text-black mb-1">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="City, State or Address"
                />
                 <p className="text-xs text-gray-500 mt-1">Your general location (e.g., "Austin, TX" or "123 Main St, Anytown").</p>
            </div>
            <div className='mb-5'>
                 <label htmlFor="serviceRadius" className="block text-base font-bold font-satoshi text-black mb-1">Service Radius (miles)</label>
                 <input
                    id="serviceRadius"
                    name="serviceRadius"
                    type="number"
                    value={serviceRadius}
                    onChange={(e) => setServiceRadius(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="e.g., 15"
                 />
            </div>
          </div>

          {/* Skills Field */}
          <div id="skills">
            <label htmlFor="skills" className="block text-base font-bold font-satoshi text-black mb-1">Skills</label>
            <textarea
              id="skills"
              name="skills"
              rows={3}
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              placeholder="Enter skills, separated by commas (e.g., Web Development, Graphic Design, Tutoring)"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list of your skills.</p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className={`w-full flex justify-center py-2.5 px-4 border-2 border-black font-bold text-base text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 ${
                updateProfileMutation.isPending ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0 hover:translate-y-0' : ''
              }`}
            >
              {updateProfileMutation.isPending ? (
                  <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving...</>
              ) : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage; 