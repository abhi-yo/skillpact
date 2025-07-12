import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Clock, Calendar, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function ExchangesHub() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-blue-50 p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="relative mb-4">
            <h1 className="font-satoshi tracking-tight text-3xl font-bold text-black">My Exchanges</h1>
            <div className="relative">
              <svg 
                viewBox="0 0 200 8" 
                className="w-48 h-2 absolute left-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2,6 Q50,2 100,4 T198,6" 
                  stroke="#9ca3af" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <p className="text-base text-gray-600 mt-1 mb-10">Easily track and manage all your skill exchanges. Quickly access pending, scheduled, in-progress, completed, and cancelled exchanges from one place.</p>
          <div className="border-[3px] border-black p-6 bg-white w-full rounded-2xl">
            <div className="flex flex-col gap-6 w-full">
              <Link href="/exchanges/requests" aria-label="Pending Exchanges" className="block border-[1.5px] border-black bg-yellow-50/40 px-4 py-3 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-all duration-150 select-none cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 w-full">
                <div className="flex items-center gap-4">
                  <Clock className="text-gray-400" size={22} />
                  <span>Pending Exchanges</span>
                </div>
              </Link>
              <Link href="/exchanges/scheduled" aria-label="Scheduled Exchanges" className="block border-[1.5px] border-black bg-blue-50/40 px-4 py-3 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-all duration-150 select-none cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 w-full">
                <div className="flex items-center gap-4">
                  <Calendar className="text-gray-400" size={22} />
                  <span>Scheduled Exchanges</span>
                </div>
              </Link>
              <Link href="/exchanges/in-progress" aria-label="In Progress Exchanges" className="block border-[1.5px] border-black bg-green-50/40 px-4 py-3 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-all duration-150 select-none cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 w-full">
                <div className="flex items-center gap-4">
                  <RefreshCw className="text-gray-400" size={22} />
                  <span>In Progress</span>
                </div>
              </Link>
              <Link href="/exchanges/history" aria-label="Completed Exchanges" className="block border-[1.5px] border-black bg-gray-100/60 px-4 py-3 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-all duration-150 select-none cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 w-full">
                <div className="flex items-center gap-4">
                  <CheckCircle className="text-gray-400" size={22} />
                  <span>Completed Exchanges</span>
                </div>
              </Link>
              <Link href="/exchanges/cancelled" aria-label="Cancelled Exchanges" className="block border-[1.5px] border-black bg-red-50/40 px-4 py-3 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-all duration-150 select-none cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 w-full">
                <div className="flex items-center gap-4">
                  <XCircle className="text-gray-400" size={22} />
                  <span>Cancelled Exchanges</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 