"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { useShowroomStore } from "@/store/showroom-store";
import { usePermissionsStore } from "@/store/permissions-store";
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
  ChevronLeft,
  ChevronRight,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Megaphone,
  Phone,
  Brain,
  CreditCard,
  Monitor,
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

const iconMap: Record<string, LucideIcon> = {
  Bike,
  Car,
  Zap,
  Store,
};

function getVehicleIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Bike;
}

function buildNavItems(bookingLabel: string, stockLabel: string, iconName: string): NavItem[] {
  const VehicleIcon = getVehicleIcon(iconName);
  return [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Leads CRM", icon: UserPlus, href: "/leads" },
    { label: "Lead Automation", icon: Zap, href: "/leads/crm" },
    { label: "Advanced CRM", icon: Brain, href: "/leads/advanced" },
    { label: "Marketing Hub", icon: Megaphone, href: "/marketing" },
    { label: `Add Stock`, icon: PackagePlus, href: "/stock/add" },
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
    { label: "Subscription", icon: CreditCard, href: "/settings/subscription" },
    { label: "Vaani Avatar TV", icon: Monitor, href: "/vaani-avatar" },
    { label: "Avatar Analytics", icon: BarChart3, href: "/admin/avatar-analytics" },
    { label: "Customer Ledger", icon: BookUser, href: "/customers" },
    { label: "RTO & Documents", icon: FileCheck, href: "/rto" },
    { label: "Document Vault", icon: FileCheck, href: "/documents" },
    { label: "Promotions", icon: Megaphone, href: "/promotions" },
    { label: "Communication Center", icon: Phone, href: "/communications" },
    { label: "Clients (Admin)", icon: ShieldCheck, href: "/admin" },
    { label: "Brand Management", icon: Store, href: "/admin/brands" },
    { label: "AI Configuration", icon: Brain, href: "/admin/ai-config" },
    { label: "Help & Support", icon: HelpCircle, href: "/help" },
  ];
}

function getNavItemsForRole(role: string | undefined, allNavItems: NavItem[], allowedHrefs: string[]): NavItem[] {
  if (!role) return allNavItems;

  // Super admin sees only admin pages
  if (role === "SUPER_ADMIN") {
    const superAdminPaths = ["/dashboard", "/admin", "/admin/settings", "/admin/brands", "/admin/ai-config", "/reports", "/settings", "/settings/subscription", "/vaani-avatar", "/admin/avatar-analytics", "/help"];
    return allNavItems.filter((n) => superAdminPaths.includes(n.href));
  }

  // Owner sees everything except admin pages
  if (role === "OWNER") {
    return allNavItems.filter((n) => !n.href.startsWith("/admin"));
  }

  // All other roles: use permission store's allowed hrefs
  // Also exclude admin pages for non-admin roles
  return allNavItems.filter((item) => !item.href.startsWith("/admin") && allowedHrefs.includes(item.href));
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const { data: session } = useSession();
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  const { getAllowedHrefs } = usePermissionsStore();
  const role = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const allNavItems = buildNavItems(config.bookingLabel, config.stockLabel, config.icon);
  const allowedHrefs = getAllowedHrefs(role || "VIEWER");
  const navItems = getNavItemsForRole(role, allNavItems, allowedHrefs);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-background border-r transition-all duration-300 sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {isCollapsed && (
          <div className="w-8 h-8 rounded-full overflow-hidden mx-auto">
            <img 
              src={(session?.user as any)?.logoUrl || '/logo-icon.png'} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <img 
                src={(session?.user as any)?.logoUrl || '/logo-icon.png'} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-none">
                {(session?.user as any)?.dealershipName || 'VaahanERP'}
              </h2>
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
