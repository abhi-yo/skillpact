"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Star,
  UserCircle,
  MapPin,
  Tag,
  CalendarDays,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "@/components/DashboardLayout";

// Interface matching getServiceById return structure (adjust as needed)
interface ServiceDetails extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  description: string | null;
  hourlyRate: number | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: { id: string; name: string } | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    averageRating: number | null;
    ratingCount: number | null;
  } | null;
  // Add locationType, serviceRadius, tags here when available
}

const ServiceDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const serviceId = params.serviceId as string; // Get serviceId from URL
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    data: service,
    isLoading,
    error,
  } = trpc.service.getServiceById.useQuery(
    { id: serviceId },
    { enabled: !!serviceId } // Only run query if serviceId is available
  );

  // Mutation for creating an exchange request
  const createExchangeMutation = trpc.exchange.requestExchange.useMutation({
    onMutate: () => {
      setIsRequesting(true);
    },
    onSuccess: (data) => {
      toast.success("Exchange request sent successfully!");
      router.push(`/exchanges/${data.id}`);
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("You already have an active request for this service.");
      } else if (error.data?.code === "BAD_REQUEST") {
        if (error.message.includes("enough credits")) {
          toast.error(
            "You do not have enough credits to request this service."
          );
        } else {
          toast.error("You cannot request your own service.");
        }
      } else {
        toast.error(`Failed to send request: ${error.message}`);
      }
      console.error("Exchange request error:", error);
    },
    onSettled: () => {
      setIsRequesting(false);
    },
  });

  const handleRequestService = () => {
    if (!session) {
      toast.error("Please log in to request a service.");
      router.push("/login");
      return;
    }
    if (service) {
      createExchangeMutation.mutate({ providerServiceId: service.id });
    }
  };

  // Determine if the current user is the provider
  // Explicitly assert the session user type to include id
  const sessionUserId = (session?.user as { id?: string })?.id;
  const isOwnService = sessionUserId === service?.user?.id;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 text-center text-red-600">
          Error loading service details: {error.message}
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 text-center text-gray-600">
          Service not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-blue-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/services/browse"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-black mb-6"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Browse
          </Link>

          <Card className="border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white py-0">
            {/* Provider Info Header */}
            <CardHeader className="border-b-2 border-black p-0 bg-gray-50 rounded-t-lg -m-[2px]">
              <div className="flex items-center space-x-3 p-3">
                {service.user?.image ? (
                  <Image
                    src={service.user.image}
                    alt={service.user.name || "Provider"}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-black"
                  />
                ) : (
                  <UserCircle
                    size={48}
                    className="border-2 border-black rounded-full p-1 text-gray-500"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-600">Provided by</p>
                  <p className="font-satoshi text-xl font-bold leading-none">
                    {service.user?.name || "SkillSwap User"}
                  </p>
                  {service.user?.averageRating !== null &&
                    service.user?.averageRating !== undefined && (
                      <div className="flex items-center text-sm text-gray-700 mt-0.5">
                        <Star
                          size={14}
                          className="mr-1 text-yellow-500 fill-yellow-400"
                        />
                        {service.user.averageRating.toFixed(1)}
                        <span className="ml-1 text-xs">
                          ({service.user?.ratingCount || 0} reviews)
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-2">
              <CardTitle className="font-satoshi tracking-tight text-2xl font-bold mb-1 leading-none">
                {service.title}
              </CardTitle>

              {service.category && (
                <span className="inline-block bg-gray-200 border border-black px-2 py-0.5 text-xs font-medium mr-2 mb-2">
                  {service.category.name}
                </span>
              )}

              <p className="text-base text-gray-800 whitespace-pre-wrap mb-2">
                {service.description || "No description provided."}
              </p>

              {/* Rate/Hours */}
              <div className="mb-3 p-2 border-2 border-black bg-orange-50">
                <p className="text-sm font-medium">
                  Rate / Estimated Hours:{" "}
                  <span className="font-bold text-base">
                    {service.hourlyRate ?? "N/A"}
                  </span>
                </p>
              </div>

              {/* TODO: Add Location/Radius/Tags display here once available */}

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t-2 border-black">
                <Button
                  className="w-full text-base py-3 bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-70 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                  size="lg"
                  onClick={handleRequestService}
                  disabled={isRequesting || isOwnService || !service}
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending
                      Request...
                    </>
                  ) : isOwnService ? (
                    "This is your service"
                  ) : (
                    "Request this Service"
                  )}
                </Button>
                {createExchangeMutation.isError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                    <AlertCircle size={16} className="mr-1" />
                    {createExchangeMutation.error.data?.code === "CONFLICT"
                      ? "You already have an active request."
                      : createExchangeMutation.error.data?.code ===
                            "BAD_REQUEST" &&
                          createExchangeMutation.error.message.includes(
                            "enough credits"
                          )
                        ? "You do not have enough credits to request this service."
                        : createExchangeMutation.error.data?.code ===
                            "BAD_REQUEST"
                          ? "Cannot request your own service."
                          : "Could not send request."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServiceDetailPage;
