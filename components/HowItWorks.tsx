'use client'

import React from 'react';
import { UserPlus, Search, Handshake, Star } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus size={32} className="text-blue-600" />,
    title: 'Create Profile',
    description: 'Sign up and list your skills and services you can offer to others.',
  },
  {
    icon: <Search size={32} className="text-blue-600" />,
    title: 'Discover Services',
    description: 'Find services you need offered by people in your neighborhood.',
  },
  {
    icon: <Handshake size={32} className="text-blue-600" />,
    title: 'Propose Exchange',
    description: 'Offer your service in exchange for theirs and agree on details.',
  },
  {
    icon: <Star size={32} className="text-blue-600" />,
    title: 'Build Reputation',
    description: 'Complete exchanges and build your community reputation.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-satoshi tracking-satoshi-tight text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">How It Works</span>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-300 -z-10"></div>
          </h2>
          <p className="text-xl text-gray-700">
            Exchange services without money in four simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4 border-2 border-black mx-auto">
                {step.icon}
              </div>
              <h3 className="font-satoshi tracking-satoshi-tight text-xl font-bold text-gray-900 mb-2 text-center">
                Step {index + 1}: {step.title}
              </h3>
              <p className="text-gray-700 text-center">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <div className="inline-block bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all transform -rotate-1">
            <p className="font-medium text-blue-600">
              No money changes hands. Just skills and services!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;