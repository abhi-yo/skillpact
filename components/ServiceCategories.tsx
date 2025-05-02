'use client'

import React from 'react';
import { Wrench, BookOpen, Utensils, Palette, Car, Scaling as Seedling, Dog, Computer } from 'lucide-react';

const categories = [
  {
    icon: <Wrench size={32} className="text-blue-600" />,
    name: 'Home Repair',
    examples: 'Plumbing, Electrical, Carpentry',
  },
  {
    icon: <BookOpen size={32} className="text-blue-600" />,
    name: 'Tutoring',
    examples: 'Math, Language, Music',
  },
  {
    icon: <Utensils size={32} className="text-blue-600" />,
    name: 'Cooking',
    examples: 'Meal Prep, Baking, Cuisine',
  },
  {
    icon: <Palette size={32} className="text-blue-600" />,
    name: 'Creative',
    examples: 'Design, Photography, Art',
  },
  {
    icon: <Car size={32} className="text-blue-600" />,
    name: 'Transportation',
    examples: 'Rides, Moving, Deliveries',
  },
  {
    icon: <Seedling size={32} className="text-blue-600" />,
    name: 'Gardening',
    examples: 'Planting, Lawn Care, Pruning',
  },
  {
    icon: <Dog size={32} className="text-blue-600" />,
    name: 'Pet Care',
    examples: 'Walking, Sitting, Grooming',
  },
  {
    icon: <Computer size={32} className="text-blue-600" />,
    name: 'Tech Help',
    examples: 'Troubleshooting, Setup, Training',
  },
];

const ServiceCategories: React.FC = () => {
  return (
    <section id="services" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-satoshi tracking-satoshi-tight text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">Service Categories</span>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-300 -z-10"></div>
          </h2>
          <p className="text-xl text-gray-700">
            Discover the wide variety of services you can exchange
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="group bg-blue-50 p-6 border-2 border-black transition-all duration-200 hover:bg-blue-100 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-lg border-2 border-black mb-4 group-hover:bg-yellow-300 transition-colors duration-200">
                  {category.icon}
                </div>
                <h3 className="font-satoshi tracking-satoshi-tight text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-700">{category.examples}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold transition-all transform hover:-translate-y-1 duration-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            Browse All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;