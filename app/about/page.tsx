'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, CreditCard, MapPin, MessageCircle, Star, FileText, Shield, BookOpen, Mail, ExternalLink } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Learn More About SkillPact
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Discover how our community-driven platform transforms the way neighbors exchange skills and services
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How SkillPact Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow h-72 flex flex-col">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">1. Join & Create Profile</h3>
              <p className="text-gray-600 text-center flex-1 leading-relaxed">Sign up and list your skills, services, and what you're looking for in your community.</p>
            </div>
            
            <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow h-72 flex flex-col">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">2. Discover Services</h3>
              <p className="text-gray-600 text-center flex-1 leading-relaxed">Browse local services and find exactly what you need from trusted neighbors.</p>
            </div>
            
            <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow h-72 flex flex-col">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">3. Exchange with Credits</h3>
              <p className="text-gray-600 text-center flex-1 leading-relaxed">Use our internal credit system to fairly exchange services without money.</p>
            </div>
            
            <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow h-72 flex flex-col">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">4. Build Reputation</h3>
              <p className="text-gray-600 text-center flex-1 leading-relaxed">Rate and review exchanges to build trust and grow your community standing.</p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose SkillPact?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg mr-4 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                Community-Focused
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Connect with neighbors and build meaningful relationships while sharing knowledge and services. 
                Our platform strengthens local communities by encouraging skill sharing and mutual support.
              </p>
              
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg mr-4 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-900" />
                </div>
                Fair Credit System
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our internal credit system ensures fair value exchange without the need for money. 
                Everyone starts with initial credits and earns more by helping others.
              </p>
            </div>
            
            <div className="bg-white p-10 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg mr-4 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                Safe & Secure
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Built-in reputation system, user verification, and community guidelines ensure a safe 
                environment for all exchanges. Report issues and get community support when needed.
              </p>
              
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg mr-4 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-900" />
                </div>
                Location-Based
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Find services and people near you. Whether you need help with groceries, tech support, 
                or tutoring, discover what's available in your neighborhood.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Important Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/terms-of-service" className="group">
              <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Terms of Service</h3>
                <p className="text-gray-600 flex-1 leading-relaxed text-sm">
                  Read our terms and conditions to understand how SkillPact works and your rights and responsibilities.
                </p>
              </div>
            </Link>
            
            <Link href="/privacy-policy" className="group">
              <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-7 h-7 text-gray-900" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Privacy Policy</h3>
                <p className="text-gray-600 flex-1 leading-relaxed text-sm">
                  Learn how we protect your data and privacy while using our platform.
                </p>
              </div>
            </Link>
            
            <Link href="/community-guidelines" className="group">
              <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Community Guidelines</h3>
                <p className="text-gray-600 flex-1 leading-relaxed text-sm">
                  Understand our community standards and guidelines for respectful interactions.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage; 