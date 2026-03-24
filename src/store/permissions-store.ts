import { create } from "zustand";
import { persist } from "zustand/middleware";

// All available modules/pages in the system
export const ALL_MODULES = [
  { key: "dashboard", label: "Dashboard", icon: "📊", description: "Overview & stats" },
  { key: "leads", label: "Leads CRM", icon: "👥", description: "Lead tracking & follow-ups" },
  { key: "leads-advanced", label: "Advanced CRM", icon: "🧠", description: "Lead scoring & pipeline" },
  { key: "marketing", label: "Marketing Hub", icon: "📢", description: "Campaigns & promotions" },
  { key: "stock-add", label: "Add Stock", icon: "📦", description: "Add new vehicles" },
  { key: "stock", label: "Stock List", icon: "📦", description: "View inventory" },
  { key: "bookings-new", label: "New Booking", icon: "🏍️", description: "Create bookings" },
  { key: "bookings", label: "Booking List", icon: "📋", description: "View all bookings" },
  { key: "sales", label: "Sales", icon: "📈", description: "Sales records" },
  { key: "service", label: "Service Finance", icon: "🔧", description: "Job cards & service" },
  { key: "cashflow", label: "CashFlow & Daybook", icon: "💰", description: "Daily cash tracking" },
  { key: "expenses", label: "Expenses", icon: "🧾", description: "Expense management" },
  { key: "reports", label: "Reports", icon: "📊", description: "Analytics & reports" },
  { key: "users", label: "Users", icon: "👤", description: "User management" },
  { key: "settings", label: "System Settings", icon: "⚙️", description: "Configuration" },
  { key: "customers", label: "Customer Ledger", icon: "📒", description: "Customer records" },
  { key: "rto", label: "RTO & Documents", icon: "📄", description: "RTO tracking" },
  { key: "documents", label: "Document Vault", icon: "📁", description: "Document management" },
  { key: "promotions", label: "Promotions", icon: "🎯", description: "Offers & campaigns" },
  { key: "communications", label: "Communication Center", icon: "📞", description: "Calls & messaging" },
  { key: "help", label: "Help & Support", icon: "❓", description: "Help center" },
] as const;

export type ModuleKey = (typeof ALL_MODULES)[number]["key"];

// Map module keys to their href paths
export const MODULE_HREF_MAP: Record<string, string> = {
  dashboard: "/dashboard",
  leads: "/leads",
  "leads-advanced": "/leads/advanced",
  marketing: "/marketing",
  "stock-add": "/stock/add",
  stock: "/stock",
  "bookings-new": "/bookings/new",
  bookings: "/bookings",
  sales: "/sales",
  service: "/service",
  cashflow: "/cashflow",
  expenses: "/expenses",
  reports: "/reports",
  users: "/users",
  settings: "/settings",
  customers: "/customers",
  rto: "/rto",
  documents: "/documents",
  promotions: "/promotions",
  communications: "/communications",
  help: "/help",
};

// Default permissions per role
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: Object.keys(MODULE_HREF_MAP), // All access
  MANAGER: [
    "dashboard", "leads", "leads-advanced", "marketing", "stock-add", "stock",
    "bookings-new", "bookings", "sales", "service", "cashflow", "expenses",
    "reports", "customers", "rto", "documents", "promotions", "communications", "help",
  ],
  SALES_EXEC: [
    "dashboard", "leads", "leads-advanced", "bookings-new", "bookings",
    "stock", "stock-add", "sales", "customers", "help",
  ],
  ACCOUNTANT: ["dashboard", "cashflow", "expenses", "reports", "customers", "help"],
  MECHANIC: ["dashboard", "service", "help"],
  VIEWER: ["dashboard", "reports", "help"],
};

interface PermissionsState {
  rolePermissions: Record<string, string[]>;
  setRolePermissions: (role: string, modules: string[]) => void;
  hasAccess: (role: string, moduleKey: string) => boolean;
  getAllowedHrefs: (role: string) => string[];
  resetToDefaults: () => void;
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS },

      setRolePermissions: (role, modules) =>
        set((s) => ({
          rolePermissions: { ...s.rolePermissions, [role]: modules },
        })),

      hasAccess: (role, moduleKey) => {
        if (role === "SUPER_ADMIN" || role === "OWNER") return true;
        const perms = get().rolePermissions[role] || [];
        return perms.includes(moduleKey);
      },

      getAllowedHrefs: (role) => {
        if (role === "SUPER_ADMIN") return Object.values(MODULE_HREF_MAP);
        if (role === "OWNER") return Object.values(MODULE_HREF_MAP);
        const perms = get().rolePermissions[role] || [];
        return perms.map((key) => MODULE_HREF_MAP[key]).filter(Boolean);
      },

      resetToDefaults: () =>
        set({ rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS } }),
    }),
    { name: "vaahan-permissions" }
  )
);
