'use client'

import React from 'react';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-blue-900 text-white py-12 border-t-4 border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="font-bold text-2xl mb-4 transform -rotate-2 relative inline-block">
              <span className="absolute -inset-1 bg-yellow-300 -z-10 transform rotate-1"></span>
              <span className="relative text-blue-900">Skillpact</span>
            </div>
            <p className="text-blue-200 mb-4">
              The credit-based platform where neighbors exchange skills and services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="text-blue-200 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#services" className="text-blue-200 hover:text-white transition-colors">Services</a></li>
              <li><a href="#community" className="text-blue-200 hover:text-white transition-colors">Community</a></li>
              <li><a href="#about" className="text-blue-200 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Community Guidelines</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-blue-200">hello@skillpact.example</li>
              <li className="text-blue-200">+1 (555) 123-4567</li>
              <li className="text-blue-200">123 Community Lane<br />Neighborhood City, ST 12345</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-blue-800 text-center text-blue-300 text-sm">
          <p>© {new Date().getFullYear()} Skillpact. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;