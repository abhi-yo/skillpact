'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Edit3, MapPin, Coins } from 'lucide-react'; // Icons
import { DashboardLayout } from '@/components/DashboardLayout';

const MyProfilePage: React.FC = () => {
  const router = useRouter();
  const { status, data: session } = useSession({
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
         <div className="max-w-md w-full bg-white p-6 md:p-8 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
             <p className="text-red-600">Error loading profile: {error.message}</p>
         </div>
      </div>
    );
  }

  if (!profile) {
    // This shouldn't happen if authenticated and no error, but good practice
     return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
         <div className="max-w-md w-full bg-white p-6 md:p-8 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
             <p>Could not load profile data.</p>
         </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-blue-50 p-3 sm:p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">
          {/* Profile Card */}
          <div className="relative bg-white p-4 sm:p-6 md:p-8 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 md:mb-10">
            {/* Mobile Edit Icon */}
            <Link href="/profile/edit" className="absolute right-4 top-4 md:hidden">
              <button className="flex items-center justify-center px-2 py-2 bg-yellow-200 border-2 border-black rounded-lg ">
                <Edit3 size={18} className="text-black" />
              </button>
            </Link>
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:gap-10">
              <div className="flex-shrink-0">
                <img 
                  src={session?.user?.image || profile.image || '/default-avatar.png'}
                  alt={profile.name || 'User'}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 object-cover border-2 border-black bg-gray-200 rounded-full"
                />
              </div>
              <div className="flex-1 flex flex-col gap-3 text-center md:text-left w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-col gap-2">
                    <h1 className="font-satoshi text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-gray-900 break-words">{profile.name}</h1>
                    {/* Credits Display - Prominent placement */}
                    <div className="flex justify-center md:justify-start">
                      <div className="inline-flex items-center gap-2 px-4 py-0.5 bg-green-100 text-green-800 font-semibold border border-green-300 rounded-full text-sm md:text-base">
                        <Coins className="w-4 h-4 text-green-600" />
                        <span>{profile.credits || 0} Credits</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile/edit" className="hidden md:block">
                    <button className="flex items-center justify-center px-4 py-2 md:px-5 bg-yellow-200 text-black font-semibold border-2 border-black rounded-lg text-base md:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      <Edit3 size={16} className="mr-2 md:mr-2"/> Edit Profile
                    </button>
                  </Link>
                </div>
                <p className="text-gray-500 text-base md:text-lg font-medium break-all">{session?.user?.email || profile.email}</p>
                
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-1">
                  <span className="text-gray-400 text-xs sm:text-sm">Member since {new Date((profile as any).createdAt).toLocaleDateString()}</span>
                  {profile.location && (
                    <span className="text-gray-400 text-xs sm:text-sm flex items-center justify-center md:justify-start gap-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="inline-block flex-shrink-0"/>
                        <span>{profile.location.city || ''}{profile.location.city && profile.location.state ? ',' : ''} {profile.location.state || ''}</span>
                      </div>
                      <span className="text-xs sm:text-sm">(Service Radius: {profile.location.radius}km)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white p-4 sm:p-6 md:p-8 border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
            <h2 className="font-satoshi text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2 sm:gap-3">
                {profile.skills.map(skill => (
                  <li key={skill.id} className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 sm:px-4 text-gray-800 text-sm sm:text-base font-medium">
                    {skill.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic text-sm sm:text-base">You haven't added any skills yet. <Link href='/profile/edit' className='underline'>Add some skills</Link>.</p>
            )}
          </div>

          {/* Placeholder for more sections: Services, Ratings, etc. */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyProfilePage; 