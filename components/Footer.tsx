'use client'

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-blue-900 text-white py-12 border-t-4 border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="font-bold text-3xl mb-4 transform -rotate-2 relative inline-block">
              <span className="absolute -inset-1 bg-yellow-300 -z-10 transform rotate-1"></span>
              <span className="relative text-blue-900">Skillpact</span>
            </div>
            <p className="text-blue-200 mb-4">
              The credit-based platform where neighbors exchange skills and services.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-blue-200 hover:text-yellow-300 transition-colors">How It Works</a></li>
              <li><a href="#services" className="text-blue-200 hover:text-yellow-300 transition-colors">Services</a></li>
              <li><a href="#community" className="text-blue-200 hover:text-yellow-300 transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms-of-service" className="text-blue-200 hover:text-yellow-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-blue-200 hover:text-yellow-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/community-guidelines" className="text-blue-200 hover:text-yellow-300 transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="text-blue-200"><a href="mailto:hello@skillpact.co" className="hover:text-yellow-300 underline">hello@skillpact.co</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-blue-800 text-center text-blue-300 text-sm">
          <p className="mb-2">© 2025 Skillpact. All rights reserved.</p>
          <p className="text-blue-400/60 text-xs">
            Database powered by{' '}
            <a 
              href="https://neon.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-200/80 hover:text-green-300 transition-colors underline decoration-dotted"
            >
              Neon
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;