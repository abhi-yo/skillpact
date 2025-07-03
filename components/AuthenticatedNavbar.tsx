'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LayoutDashboard, User, Briefcase, Search, LogOut, Settings, ChevronDown } from 'lucide-react';

const AuthenticatedNavbar: React.FC = () => {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Services', href: '/services', icon: Briefcase },
    { name: 'Browse', href: '/services/browse', icon: Search },
  ];

  const userMenuItems = [
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white shadow-md py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 font-bold text-2xl">
             Skillpact
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                <item.icon size={18} className="mr-1.5"/>
                {item.name}
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium focus:outline-none"
              >
                {session?.user?.name || 'Account'}
                <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}/>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {userMenuItems.map((item) => (
                     <Link
                       key={item.name}
                       href={item.href}
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                       onClick={() => setUserMenuOpen(false)}
                     >
                       <item.icon size={16} className="mr-2"/>
                       {item.name}
                     </Link>
                  ))}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut size={16} className="mr-2"/> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setUserMenuOpen(false); }}
              className="text-gray-700 focus:outline-none p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 absolute w-full left-0 right-0 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center py-2 text-gray-700 hover:text-blue-600 font-medium rounded-md hover:bg-gray-50 px-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                 <item.icon size={18} className="mr-3"/>
                 {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
               {userMenuItems.map((item) => (
                 <Link
                   key={item.name}
                   href={item.href}
                   className="flex items-center py-2 text-gray-700 hover:text-blue-600 font-medium rounded-md hover:bg-gray-50 px-3"
                   onClick={() => setMobileMenuOpen(false)}
                 >
                    <item.icon size={18} className="mr-3"/>
                    {item.name}
                 </Link>
               ))}
               <button
                 onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                 className="w-full text-left flex items-center py-2 text-red-600 hover:text-red-700 font-medium rounded-md hover:bg-red-50 px-3"
               >
                 <LogOut size={18} className="mr-3"/> Sign Out
               </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AuthenticatedNavbar; 