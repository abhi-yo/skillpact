"use client";

import {
  ArrowRightLeft,
  Briefcase,
  History,
  LayoutDashboard,
  Search,
  Bell,
  Settings,
  LifeBuoy,
  User,
  Loader2,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  disabled = false,
}: NavItemProps & { disabled?: boolean }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={disabled ? "#" : href}
            className={cn(
              "flex items-center w-full px-3 py-3 text-base font-bold rounded-lg transition-colors duration-150 group",
              isActive
                ? "bg-blue-100 text-blue-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed ? "justify-center" : "",
              disabled
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            )}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
          >
            <Icon
              className={cn(
                isActive
                  ? "text-blue-800"
                  : "text-gray-400 group-hover:text-gray-600",
                isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
              )}
            />
            <span className={cn(isCollapsed && "sr-only", "font-bold")}>
              {label}
            </span>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            <p className="text-sm font-medium">{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isSearchFocused, setSearchFocused] = React.useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: session } = useSession();
  const { data: profile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!session,
  });
  const { data: activeExchangeSummary } =
    trpc.exchange.getActiveExchangeSummary.useQuery();
  const { data: pendingExchanges } = trpc.exchange.getPendingExchanges.useQuery(
    undefined,
    { enabled: !!session }
  );
  const { data: upcomingExchanges } =
    trpc.exchange.getUpcomingExchanges.useQuery(undefined, {
      enabled: !!session,
    });

  let singleVisibleActiveId: string | null | undefined = null;
  const pendingExchangesCount = pendingExchanges?.length || 0;
  const upcomingExchangesCount = upcomingExchanges?.length || 0;
  const totalVisibleActive = pendingExchangesCount + upcomingExchangesCount;
  if (totalVisibleActive === 1) {
    if (pendingExchangesCount === 1)
      singleVisibleActiveId = pendingExchanges?.[0]?.id;
    else if (upcomingExchangesCount === 1)
      singleVisibleActiveId = upcomingExchanges?.[0]?.id;
  }
  const myExchangesHref = "/exchanges";
  const isMyExchangesDisabled = false;

  const { data: searchResults, isLoading: isSearchLoading } =
    trpc.service.searchServices.useQuery(
      { query: debouncedSearchTerm },
      { enabled: debouncedSearchTerm.trim().length > 0 }
    );

  const isActive = (path: string) => pathname === path;

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      router.push(
        `/services/browse?q=${encodeURIComponent(searchTerm.trim())}`
      );
    }
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <SidebarTrigger className="fixed top-4 right-4 z-40 md:hidden p-2 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
      <Sidebar
        className="h-screen border-r bg-white/60 backdrop-blur-lg font-satoshi"
        collapsible="icon"
      >
        <div className="flex h-full flex-col">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-bold text-2xl text-gray-900",
                    isCollapsed && "sr-only"
                  )}
                >
                  Skillpact
                </span>
                {profile && !isCollapsed && (
                  <span
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold border border-blue-200 rounded text-sm tracking-wide"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {profile.credits} C
                  </span>
                )}
              </div>
              <SidebarTrigger />
            </div>
            <div className={cn("relative mt-4", isCollapsed && "hidden")}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 100)}
                  onKeyDown={handleSearch}
                  className="w-full rounded-lg bg-white border pl-8 pr-4 py-2 text-sm"
                />
              </div>
              {isSearchFocused &&
                !isCollapsed &&
                searchTerm.trim().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {isSearchLoading && (
                      <div className="p-4 flex items-center justify-center text-sm text-gray-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </div>
                    )}
                    {!isSearchLoading &&
                      searchResults &&
                      searchResults.services.length > 0 && (
                        <ul className="py-1">
                          {searchResults.services.slice(0, 5).map((service) => (
                            <li
                              key={service.id}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <Link
                                href={`/services/${service.id}`}
                                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                              >
                                {service.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    {!isSearchLoading &&
                      (!searchResults ||
                        searchResults.services.length === 0) && (
                        <div className="p-4 text-sm text-center text-gray-500">
                          No results found.
                        </div>
                      )}
                  </div>
                )}
            </div>
          </SidebarHeader>
          <div className="flex-1 px-3 py-4 space-y-4">
            <nav className="space-y-1">
              <NavItem
                href="/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
                isActive={isActive("/dashboard")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/notifications"
                icon={Bell}
                label="Notifications"
                isActive={isActive("/notifications")}
                isCollapsed={isCollapsed}
              />
            </nav>
            <div className="space-y-1">
              <div
                className={cn("px-3 py-2", isCollapsed && "px-0 text-center")}
              >
                <h3
                  className={cn(
                    "text-sm font-bold text-gray-400 uppercase tracking-wider",
                    isCollapsed ? "sr-only" : ""
                  )}
                >
                  Workspace
                </h3>
                <div
                  className={cn("border-b my-2", isCollapsed ? "" : "hidden")}
                />
              </div>
              <NavItem
                href="/services/new"
                icon={Plus}
                label="Offer Service"
                isActive={isActive("/services/new")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/services/my-services"
                icon={Briefcase}
                label="My Services"
                isActive={isActive("/services/my-services")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href={myExchangesHref}
                icon={ArrowRightLeft}
                label="Exchanges"
                isActive={pathname?.startsWith("/exchanges") || false}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/activity"
                icon={History}
                label="Activity"
                isActive={isActive("/activity")}
                isCollapsed={isCollapsed}
              />
            </div>
          </div>
          <div className="mt-auto">
            <div className="border-t p-3 mt-2 flex flex-col gap-2">
              <NavItem
                href="/profile/edit"
                icon={Settings}
                label="Settings"
                isActive={isActive("/profile/edit")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/profile"
                icon={User}
                label="Profile"
                isActive={isActive("/profile")}
                isCollapsed={isCollapsed}
              />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  "w-full mt-2 flex items-center justify-center",
                  isCollapsed
                    ? "p-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-all"
                    : "px-4 py-2 bg-red-50 text-red-700 font-semibold border border-red-200 rounded hover:bg-red-100 transition-all text-sm"
                )}
                title={isCollapsed ? "Sign Out" : undefined}
              >
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <LogOut size={22} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sign Out</TooltipContent>
                  </Tooltip>
                ) : (
                  "Sign Out"
                )}
              </button>
            </div>
          </div>
        </div>
      </Sidebar>
      <SidebarInset className="flex flex-1 flex-col overflow-y-auto bg-blue-50">
        {children}
      </SidebarInset>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
