import { DefaultSession } from "next-auth";

export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "MANAGER"
  | "SALES_EXEC"
  | "ACCOUNTANT"
  | "MECHANIC"
  | "VIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tenantId: string;
      tenantName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    tenantId: string;
    tenantName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    tenantId: string;
    tenantName: string;
  }
}
