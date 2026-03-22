import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Auth options for NextAuth.js with Credentials provider
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

        // TODO: Replace with actual DB lookup + bcrypt comparison
        // For now, allow demo login
        if (
          credentials.email === "admin@vaahan.com" &&
          credentials.password === "admin123"
        ) {
          return {
            id: "demo-user-1",
            name: "Admin User",
            email: "admin@vaahan.com",
            role: "OWNER",
            tenantId: "demo-tenant-1",
            tenantName: "Vaahan Motors",
          };
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Attach custom fields to the JWT token
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.role = u.role;
        token.tenantId = u.tenantId;
        token.tenantName = u.tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose custom fields in the session
      if (session.user) {
        const su = session.user as Record<string, unknown>;
        su.id = token.sub;
        su.role = token.role;
        su.tenantId = token.tenantId;
        su.tenantName = token.tenantName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
