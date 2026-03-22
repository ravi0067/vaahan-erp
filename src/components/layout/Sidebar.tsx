"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
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
  ChevronLeft,
  ChevronRight,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

// All navigation items
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

// Role → allowed hrefs mapping
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
  if (!role) return allNavItems; // fallback: show all
  const allowed = roleNavConfig[role];
  if (!allowed) return allNavItems;
  return allNavItems.filter((item) => allowed.includes(item.href));
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const { data: session } = useSession();

  const role = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const navItems = getNavItemsForRole(role);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-background border-r transition-all duration-300 sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-none">VaahanERP</h2>
              <p className="text-[10px] text-muted-foreground">Dealership Management</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 shrink-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t px-4 py-3 space-y-0.5">
          <p className="text-[10px] text-muted-foreground text-center">
            VaahanERP v1.0
          </p>
          <p className="text-[9px] text-muted-foreground text-center">
            Powered by Ravi Accounting Services
          </p>
        </div>
      )}
    </aside>
  );
}
