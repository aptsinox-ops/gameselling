import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

// 🟢 NextAuth Types - role যোগ করা হলো
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      balance: number;
      role: string; // 👈 role যোগ করা হয়েছে
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    balance: number;
    role: string; // 👈 role যোগ করা হয়েছে
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    balance: number;
    role: string; // 👈 role যোগ করা হয়েছে
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: (user as any).phone ?? null,
          balance: (user as any).balance ?? 0, 
          role: (user as any).role ?? "User", // 👈 DB থেকে role রিড করা হচ্ছে
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.balance = user.balance;
        token.role = user.role; // 👈 JWT-তে role সেভ হচ্ছে
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.phone = token.phone;
        session.user.balance = token.balance;
        session.user.role = token.role; // 👈 Session-এ role সেভ হচ্ছে
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};