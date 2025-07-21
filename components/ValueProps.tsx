'use client'

import React from 'react';
import { Users, Coins, MapPin, Star } from 'lucide-react';

const valueProps = [
  {
    icon: <Users size={32} className="text-blue-600" />,
    title: 'Build Community Connections',
    description: 'Connect with skilled neighbors in your area and build lasting relationships through exchanges.',
  },
  {
    icon: <Coins size={32} className="text-blue-600" />,
    title: 'Credits-Based Economy',
    description: 'Earn credits by providing services, and spend them to get the help you need. Fair and transparent.',
  },
  {
    icon: <MapPin size={32} className="text-blue-600" />,
    title: 'Location-Based Matching',
    description: 'Find services within your chosen radius. Help is always nearby when you need it.',
  },
  {
    icon: <Star size={32} className="text-blue-600" />,
    title: 'Build Your Reputation',
    description: 'Complete exchanges, earn ratings, and become a trusted member of your community.',
  },
];

const ValueProps: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">Why Choose Skillpact?</span>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-300 -z-10"></div>
          </h2>
          <p className="text-xl text-gray-700">
            The benefits of our credit-based skill exchange platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {valueProps.map((prop, index) => (
            <div 
              key={index} 
              className="bg-white p-6 border-2 border-black relative overflow-hidden transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 -mr-10 -mt-10 transform rotate-45"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg border-2 border-black mr-4">
                    {prop.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{prop.title}</h3>
                </div>
                <p className="text-gray-700">{prop.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;