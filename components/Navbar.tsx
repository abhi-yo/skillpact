'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="text-blue-600 font-bold text-2xl transform -rotate-2 relative">
              <span className="absolute -inset-1 bg-yellow-300 -z-10 transform rotate-1"></span>
              <span className="relative">Skillpact</span>
            </a>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {['How It Works', 'Services', 'Community', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
              >
                {item}
              </a>
            ))}
            {/* Sign Up / Login Button -> Now just Login */}
            <Link href="/login">
              <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer inline-block">
                Login
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 focus:outline-none p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 absolute w-full left-0 right-0 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {['How It Works', 'Services', 'Community', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="block py-2 text-gray-800 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            {/* Mobile Sign Up / Login Button -> Now just Login */}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
              <span className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer">
                Login
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;