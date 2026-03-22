"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig } from "@/lib/showroom-config";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  PackagePlus,
  Bike,
  Car,
  Zap,
  Store,
  ClipboardList,
  TrendingUp,
  Wrench,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  BookUser,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const iconMap: Record<string, LucideIcon> = { Bike, Car, Zap, Store };

function getVehicleIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Bike;
}

function buildNavItems(bookingLabel: string, stockLabel: string, iconName: string): NavItem[] {
  const VehicleIcon = getVehicleIcon(iconName);
  return [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Leads CRM", icon: UserPlus, href: "/leads" },
    { label: "Add Stock", icon: PackagePlus, href: "/stock/add" },
    { label: stockLabel, icon: Package, href: "/stock" },
    { label: bookingLabel, icon: VehicleIcon, href: "/bookings/new" },
    { label: "Booking List", icon: ClipboardList, href: "/bookings" },
    { label: "Sales", icon: TrendingUp, href: "/sales" },
    { label: "Service Finance", icon: Wrench, href: "/service" },
    { label: "CashFlow & Daybook", icon: Wallet, href: "/cashflow" },
    { label: "Expenses", icon: Receipt, href: "/expenses" },
    { label: "Reports", icon: BarChart3, href: "/reports" },
    { label: "Users", icon: Users, href: "/users" },
    { label: "System Settings", icon: Settings, href: "/settings" },
    { label: "Customer Ledger", icon: BookUser, href: "/customers" },
    { label: "RTO & Documents", icon: FileCheck, href: "/rto" },
    { label: "Clients (Admin)", icon: ShieldCheck, href: "/admin" },
    { label: "Help & Support", icon: HelpCircle, href: "/help" },
  ];
}

const roleNavConfig: Record<string, string[]> = {
  SUPER_ADMIN: ["/dashboard", "/admin", "/reports", "/settings", "/help"],
  OWNER: [],
  MANAGER: [],
  SALES_EXEC: ["/dashboard", "/leads", "/bookings/new", "/bookings", "/stock", "/stock/add", "/sales", "/customers", "/help"],
  ACCOUNTANT: ["/dashboard", "/cashflow", "/expenses", "/reports", "/customers", "/help"],
  MECHANIC: ["/dashboard", "/service", "/help"],
  VIEWER: ["/dashboard", "/reports", "/help"],
};

const managerExclude = ["/settings", "/users"];

function getNavItemsForRole(role: string | undefined, allNavItems: NavItem[]): NavItem[] {
  if (!role || role === "OWNER") return allNavItems;
  if (role === "MANAGER") return allNavItems.filter((n) => !managerExclude.includes(n.href));
  const allowed = roleNavConfig[role];
  if (!allowed || allowed.length === 0) return allNavItems;
  return allNavItems.filter((item) => allowed.includes(item.href));
}

export function MobileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  const role = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const allNavItems = buildNavItems(config.bookingLabel, config.stockLabel, config.icon);
  const navItems = getNavItemsForRole(role, allNavItems);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 h-16 px-4 border-b">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">V</span>
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-none">VaahanERP</h2>
          <p className="text-[10px] text-muted-foreground">Dealership Management</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3 space-y-0.5">
        <p className="text-[10px] text-muted-foreground text-center">VaahanERP v1.0</p>
        <p className="text-[9px] text-muted-foreground text-center">Powered by Ravi Accounting Services</p>
      </div>
    </div>
  );
}
