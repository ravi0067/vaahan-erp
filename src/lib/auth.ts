import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "@/lib/auth-types";

// Fallback demo users — used when DB is unreachable (serverless cold starts, etc.)
const FALLBACK_USERS = [
  { id: "user-super-admin-001", name: "Super Admin", email: "admin@vaahan.com", password: "admin123", role: "SUPER_ADMIN" as const, tenantId: "system-vaahan-001", tenantName: "VaahanERP System" },
  { id: "user-owner-001", name: "Dealership Owner", email: "owner@demomotors.com", password: "admin123", role: "OWNER" as const, tenantId: "demo-motors-001", tenantName: "Demo Motors Lucknow" },
  { id: "user-manager-001", name: "Arjun Singh", email: "manager@demomotors.com", password: "admin123", role: "MANAGER" as const, tenantId: "demo-motors-001", tenantName: "Demo Motors Lucknow" },
  { id: "user-sales-001", name: "Pooja Verma", email: "sales@demomotors.com", password: "admin123", role: "SALES_EXEC" as const, tenantId: "demo-motors-001", tenantName: "Demo Motors Lucknow" },
  { id: "user-accounts-001", name: "Suresh Gupta", email: "accounts@demomotors.com", password: "admin123", role: "ACCOUNTANT" as const, tenantId: "demo-motors-001", tenantName: "Demo Motors Lucknow" },
];

async function authenticateFromDB(email: string, password: string) {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const bcrypt = await import("bcryptjs");

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.isActive) return null;

    let isValid = false;
    if (user.password.startsWith("$2")) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = user.password === password;
    }

    if (!isValid) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
    };
  } catch (error) {
    console.error("DB auth failed, using fallback:", (error as Error).message);
    return undefined; // undefined = DB error (try fallback), null = wrong creds
  }
}

function authenticateFromFallback(email: string, password: string) {
  const user = FALLBACK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as any,
    tenantId: user.tenantId,
    tenantName: user.tenantName,
  };
}

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

        // Try DB auth first
        const dbResult = await authenticateFromDB(
          credentials.email,
          credentials.password
        );

        if (dbResult !== undefined) {
          // DB was reachable
          if (dbResult === null) {
            throw new Error("Invalid email or password");
          }
          return dbResult;
        }

        // DB unreachable — use fallback
        const fallbackResult = authenticateFromFallback(
          credentials.email,
          credentials.password
        );

        if (!fallbackResult) {
          throw new Error("Invalid email or password");
        }

        return fallbackResult;
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
  secret:
    process.env.NEXTAUTH_SECRET ||
    "vaahan-erp-dev-secret-key-change-in-production",
};
