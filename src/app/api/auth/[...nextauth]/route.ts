import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-placeholder",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please fill in all fields correctly.");
        }

        const email = credentials.email.trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("No account found with this email.");
        }

        if (!user.password) {
          throw new Error(
            "This account was created with Google. Please login using Google!"
          );
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password! Please try again.");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          balance: Number(user.balance) || 0,
          phone: user.phone || "",
          role: user.role || "User",
          image: user.image || "",
        };
      },
    }),
  ],

  callbacks: {
    // 🟢 ১. SignIn Callback
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || "Google User",
              image: user.image || undefined,
            },
            create: {
              email: user.email,
              name: user.name || "Google User",
              image: user.image || null,
              balance: 0,
              role: "User",
              password: null,
              phone: null,
            },
          });
          console.log("✅ GOOGLE USER SAVED IN DATABASE:", user.email);
        } catch (error) {
          console.error("❌ PRISMA DATABASE ERROR:", error);
        }
      }
      return true;
    },

    // 🟢 ২. JWT Callback
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }

      if (token?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });

          if (dbUser) {
            token.id = dbUser.id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email; // 👈 নিশ্চিতভাবে ইমেইল রাখা হলো
            token.phone = dbUser.phone || "";
            token.balance = Number(dbUser.balance) || 0;
            token.role = dbUser.role || "User";
            token.picture = dbUser.image || token.picture;
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
        }
      }
      return token;
    },

    // 🟢 ৩. Session Callback
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name;
        session.user.email = (token.email as string) || session.user.email; // 👈 ইমেইল পাস নিশ্চিত করা হলো
        (session.user as any).phone = token.phone;
        (session.user as any).balance = token.balance;
        (session.user as any).role = token.role;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

// 🎯 ডেটাবেজ থেকে ডাইনামিক গুগল আইডি ও সিক্রেট নেওয়ার লজিক
async function getDynamicAuthOptions(): Promise<AuthOptions> {
  let dbSettings = null;
  try {
    dbSettings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error("Failed to fetch site settings in NextAuth:", error);
  }

  const googleClientId =
    dbSettings?.googleClientId?.trim() || process.env.GOOGLE_CLIENT_ID || "";
  const googleClientSecret =
    dbSettings?.googleClientSecret?.trim() || process.env.GOOGLE_CLIENT_SECRET || "";

  const updatedProviders = [...authOptions.providers];

  if (googleClientId && googleClientSecret) {
    const googleIndex = updatedProviders.findIndex((p) => p.id === "google");
    if (googleIndex !== -1) {
      updatedProviders[googleIndex] = GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      });
    }
  }

  return {
    ...authOptions,
    providers: updatedProviders,
  };
}

// 🎯 Next.js Request Handler
const handler = async (req: Request, ctx: any) => {
  const dynamicOptions = await getDynamicAuthOptions();
  return NextAuth(req as any, ctx, dynamicOptions);
};

export { handler as GET, handler as POST };