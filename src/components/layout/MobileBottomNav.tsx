"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Bookings", icon: ClipboardList, href: "/bookings" },
  { label: "Leads", icon: UserPlus, href: "/leads" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
