'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-blue-600 border-4 border-black p-8 md:p-12 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-300 border-2 border-black"></div>
          <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-yellow-300 border-2 border-black"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Earning Credits?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join our community, list your skills, and start earning credits by helping neighbors!
            </p>
          </div>
          
          <div className="max-w-md mx-auto flex justify-center">
            <Link href="/api/auth/signin" passHref>
              <button className="w-full bg-black text-white font-semibold py-3 px-8 transition-all flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                Get Started <ArrowRight className="ml-2" size={18} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;