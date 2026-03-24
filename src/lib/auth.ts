import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "@/lib/auth-types";

// Fallback demo users — used when DB is unreachable (serverless cold starts, etc.)
const FALLBACK_USERS = [
  { id: "user-super-admin", name: "Ravi (Super Admin)", email: "superadmin@vaahan.com", password: "super123", role: "SUPER_ADMIN" as const, tenantId: "tenant-platform", tenantName: "VaahanERP Platform" },
  { id: "user-bike-owner", name: "Rajesh Bajrang", email: "owner@bajrangmotors.com", password: "owner123", role: "OWNER" as const, tenantId: "", tenantName: "Shri Bajrang Motors" },
  { id: "user-bike-sales", name: "Amit Sharma", email: "sales@bajrangmotors.com", password: "sales123", role: "SALES_EXEC" as const, tenantId: "", tenantName: "Shri Bajrang Motors" },
  { id: "user-bike-mechanic", name: "Deepak Yadav", email: "mechanic@bajrangmotors.com", password: "mechanic123", role: "MECHANIC" as const, tenantId: "", tenantName: "Shri Bajrang Motors" },
  { id: "user-car-owner", name: "Vinod Sharma", email: "owner@sharmacars.com", password: "owner123", role: "OWNER" as const, tenantId: "", tenantName: "Sharma Cars" },
  { id: "user-car-sales", name: "Rohit Gupta", email: "sales@sharmacars.com", password: "sales123", role: "SALES_EXEC" as const, tenantId: "", tenantName: "Sharma Cars" },
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
