import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ✅ DATABASE_URL অবশ্যই থাকতে হবে
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

// ✅ PostgreSQL connection pool তৈরি
const pool = new Pool({
  connectionString,
});

// ✅ Prisma adapter তৈরি
const adapter = new PrismaPg(pool);

// ✅ Singleton pattern ব্যবহার করে PrismaClient তৈরি
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: ["error", "warn"], // লগিং ঠিক আছে
  });
};

// ✅ Global declaration ঠিক করা
declare global {
  // Node.js globalThis এ prisma সংরক্ষণ
  // ReturnType<typeof prismaClientSingleton> টাইপ ঠিকভাবে ব্যবহার করা হয়েছে
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// ✅ Singleton instance export করা
export const prisma = globalThis.prisma ?? prismaClientSingleton();

// ✅ Development mode এ পুনরায় assign করা
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
