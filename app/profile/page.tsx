'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Edit3, MapPin } from 'lucide-react'; // Icons

const MyProfilePage: React.FC = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const { data: profile, isLoading, error } = trpc.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>Loading Your Profile...</p>
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
    // This shouldn't happen if authenticated and no error, but good practice
     return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
         <div className="max-w-md w-full bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
             <p>Could not load profile data.</p>
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
              <div className="flex justify-between items-start mb-2">
                 <h1 className="font-satoshi tracking-satoshi-tight text-2xl md:text-3xl font-bold">{profile.name}</h1>
                 <Link href="/profile/edit">
                   <button className="flex items-center px-3 py-1 bg-yellow-300 text-black font-semibold border-2 border-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-translate-y-0.5 duration-150">
                     <Edit3 size={14} className="mr-1"/> Edit
                   </button>
                 </Link>
              </div>
              <p className="text-gray-600 mb-1">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
              {profile.location && (
                <p className="text-gray-600 mb-3 flex items-center justify-center sm:justify-start">
                    <MapPin size={16} className="mr-1 flex-shrink-0"/>
                    {profile.location.city}, {profile.location.state} (Service Radius: {profile.location.radius}km)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
           <h2 className="font-satoshi tracking-satoshi-tight text-xl font-bold mb-4">My Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {profile.skills.map(skill => (
                  <li key={skill.id} className="text-gray-700">
                    <span className="font-medium">{skill.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">You haven't added any skills yet.</p>
            )}
            {/* TODO: Add button to add skills? */} 
        </div>
         {/* TODO: Add sections for Offered Services, Ratings Received, etc. later */} 
      </div>
    </div>
  );
};

export default MyProfilePage; 