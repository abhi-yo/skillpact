'use client';

import React from 'react';
import { useParams } from 'next/navigation'; // Use useParams for dynamic routes in App Router
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { MapPin, Star } from 'lucide-react'; // Icons

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params?.userId as string; // Extract userId

  // Fetch public profile data
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = trpc.user.getUserById.useQuery(
    userId, 
    { 
      enabled: !!userId, // Only run query if userId is available
      staleTime: 5 * 60 * 1000, // Cache for 5 mins
    }
  );

  // Fetch user reviews
  const { data: reviews, isLoading: isLoadingReviews, error: reviewsError } = trpc.user.getUserReviews.useQuery(
    { userId }, 
    {
       enabled: !!userId,
       staleTime: 5 * 60 * 1000,
    }
  );

  const isLoading = isLoadingProfile || isLoadingReviews;
  const error = profileError || reviewsError;

  if (!userId) {
     return <div className="min-h-screen flex items-center justify-center bg-blue-50"><p>Invalid user ID.</p></div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
         <div className="max-w-md w-full bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
             <p className="text-red-600">Error loading profile: {error.message}</p>
         </div>
      </div>
    );
  }

   if (!profile) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
         <div className="max-w-md w-full bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
             <p>User not found.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
         {/* Profile Card */}
        <div className="bg-white p-6 md:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img 
                src={profile.image || '/default-avatar.png'} // Placeholder path
                alt={profile.name || 'User'}
                className="w-24 h-24 md:w-32 md:h-32 object-cover border-2 border-black bg-gray-200"
              />
            </div>
            {/* Profile Info */}
            <div className="flex-grow text-center sm:text-left">
              <h1 className="font-satoshi tracking-satoshi-tight text-2xl md:text-3xl font-bold mb-1">{profile.name}</h1>
              {/* Average Rating Display */}
               {profile.ratingCount && profile.ratingCount > 0 ? (
                <div className="flex items-center justify-center sm:justify-start text-yellow-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.round(profile.averageRating || 0) ? 'fill-yellow-500' : 'fill-gray-300 text-gray-300'} />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({profile.ratingCount} review{profile.ratingCount > 1 ? 's' : ''})</span>
                </div>
              ) : (
                 <p className="text-sm text-gray-500 mb-1">No reviews yet</p>
              )}
              <p className="text-gray-600 mb-1">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
              {profile.location && (
                <p className="text-gray-600 mb-3 flex items-center justify-center sm:justify-start">
                    <MapPin size={16} className="mr-1 flex-shrink-0"/>
                    {profile.location.city}, {profile.location.state}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Offered Services Section */}
        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
           <h2 className="font-satoshi tracking-satoshi-tight text-xl font-bold mb-4">Services Offered</h2>
            {profile.services && profile.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.services.map((service) => (
                  <div key={service.id} className="border border-gray-300 p-4 bg-gray-50">
                    <h3 className="font-medium text-blue-700 mb-1">{service.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Category: {service.category?.name || 'N/A'} | Price: ${service.hourlyRate || 'N/A'}/hr</p>
                    <p className="text-sm text-gray-800">{service.description}</p>
                     {/* TODO: Add 'Request Exchange' button here? */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">This user is not currently offering any services.</p>
            )}
        </div>

         {/* Reviews Section */}
        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
           <h2 className="font-satoshi tracking-satoshi-tight text-xl font-bold mb-4">Reviews ({reviews?.length || 0})</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.exchangeId} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < (review.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'} />
                      ))}
                      <span className="ml-auto text-xs text-gray-500">{review.date ? new Date(review.date).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <p className="text-gray-700 mb-2 italic">"{review.review || 'No review text provided.'}"</p>
                    <p className="text-sm text-gray-600">From: <span className="font-medium">{review.reviewer?.name || 'Anonymous'}</span> for service "{review.serviceTitle || 'Unknown Service'}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">This user hasn't received any reviews yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 