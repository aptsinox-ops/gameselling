// lib/validators/product.ts
import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2),
  categoryId: z.string().uuid("Please select a category"),
  image: z.string().optional(),
  
  // কাস্টম ট্যাগ হ্যান্ডেল করার নিয়ম: খালি থাকলে ডাটাবেসে null যাবে
  productTag: z.string().optional().transform(val => val === "" ? null : val),
  
  isFreeFireAuto: z.boolean().default(false),
  autoDeliveryWith: z.string().nullable(),
  categoryType: z.string(),
  ffNameChecker: z.boolean().default(false),
  
  // ডাইনামিক ফিল্ড স্ট্রিং অ্যারে হিসেবে থাকবে, পরে JSON.stringify হবে
  dynamicFields: z.array(z.string()).default(["Enter UID"]),
  
  rulesCondition: z.string().min(10, "Rules are required"),
  itemBottomText: z.string().optional(),
  footerLink: z.string().url().optional().or(z.literal("")),
});