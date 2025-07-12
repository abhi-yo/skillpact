'use client'

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-snug text-gray-900 relative z-10">
                Exchange Skills
                <br />
                <span className="text-blue-600">Without Money</span>
              </h1>
              <div className="absolute -bottom-3 left-0 right-0 h-4 bg-yellow-300 -z-10 transform -rotate-1"></div>
            </div>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl">
              The neighborhood marketplace where skills are exchanged using our credits system no money needed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <span className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold text-base transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center cursor-pointer">
                Get Started
                <ArrowRight className="ml-2" size={20} />
                </span>
              </Link>
              <button className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-semibold text-base transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="relative border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <img 
                src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg" 
                alt="People exchanging services" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-4 right-4 bg-yellow-300 px-4 py-2 border-2 border-black transform rotate-3">
                <span className="font-bold text-black">Trade Skills</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-300 border-4 border-black z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;