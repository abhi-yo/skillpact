"use client";

import React from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import FullPageLoader from "@/components/FullPageLoader";

export default function ExchangeHistoryPage() {
  const { data: session, status } = useSession();
  const {
    data: exchanges,
    isLoading,
    refetch,
  } = trpc.exchange.getUserExchanges.useQuery(
    { status: "completed" },
    { enabled: status === "authenticated" }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <FullPageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-8 min-h-screen font-inter">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-satoshi text-3xl font-bold">
            Completed Exchanges
          </h1>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Refresh
          </button>
        </div>
        {!isLoading && exchanges && exchanges.length === 0 && (
          <p>No completed exchanges.</p>
        )}
        <div className="space-y-4">
          {exchanges &&
            exchanges.map((ex) => (
              <Link
                key={ex.id}
                href={`/exchanges/${ex.id}`}
                className="block border-2 border-black rounded-lg bg-white p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <Image
                  src={ex.provider?.image || "/default-avatar.png"}
                  alt={ex.provider?.name || "Provider"}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-black bg-white"
                />
                <div className="flex-1">
                  <div className="font-bold text-lg break-words">
                    {ex.providerService?.title || "Service"}
                  </div>
                  <div className="text-sm text-gray-700">
                    With: {ex.provider?.name || ex.requester?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Completed:{" "}
                    {ex.completedDate
                      ? new Date(ex.completedDate).toLocaleString()
                      : "Not set"}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
