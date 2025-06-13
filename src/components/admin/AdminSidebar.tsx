"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Car,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Shield,
  UserCheck,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "owner"], // Both admin and owner can access
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
    roles: ["admin"], // Only admin can access
  },
  {
    name: "Cars",
    href: "/admin/cars",
    icon: Car,
    roles: ["admin"], // Only admin can access
  },
  {
    name: "Drivers",
    href: "/admin/drivers",
    icon: UserCheck,
    roles: ["admin"], // Only admin can access
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"], // Only admin can access
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    roles: ["admin"], // Only admin can access
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: FileText,
    roles: ["admin", "owner"], // Both admin and owner can access
  },
  {
    name: "Validations",
    href: "/admin/validations",
    icon: Shield,
    roles: ["admin"], // Only admin can access
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(session?.user?.role as string)
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b bg-primary">
            <h1 className="text-xl font-bold text-primary-foreground">
              Admin Panel
            </h1>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-4 space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  Role: {session?.user?.role || "user"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
