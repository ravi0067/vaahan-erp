"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  PackagePlus,
  Bike,
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

const allNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Leads CRM", icon: UserPlus, href: "/leads" },
  { label: "Add Stock", icon: PackagePlus, href: "/stock/add" },
  { label: "Stock List", icon: Package, href: "/stock" },
  { label: "Book Bike", icon: Bike, href: "/bookings/new" },
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

const roleNavConfig: Record<string, string[]> = {
  SUPER_ADMIN: ["/dashboard", "/admin", "/reports", "/settings", "/help"],
  OWNER: allNavItems.map((n) => n.href),
  MANAGER: allNavItems.filter((n) => !["/settings", "/users"].includes(n.href)).map((n) => n.href),
  SALES_EXEC: ["/dashboard", "/leads", "/bookings/new", "/bookings", "/stock", "/stock/add", "/sales", "/customers", "/help"],
  ACCOUNTANT: ["/dashboard", "/cashflow", "/expenses", "/reports", "/customers", "/help"],
  MECHANIC: ["/dashboard", "/service", "/help"],
  VIEWER: ["/dashboard", "/reports", "/help"],
};

function getNavItemsForRole(role?: string): NavItem[] {
  if (!role) return allNavItems;
  const allowed = roleNavConfig[role];
  if (!allowed) return allNavItems;
  return allNavItems.filter((item) => allowed.includes(item.href));
}

export function MobileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const navItems = getNavItemsForRole(role);

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

      {/* Footer */}
      <div className="border-t px-4 py-3 space-y-0.5">
        <p className="text-[10px] text-muted-foreground text-center">VaahanERP v1.0</p>
        <p className="text-[9px] text-muted-foreground text-center">Powered by Ravi Accounting Services</p>
      </div>
    </div>
  );
}
