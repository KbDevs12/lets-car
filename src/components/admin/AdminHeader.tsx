"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) return "Dashboard";
    return (
      segments[segments.length - 1].charAt(0).toUpperCase() +
      segments[segments.length - 1].slice(1)
    );
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 w-64" />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
