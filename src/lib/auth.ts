import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "@/lib/auth-types";

// Demo users for different roles
const demoUsers = [
  {
    id: "user-super-admin",
    name: "Super Admin",
    email: "superadmin@vaahan.com",
    password: "super123",
    role: "SUPER_ADMIN" as const,
    tenantId: "tenant-platform",
    tenantName: "VaahanERP Platform",
  },
  {
    id: "user-owner",
    name: "Ravi Kumar",
    email: "owner@vaahan.com",
    password: "owner123",
    role: "OWNER" as const,
    tenantId: "tenant-vaahan-motors",
    tenantName: "Vaahan Motors",
  },
  {
    id: "user-manager",
    name: "Amit Singh",
    email: "manager@vaahan.com",
    password: "manager123",
    role: "MANAGER" as const,
    tenantId: "tenant-vaahan-motors",
    tenantName: "Vaahan Motors",
  },
  {
    id: "user-sales",
    name: "Priya Sharma",
    email: "sales@vaahan.com",
    password: "sales123",
    role: "SALES_EXEC" as const,
    tenantId: "tenant-vaahan-motors",
    tenantName: "Vaahan Motors",
  },
  {
    id: "user-accountant",
    name: "Suresh Gupta",
    email: "accountant@vaahan.com",
    password: "accountant123",
    role: "ACCOUNTANT" as const,
    tenantId: "tenant-vaahan-motors",
    tenantName: "Vaahan Motors",
  },
  {
    id: "user-mechanic",
    name: "Deepak Yadav",
    email: "mechanic@vaahan.com",
    password: "mechanic123",
    role: "MECHANIC" as const,
    tenantId: "tenant-vaahan-motors",
    tenantName: "Vaahan Motors",
  },
  {
    // Legacy admin login
    id: "user-legacy-admin",
    name: "Admin User",
    email: "admin@vaahan.com",
    password: "admin123",
    role: "OWNER" as const,
    tenantId: "tenant-vaahan-motors",
    tenantName: "Vaahan Motors",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = demoUsers.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenantName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantName = token.tenantName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "vaahan-erp-dev-secret-key-change-in-production",
};
