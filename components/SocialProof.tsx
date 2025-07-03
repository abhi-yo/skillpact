'use client'

import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "I earned 15 credits teaching guitar and used them for plumbing repairs. The credit system is so fair and transparent!",
    author: "Sarah K.",
    role: "Music Teacher",
    stars: 5,
  },
  {
    quote: "I love earning credits helping neighbors with gardening and using them for tech support. Perfect for retirees!",
    author: "James T.",
    role: "Retired Engineer",
    stars: 5,
  },
  {
    quote: "As a college student, I tutor kids for credits and get car repairs done. No money needed - just skills!",
    author: "Miguel R.",
    role: "Student",
    stars: 5,
  },
];

const SocialProof: React.FC = () => {
  return (
    <section id="community" className="py-16 md:py-24 bg-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">Community Stories</span>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-300 -z-10"></div>
          </h2>
          <p className="text-xl text-gray-700">
            See how people are using credits to exchange skills
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 border-2 border-black relative transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="absolute -top-3 -left-3 bg-yellow-300 h-8 w-8 border-2 border-black flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="mb-4 flex">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                ))}
                {[...Array(5 - testimonial.stars)].map((_, i) => (
                  <Star key={i + testimonial.stars} size={16} className="text-gray-300" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-4 italic">"{testimonial.quote}"</blockquote>
              <div className="font-semibold text-gray-900">{testimonial.author}</div>
              <div className="text-sm text-gray-600">{testimonial.role}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-blue-50 border-2 border-black p-6 max-w-2xl mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          <div className="font-bold text-2xl mb-2 text-blue-600">500+</div>
          <p className="text-gray-800">Credits earned and spent in our growing community</p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;